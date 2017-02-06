var slackAccount = require("../config").slackAccount;
var devAccount = require("../config").devAccount;

var CronJob = require("cron").CronJob;
var API = require("./aerohive/api/main");
var Acs = require("./models/acs");
var Device = require("./models/devices");
var Slack = require("./models/slack");
var slackPost = require("./slack/req").POST;


function getText(device) {
    return "S/N: " + device.serialId + "\nMAC Address: " + device.macAddress + "\nIP: " + device.ip;
}

function getTitle(device) {
    var title;
    if (device.model.indexOf("AP") >= 0) return "Access Point " + device.hostName;
    else if (device.model.indexOf("SR") >= 0) return "Switch " + device.hostName;
    else return "Device " + device.hostName;

}
function getColor(device) {
    if (device.connected == true) return "good";
    else return "danger";
}

function getHost(slackAccount) {
    var slackHost = slackAccount.incoming_webhook.url.replace("https://", "").split("/")[0];
    var slackPath = slackAccount.incoming_webhook.url.replace('https://' + slackHost, '');
    return { slackHost: slackHost, slackPath: slackPath };
}

function updateDeviceStatus(account, device) {
    var title = getTitle(device);
    if (device.connected == true) title += " is now connected";
    else title += " is now disconnected";

    var message = {
        "attachments": [
            {
                "title": title,
                "color": getColor(device),
                "text": getText(device)
            }
        ]
    };
    account.slack.forEach(function (slackAccount) {
        var slack = getHost(slackAccount);
        slackPost(slack.slackHost, slack.slackPath, message, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
        })
    })
}

function deviceAdded(account, device) {
    var message = {
        "attachments": [
            {
                "title": getTitle(device) + " had beed added to your HMNG account!",
                "color": "#2196f3",
                "text": getText(device)
            }
        ]
    };
    account.slack.forEach(function (slackAccount) {
        var slack = getHost(slackAccount);
        slackPost(slack.slackHost, slack.slackPath, message, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
        })
    })
}
function deviceRemoved(account, device) {
    var message = {
        "attachments": [
            {
                "title": getTitle(device) + " had beed removed to your HMNG account!",
                "color": "warning",
                "text": getText(device)
            }
        ]
    };
    account.slack.forEach(function (slackAccount) {
        var slack = getHost(slackAccount);
        slackPost(slack.slackHost, slack.slackPath, message, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
        })
    })
}

function sendError(account, error) {    
    var message = {
        "attachments": [
            {
                "title": "Error while processing data",
                "color": "danger",
                "text": error
            }
        ]
    };
    account.slack.forEach(function (slackAccount) {
        var slack = getHost(slackAccount);
        slackPost(slack.slackHost, slack.slackPath, message, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
        })
    })
}

function checkDevices() {
    // Get ACS accounts
    Acs
        .find({})
        .populate("slack")
        .exec(function (err, accounts) {
            // Loop on ACS accounts
            accounts.forEach(function (account) {
                // Get Devices for the current ACS account
                Device
                    .find({ 'ownerId': account.ownerId })
                    .exec(function (err, devicesInDB) {
                        // Retrieve the devices status from ACS
                        API.monitor.devices.devices(account, devAccount, function (err, devices) {
                            if (err) sendError(account, err);
                            else {
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