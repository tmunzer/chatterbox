
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
            if (err) cconsole.error("\x1b[31mERROR\x1b[0m:",err);
            else console.info("\x1b[32minfo\x1b[0m:",data);
        })
    })
}

function deviceAdded(account, devices) {
    var messages = { "attachments": [] };
    devices.forEach(function (device) {
        messages.attachments.push({
            "title": "Account " + account.ownerId + " -- " + getTitle(device) + " has beed added to your HMNG account!",
            "color": "#2196f3",
            "text": getText(device)
        })
    })
    send(account, messages);
}
function deviceRemoved(account, devices) {
    var messages = { "attachments": [] };
    devices.forEach(function (device) {
        messages.attachments.push({
            "title": "Account " + account.ownerId + " -- " + getTitle(device) + " has beed removed from your HMNG account!",
            "color": "warning",
            "text": getText(device)
        })
    })
    send(account, messages);
}
function deviceUpdated(account, devices) {
    var title;
    var messageConnected = { "attachments": [] };
    var messageDisconnected = { "attachments": [] };

    devices.forEach(function (device) {
        title = getTitle(device);
        if (device.connected == true) {
            title += " is now connected";
            messageConnected.attachments.push({
                "title": "Account " + account.ownerId + " -- " + title,
                "color": getColor(device),
                "text": getText(device)
            });
        } else {
            title += " is now disconnected";
            messageDisconnected.attachments.push({
                "title": "Account " + account.ownerId + " -- " + title,
                "color": getColor(device),
                "text": getText(device)
            });
        }

    })
    send(account, messageConnected);
    send(account, messageDisconnected);
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

module.exports.sendMessages = function (account, devices) {
    if (devices.added.length > 0) deviceAdded(account, devices.added);
    if (devices.removed.length > 0) deviceRemoved(account, devices.removed);
    if (devices.updated.length > 0) deviceUpdated(account, devices.updated);
}