var express = require('express');
var router = express.Router();

var apn = require('apn');
var apnProvider = new apn.Provider({
    cert : __dirname + "/trafficPushCert.pem",
    key : __dirname + "/trafficPush.pem"
});
var deviceToken;
var userInfo = {};
    //"8A22947AEBE44234748012290E89DB4BB2C7EA9798B80E6ADCD86A0C99EFD055";

/* GET users listing. */
//'/sendNotification/:secondFromNow/:type/:source/:end/:name'
router.get('/sendNotification/:time/:device/:source/:end/:name/:type', function(req, res, next) {
  res.send('respond with a resource');
  var timePeriod = req.params.time * 1000;
  deviceToken = req.params.device;
  userInfo["source"] = req.params.source;
  userInfo["end"] = req.params.end;
  userInfo["name"] = req.params.name;
  userInfo["type"] = req.params.type;
  setTimeout(sendNotification, timePeriod);
});

function sendNotification() {
  var notification = new apn.Notification();
  notification.topic = "Catherine.traffic2";
  notification.sound = "ping.aiff";
  notification.alert = "did";
  notification.contentAvailable = 1;
  notification.payload = userInfo;
  apnProvider.send(notification, deviceToken).then( result => {
    var i = 4;
  });
}

module.exports = router;
