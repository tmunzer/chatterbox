var sparkApi = require("./actions");
var Spark = require("./../models/spark");

function send(account, message) {
    account.spark.forEach(function (sparkAccount) {
        sparkApi.getUserRoomId(sparkAccount, function (err, roomId) {
            if (err) console.log(err);
            else sparkApi.message.create(sparkAccount.accessToken, { roomId: sparkAccount.roomId, markdown: message }, function (err, data) {
                if (err) console.log("ERR", err);
                //@TODO need to create only one room!!!
                else if (data.errors && data.message == 'Could not find a room with provided ID.') {
                    sparkApi.room.create(sparkAccount.accessToken, "Aerohive ACS", function (err, room) {
                        Spark.update({_id: sparkAccount._id}, {roomId: room.id}, function(err, newRoom){
                            sparkApi.message.create(sparkAccount.accessToken, { roomId: room.id, markdown: message }, function (err, data) {
                                console.log(err, data);
                            })
                        })
                    })
                }
            })
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
    var message = "### Account " + account.ownerId + " -- " + getTitle(device) + " had beed added to your HMNG account! \n\n" +
        getText(device)
    send(account, message);
}
module.exports.deviceRemoved = function (account, device) {
    var message = "### Account " + account.ownerId + " -- " + getTitle(device) + " had beed removed from your HMNG account!\n\n" +
        getText(device);
    send(account, message);
}
module.exports.deviceUpdated = function (account, device) {
    var title = getTitle(device);
    if (device.connected == true) title += " is now connected";
    else title += " is now disconnected";

    var message = "### Account " + account.ownerId + " -- " + title + "\n\n" +
        getText(device);
    send(account, message);
}

module.exports.error = function (account, error) {
    var message = "### Account " + account.ownerId + " -- Error while processing data\n\n" +
        JSON.stringify(error)
    send(account, message);
}