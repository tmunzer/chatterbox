var express = require('express');
var router = express.Router();
var OAuth = require("./../bin/slack/oauth");
var slackAccount = require("../config").slackAccount;
var Error = require("./../routes/error");

var Acs = require("../bin/models/acs");
var Slack = require("../bin/models/slack");

function saveSlack(req, res, slackConfig) {
    Acs
        .findOne({ ownerId: req.session.xapi.ownerId, vpcUrl: req.session.xapi.vpcUrl, vhmId: req.session.xapi.vhmId })
        .populate("slack")
        .exec(function (err, account) {
            if (err) res.status(500).json({ error: err });
            else if (account) {
                if (account.slack) {
                    var isPresent = false;
                    account.slack.forEach(function (slackEntry) {
                        if (slackEntry.user_id == slackAccount.user_id
                            && slackEntry.team_id == slackAccount.team_name
                            && slackEntry.incoming_webhook.channel == slackAccount.incoming_webhook.channel
                            && slackEntry.incoming_webhook.channel_id == slackAccount.incoming_webhook.channel_id) isPresent = true;
                    })
                    if (!isPresent) Slack(slackConfig).save(function (err, savedConfig) {
                        account.slack.push(savedConfig);
                        account.save(function (err, savedAccount) {
                            if (err) console.log(err);
                            else console.log("slack account saved");
                        })
                    });
                    
                } else console.log("not able to retrieve the slack entry for this account" );
            } else console.log("not able to retrieve the account");
        });
};

router.get('/', function (req, res) {
    res.render("slack");
})

router.get('/oauth', function (req, res) {
    if (req.session.xapi) {
        if (req.query.error) {
            Error.render(req.query.error, "conf", req, res);
        } else if (req.query.code) {
            var authCode = req.query.code;
            OAuth.getPermanentToken(authCode, slackAccount, function (data) {
                if (data.error) Error.render(data.error, "conf", req, res);
                else {
                    if (data.warning) console.log(data.warning);
                    if (data.ok) {
                        var slackData = data;
                        slackData.host = slackData.incoming_webhook.url.replace("https://", "").split("/")[0];
                        slackData.path = slackData.incoming_webhook.url.replace('https://' + slackData.host, '');
                        saveSlack(req, res, slackData);
                    }
                    res.render("web-app");
                }
            });
        } else Error.render("Unknown error", "conf", req, res);
    } else res.redirect("/");
})


module.exports = router;