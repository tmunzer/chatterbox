var express = require('express');
var router = express.Router();
var OAuth = require("./../bin/spark/oauth");
var sparkAccount = require("../config").sparkAccount;
var Error = require("./../routes/error");

var SparkApi = require("./../bin/spark/actions");

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
                        if (sparkEntry
                            && sparkEntry.user_id == sparkData.user_id
                            && sparkEntry.type == sparkData.type) {
                            isPresent = true;
                            if (sparkEntry.roomId != sparkData.roomId) {
                                Spark.update({ _id: sparkEntry._id }, sparkData, function (err, savedData) {
                                    if (err) console.error("\x1b[31mERROR\x1b[0m:", err);
                                    else console.info("\x1b[32minfo\x1b[0m:", "Spark account saved");
                                })
                            }
                        }
                    })
                    if (!isPresent) Spark(sparkData).save(function (err, savedData) {
                        if (err) console.error("\x1b[31mERROR\x1b[0m:", err);
                        account.spark.push(savedData);
                        account.save(function (err, savedAccount) {
                            if (err) console.error("\x1b[31mERROR\x1b[0m:", err);
                            else console.info("\x1b[32minfo\x1b[0m:", "Spark account saved");
                        })
                    });

                } else console.error("\x1b[31mERROR\x1b[0m:", "not able to retrieve the Spark entry for this account");
            } else console.error("\x1b[31mERROR\x1b[0m:", "not able to retrieve the account");
        });
};


router.get('/oauth', function (req, res) {
    if (req.session.xapi) {
        if (req.query.error) {
            Error.render(req.query.error, "conf", req, res);
        } else if (req.query.code) {
            var authCode = req.query.code;
            OAuth.getPermanentToken(authCode, sparkAccount, function (data) {
                if (data.errors) Error.render(data.errors, "conf", req, res);
                else {
                    var sparkData = {
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                        expireAt: new Date().valueOf() + (data.expires_in * 1000),
                        refreshTokenExpiresAt: new Date().valueOf() + (data.refresh_token_expires_in * 1000)
                    };
                    SparkApi.user.me(sparkData.accessToken, function (err, user) {
                        if (err) Error.render(err, "conf", req, res);
                        else {
                            sparkData.user_id = user.id;
                            sparkData.emails = user.emails;
                            sparkData.displayName = user.displayName;
                            sparkData.nickName = user.nickName;
                            sparkData.type = user.type;
                            SparkApi.getUserRoomId(sparkData, function (err, roomId) {                                
                                sparkData.roomId = roomId;
                                saveSpark(req, res, sparkData);
                            })
                        }
                    })
                    res.redirect("/web-app");
                }
            });
        } else Error.render("Unknown error", "conf", req, res);
    } else res.redirect("/");
})



module.exports = router;