var slackAccount = require("../config").slackAccount;
var devAccount = require("../config").devAccount;

var CronJob = require("cron").CronJob;
var API = require("./aerohive/api/main");
var Acs = require("./models/acs");
var Device = require("./models/devices");
var Slack = require("./models/slack");
var Spark = require("./models/spark");
var slackMessage = require("./slack/messages");
var sparkMessage = require("./spark/messages");




function updateDeviceStatus(account, device) {
    slackMessage.deviceUpdated(account, device);
    sparkMessage.deviceUpdated(account, device);
}

function deviceAdded(account, device) {
    slackMessage.deviceAdded(account, device);
    sparkMessage.deviceAdded(account, device);
}
function deviceRemoved(account, device) {
    slackMessage.deviceRemoved(account, device);
    sparkMessage.deviceRemoved(account, device);
}

function sendError(account, error) {
    slackMessage.error(account, error);
    sparkMessage.error(account, error);
}

function checkDevices() {
    // Get ACS accounts
    Acs
        .find({})
        .populate("slack")
        .populate("spark")
        .exec(function (err, accounts) {
            // Loop on ACS accounts
            if (err) sendError(account, err);
            else accounts.forEach(function (account) {
                // Get Devices for the current ACS account
                Device
                    .find({ 'ownerId': account.ownerId })
                    .exec(function (err, devicesInDB) {
                        // Retrieve the devices status from ACS
                        if (err) sendError(account, err);
                        // only request ACS data if a Slack account or a Spark account are configured
                        else if ((account.slack && account.slack.length > 0) || (account.spark && account.spark.length > 0))
                            API.monitor.devices.devices(account, devAccount, function (err, devices) {
                                if (err) sendError(account, err);
                                else {
                                    console.log(" -- Account " + account.ownerId + " has " + devices.length + " devices");
                                    // for each device from ACS
                                    devices.forEach(function (device) {
                                        // filter on REAL devices
                                        if (device.simType.indexOf("REAL") >= 0) {
                                            var isPresent = false;
                                            // retrieve the current device from ACS into the devoce from DB                                                                                
                                            devicesInDB.forEach(function (deviceInDB) {
                                                if (device.deviceId == deviceInDB.deviceId) {
                                                    // mark the current device as 'present in Db' (will not add it later)
                                                    isPresent = true
                                                    // mark the current deviceInDB as 'present in ACS' (will not remove it later)
                                                    deviceInDB.present = true;
                                                    // check the status change
                                                    if (device.connected != deviceInDB.connected)
                                                        Device.update({ _id: deviceInDB._id }, device, function (err, savedDevice) {
                                                            if (err) sendError(account, err);
                                                            else updateDeviceStatus(account, device)
                                                        })
                                                }
                                            })
                                            // save the new device into DB
                                            if (!isPresent) Device(device).save(function (err, savedDevice) {
                                                if (err) sendError(account, err);
                                                else deviceAdded(account, device)
                                            })
                                        }
                                    })
                                    devicesInDB.forEach(function (deviceInDB) {
                                        if (!deviceInDB.present)
                                            Device.find({ _id: deviceInDB._id }).remove(function (err) {
                                                if (err) sendError(account, err);
                                                else deviceRemoved(account, deviceInDB)
                                            });
                                    })
                                }
                            })
                    });
            })
        });
}

module.exports.devices = function () {
    //===============CREATE CRON=================
    console.log("=============");
    console.log("init turn");
    checkDevices();
    try {
        new CronJob({
            cronTime: "0 */1 * * * *",
            onTick: function () {
                console.log("=============");
                console.log("new turn");
                checkDevices();
            },
            start: true
        });
    } catch (ex) {
        logger.warn("cron pattern not valid");
    }
}