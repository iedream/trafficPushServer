var express = require('express');
var router = express.Router();

var apn = require('apn');
var apnProvider = new apn.Provider({
    cert : __dirname + "/trafficPushCert.pem",
    key : __dirname + "/trafficPush.pem",
    production: false
});

var CronJob = require('cron').CronJob;

var notificationDict = {};

//var deviceToken;
//var userInfo = {};
    //"8A22947AEBE44234748012290E89DB4BB2C7EA9798B80E6ADCD86A0C99EFD055";

router.delete('/:time', function(req, res, next) {
  var timeString = convertToTimeString(req.body.time);
  //res.send('respond with a resource: ' + timeString);
});

router.delete('/cancelNotification/:device/:name/:time', function(req, res, next) {
  console.log("name: " + req.params.name + " time: " + req.params.time);
  var key = req.params.device + req.params.name + req.params.time;
  console.log("Get key: " + key);
  var job = notificationDict[key];
  if (!job) {
    res.status(422).send({"error":"Missing Job"});
  } else {
    job.stop();
    delete notificationDict[key];
    var finalTimeString = convertToTimeString(req.params.time);
    var returnString =  "route: " + req.params.name + " time: " + finalTimeString + " is successfully canceled";
    res.status(200).send({"message":returnString});
  }
});

/* GET users listing. */
router.post('/sendNotification/:device/', function(req, res, next) {
  var deviceToken = req.params.device;
  var userInfo = req.body.userInfo;
  var timeDict = req.body.time;

  var timeZoneContinent = timeDict.continent;
  var timeZoneCity = timeDict.city;
  var timeDaysInWeek = timeDict.days;
  var time = timeDict.clock;

  var timeString = time + ' * * ' + timeDaysInWeek;
  var timeZone = timeZoneContinent + '/' + timeZoneCity;

  var job = new CronJob({
    cronTime: timeString,
    onTick: function() {
      var notification = new apn.Notification();
      notification.topic = "Catherine.traffic2";
      notification.sound = "ping.aiff";
      notification.alert = "got alert";
      notification.contentAvailable = 1;
      notification.payload = userInfo;
      apnProvider.send(notification, deviceToken).then( result => {
      });
    },
    start: true,
    timeZone: timeZone
  });

  var timeString = time + ',' + timeDaysInWeek;
  var finalTimeString = convertToTimeString(timeString);
  var returnString =  "route: " + userInfo.name + " time: " + finalTimeString + " is successfully scheduled";

  var key = req.params.device + userInfo.name + timeString;
  console.log("Save key: " + key);
  notificationDict[key] = job;
  job.start();

  res.status(200).send({"message":returnString});
});

function convertToTimeString(timeString) {
  var timeArray = timeString.split(',');
  var clockArray = timeArray[0].split(' ');

  var timeString = clockArray[2] + ':' + clockArray[1];

  var dayString;
  if (timeArray.indexOf('1') != -1 && timeArray.indexOf('2') != -1 && timeArray.indexOf('3') != -1 && timeArray.indexOf('4') != -1 && timeArray.indexOf('5') != -1 && timeArray.indexOf('6') != -1 && timeArray.indexOf('7') != -1) {
    dayString = "Everyday";
  } else if (timeArray.indexOf('1') != -1 && timeArray.indexOf('2') != -1 && timeArray.indexOf('3') != -1 && timeArray.indexOf('4') != -1 && timeArray.indexOf('5') != -1) {
    dayString = "Weekdays";
  } else if (timeArray.indexOf('6') != -1 && timeArray.indexOf('7') != -1) {
    dayString = "Weekend";
  } else {
    if (timeArray.indexOf('1') != -1) {
      dayString = "Monday, ";
    } else if (timeArray.indexOf('2') != -1) {
      dayString += "Tuesday, ";
    } else if (timeArray.indexOf('3') != -1) {
      dayString += "Wednesday, ";
    } else if (timeArray.indexOf('4') != -1) {
      dayString += "Thursday, ";
    } else if (timeArray.indexOf('5') != -1) {
      dayString += "Friday, ";
    } else if (timeArray.indexOf('6') != -1) {
      dayString += "Saturday, ";
    } else if (timeArray.indexOf('7') != -1) {
      dayString += "Sunday, ";
    }
    dayString = dayString.slice(0, -2);
  }

  var finalTime = timeString + ',' + dayString;

  return finalTime;
}

module.exports = router;
