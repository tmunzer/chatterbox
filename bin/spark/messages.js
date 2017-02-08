var sparkApi = require("./actions");
var maxRetry = 5;

function sendWithRetry(sparkAccount, message, retry, cb) {
    if (retry < maxRetry)
        // try to get the roomId (this will create it and save it into the DB if needed)
        sparkApi.getUserRoomId(sparkAccount, function (err, roomId) {
            if (err) sendWithRetry(sparkAccount, message, retry + 1, cb);
            // try to send the message
            else sparkApi.message.create(sparkAccount.accessToken, { roomId: sparkAccount.roomId, markdown: message }, function (err, data) {
                if (err) sendWithRetry(sparkAccount, message, retry + 1, cb);
                //if the room doesn't exists anymore, create it again (this will create it and save it into the DB if needed)
                else if (data.errors && data.message == 'Could not find a room with provided ID.') {
                    sparkApi.createRoom(sparkAccount, function (err, room) {
                        sendWithRetry(sparkAccount, message, retry + 1, cb);
                    })
                } else cb(null);
            })
        })
    else cb("max retry reached");
}

function send(account, message, cb) {
    account.spark.forEach(function (sparkAccount) {
        sendWithRetry(sparkAccount, message, 0, cb);
    })
}
function getText(device) {
    return "**S/N:** " + device.serialId + "\n\n**MAC Address: **" + device.macAddress + "\n\n**IP: **" + device.ip;
}
function getTable(devices) {
    var status;
    var message = "| Serial Number | MAC Address | IP Address | Current Status |\n" +
        "| ------------- |:-----------:|:----------:|:--------------:|\n";
    devices.forEach(function (device) {
        if (filterStatus == undefined || filterStatus == device.connected) {
            if (device.connected) status = "Connected";
            else status = "Disconnected";
            message += "| " + device.serialId + " | " + device.macAddress + " | " + device.ip + " | " + status + " |\n";
        }
    })
    return message;
}
function getTitle(device) {
    var title;
    if (device.model.indexOf("AP") >= 0) return "Access Point " + device.hostName;
    else if (device.model.indexOf("SR") >= 0) return "Switch " + device.hostName;
    else return "Device " + device.hostName;
}
function deviceAdded(account, devices, cb) {
    if (devices.length > 0) {
        var message = "### Account " + account.ownerId + " -- Newly added devices to your HMNG account \n\n";
        devices.forEach(function (device) {
            message += "#### " + getTitle(device) + " has beed added!\n\n" +
                getText(device) + "\n\n --- \n\n";
        })
        send(account, message, cb);
    } else cb();
}
function deviceRemoved(account, devices, cb) {
    if (devices.length > 0) {
        var message = "### Account " + account.ownerId + " -- Newly removed devices to your HMNG account \n\n";
        devices.forEach(function (device) {
            message += "#### " + getTitle(device) + " has beed removed!\n\n" +
                getText(device) + "\n\n --- \n\n";
        })
        send(account, messages, cb);
    } else cb();
}
function deviceDisconnected(account, devices, cb) {
    var devicesNumber = 0;
    if (devices.length > 0) {
        var message = "### Account " + account.ownerId + " -- Disconnected Devices\n\n";
        devices.forEach(function (device) {
            if (device.connected == false) {
                devicesNumber++;
                message += "#### " + getTitle(device) + "\n\n" +
                    getText(device) + "\n\n --- \n\n";
            }
        })
        if (devicesNumber > 0) send(account, message, cb);
        else cb();
    } else cb();
}
function deviceConnected(account, devices, cb) {
    var devicesNumber = 0;
    if (devices.length > 0) {
        var message = "### Account " + account.ownerId + " -- Connected Devices\n\n";
        devices.forEach(function (device) {
            console.log(device);
            if (device.connected == true) {
                devicesNumber++;
                message += "#### " + getTitle(device) + "\n\n" +
                    getText(device) + "\n\n --- \n\n";
            }
        })
        if (devicesNumber > 0) send(account, message, cb);
        else cb();
    } else cb();
}

module.exports.error = function (account, error) {
    var message = "### Account " + account.ownerId + " -- Error while processing data\n\n" +
        JSON.stringify(error)
    send(account, message);
}

module.exports.sendMessages = function (account, devices) {
    // @TODO need changes:
    // #1: check if roomId is in the DB
    // #1.1 if not, create it
    // #1.2 if yes, check if the room still exists for the account
    // #1.2.1 if not, create it
    // #2 send messages
    deviceAdded(account, devices.added, function (err) {
        if (err) console.log(err);
        else
            deviceRemoved(account, devices.removed, function (err) {
                if (err) console.log(err);
                else
                    deviceDisconnected(account, devices.updated, function (err) {
                        if (err) console.log(err);
                        else
                            deviceConnected(account, devices.updated, function (err) {
                                if (err) console.log(err);
                            });
                    });
            });
    });
}