var express = require('express');
var router = express.Router();
var OAuth = require("./../bin/spark/oauth");
var sparkAccount = require("../config").sparkAccount;
var Error = require("./../routes/error");

var Acs = require("../bin/models/acs");
var Spark = require("../bin/models/spark");

function saveSpark(req, res, sparkData) {
    Acs
        .findOne({ ownerId: req.session.xapi.ownerId, vpcUrl: req.session.xapi.vpcUrl, vhmId: req.session.xapi.vhmId })
        .populate("spark")
        .exec(function (err, account) {
            if (err) res.status(500).json({ error: err });
            else if (account) {
                if (account.spark) {
                    var isPresent = false;
                    account.spark.forEach(function (sparkEntry) {
                        if (sparkEntry.user_id == sparkAccount.user_id
                            && sparkEntry.team_id == sparkAccount.team_name
                            && sparkEntry.incoming_webhook.channel == sparkAccount.incoming_webhook.channel
                            && sparkEntry.incoming_webhook.channel_id == sparkAccount.incoming_webhook.channel_id) isPresent = true;
                    })
                    if (!isPresent) Slack(sparkData).save(function (err, savedData) {
                        account.slack.push(savedData);
                        account.save(function (err, savedAccount) {
                            if (err) console.log(err);
                            else console.log("slack account saved");
                        })
                    });
                    
                } else console.log("not able to retrieve the slack entry for this account" );
            } else console.log("not able to retrieve the account");
        });
};

function getUserInfo(req, res, sparkConfig){

}

router.get('/', function (req, res) {
    res.render("slack");
})

router.get('/oauth', function (req, res) {
    if (req.session.xapi) {
        if (req.query.error) {
            Error.render(req.query.error, "conf", req, res);
        } else if (req.query.code) {
            var authCode = req.query.code;
            OAuth.getPermanentToken(authCode, sparkAccount, function (data) {
                if (data.errors) Error.render(data.errors, "conf", req, res);
                else {                
                        var sparkData = data;
                        sparkData.expireAt = new Date().valueOf() + (data.expires_in * 1000);
                        sparkData.refreshTokenExpiresAt = new Date().valueOf() + (data.refresh_token_expires_in * 1000);
                        saveSpark(req, res, sparkData);                    
                    res.redirect("/web-app");
                }
            });
        } else Error.render("Unknown error", "conf", req, res);
    } else res.redirect("/");
})



module.exports = router;