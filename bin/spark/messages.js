var sparkApi = require("./actions");

function createRoom(account, cb) {
    sparkApi.room.create(account.spark.accessToken, "Aerohive ACS", function (err, room) {
        var spark = account.spark;
        spark.roomId = room.id;
        Spark.update({ _id: spark._id }, spark, function (err, savedSpark) {
            if (err) console.log(err);
            else cb(roomId);
        });
    })
}

function getRoomId(account, cb) {
    if (!account.spark.roomId) sparkApi.room.list(account.spark.accessToken, function (err, res) {
        if (err) console.log(err);
        else if (res) {
            var roomExists = false;
            res.forEach(function (room) {
                if (room.title == "Aerohive ACS") {
                    var spark = account.spark;
                    roomExists = true;
                    spark.roomId = room.id;
                    Spark.update({ _id: spark._id }, spark, function (err, savedSpark) {
                        if (err) console.log(err);
                        else cb(roomId);
                    });
                }
            })
            if (!roomExists) createRoom(account, cb);
        } else createRoom(account, cb);
    })
    else cb(account.spark.roomId);
}

function send(account, message) {
    account.spark.forEach(function (sparkAccount) {
        getRoomId(account, function (roomId) {
            sparkApi.message.create(account.spark.accessToken)
        })
    })
}
function getText(device) {
    return "**S/N:** " + device.serialId + "\n\n**MAC Address: **" + device.macAddress + "\n\n**IP: **" + device.ip;
}
function getTitle(device) {
    var title;
    if (device.model.indexOf("AP") >= 0) return "Access Point " + device.hostName;
    else if (device.model.indexOf("SR") >= 0) return "Switch " + device.hostName;
    else return "Device " + device.hostName;
}
module.exports.deviceAdded = function (account, device) {
    var message = "# Account " + account.ownerId + " -- " + getTitle(device) + " had beed added to your HMNG account! \n\n" +
        getText(device)
    send(account, message);
}
module.exports.deviceRemoved = function (account, device) {
    var message = "# Account " + account.ownerId + " -- " + getTitle(device) + " had beed removed from your HMNG account!\n\n" +
        getText(device);
    send(account, message);
}
module.exports.deviceUpdated = function (account, device) {
    var title = getTitle(device);
    if (device.connected == true) title += " is now connected";
    else title += " is now disconnected";

    var message = "# Account " + account.ownerId + " -- " + title + "\n\n" +
        getText(device);
    send(account, message);
}

module.exports.error = function (account, error) {
    var message = {
        "attachments": [
            {
                "title": "Account " + account.ownerId + " -- Error while processing data",
                "color": "danger",
                "text": JSON.stringify(error)
            }
        ]
    };
    send(account, message);
}