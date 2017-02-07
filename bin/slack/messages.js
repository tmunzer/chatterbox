
var slackPost = require("./req").POST;


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

function send(account, message) {
    account.slack.forEach(function (slackAccount) {
        var slack = getHost(slackAccount);
        slackPost(slack.slackHost, slack.slackPath, message, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
        })
    })
}

module.exports.deviceAdded = function (account, device) {
    var message = {
        "attachments": [
            {
                "title": "Account " + account.ownerId + " -- " + getTitle(device) + " had beed added to your HMNG account!",
                "color": "#2196f3",
                "text": getText(device)
            }
        ]
    };
    send(account, message);
}
module.exports.deviceRemoved = function (account, device) {
    var message = {
        "attachments": [
            {
                "title": "Account " + account.ownerId + " -- " + getTitle(device) + " had beed removed from your HMNG account!",
                "color": "warning",
                "text": getText(device)
            }
        ]
    };
    send(account, message);
}
module.exports.deviceUpdated = function (account, device) {
    var title = getTitle(device);
    if (device.connected == true) title += " is now connected";
    else title += " is now disconnected";

    var message = {
        "attachments": [
            {
                "title": "Account " + account.ownerId + " -- " + title,
                "color": getColor(device),
                "text": getText(device)
            }
        ]
    };
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