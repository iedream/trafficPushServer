var express = require('express');
var router = express.Router();

var apn = require('apn');
var apnProvider = new apn.Provider({
    cert : __dirname + "/trafficPushCert.pem",
    key : __dirname + "/trafficPush.pem",
    production: false
});

var CronJob = require('cron').CronJob;

//var deviceToken;
//var userInfo = {};
    //"8A22947AEBE44234748012290E89DB4BB2C7EA9798B80E6ADCD86A0C99EFD055";

router.get('/', function(req, res, next) {

  res.send('respond with a resource');
});

/* GET users listing. */
router.post('/sendNotification/:device/', function(req, res, next) {
  console.log("Got into method");
  var deviceToken = req.params.device;
  var userInfo = req.body.userInfo;
  var timeDict = req.body.time;
  res.send("dict data " + userInfo + " time data " + timeDict + "body data " + req.body);
  console.log("dict data " + userInfo + " time data " + timeDict);
  console.log("distance: " + userInfo.distance + " time: " + timeDict.city);
  var timeZoneContinent = timeDict.continent;
  var timeZoneCity = timeDict.city;
  var timeDaysInWeek = timeDict.days;
  var time = timeDict.clock;
  var timeString = time + ' * * ' + timeDaysInWeek;
  var timeZone = timeZoneContinent + '/' + timeZoneCity;
  console.log('data: ' + timeString + ' ' + timeZone);
  res.end();
  var job = new CronJob({
    cronTime: timeString,
    onTick: function() {
      var notification = new apn.Notification();
      notification.topic = "Catherine.traffic2";
      notification.sound = "ping.aiff";
      notification.alert = "did";
      notification.contentAvailable = 1;
      notification.payload = userInfo;
      apnProvider.send(notification, deviceToken).then( result => {
        res.send(timeString + ' ' + timeZone);
      });
    },
    start: true,
    timeZone: timeZone
  });

  job.start();
});

module.exports = router;
