var express = require('express');
var router = express.Router();
var OAuth = require("../bin/aerohive/api/oauth");
var devApp = require('../config.js').devAccount;
var slackApp = require('../config.js').slackAccount;
var Acs = require('../bin/models/acs');
var Error = require('../routes/error');

/*================================================================
 ADMIN ACS OAUTH
 ================================================================*/
router.get('/reg', function (req, res) {
    if (req.query.error) Error.render(
        { status: 401, message: "OAuth process error. The authorization server responded " + req.query.error },
        req.originalUrl,
        req,
        res);
    else if (req.query.authCode) {
        var authCode = req.query.authCode;
        OAuth.getPermanentToken(authCode, devApp, function (data) {
            if (data.error) Error.render(
                { status: 401, message: "OAuth process error. The authorization didn't validated the authorization code: " + req.query.error },
                req.originalUrl,
                req,
                res);
            else if (data.data) {
                var numAccounts = 0;
                for (var owner in data.data) {
                    var account = {
                        ownerId: data.data[owner].ownerId,
                        accessToken: data.data[owner].accessToken,
                        refreshToken: data.data[owner].refreshToken,
                        vpcUrl: data.data[owner].vpcUrl.replace("https://", ""),
                        vhmId: data.data[owner].vhmId,
                        expireAt: data.data[owner].expireAt,
                        userGroupId: 0
                    }
                    numAccounts++;
                }
                if (numAccounts == 1) {
                    Acs.
                        findOne({ ownerId: account.ownerId, vpcUrl: account.vpcUrl, vhmId: account.vhmId })
                        .exec(function (err, accountInDb) {
                            if (err) Error.render(
                                { status: 500, message: err },
                                req.originalUrl,
                                req,
                                res);
                            else if (accountInDb) {
                                accountInDb.accessToken = account.accessToken;
                                accountInDb.refreshToken = account.refreshToken;
                                accountInDb.expireAt = account.expireAt;
                                accountInDb.save(function (err, account) {
                                    if (err) Error.render(
                                        { status: 500, message: err },
                                        req.originalUrl,
                                        req,
                                        res);
                                    else {
                                        req.session.xapi = {
                                            rejectUnauthorized: true,
                                            vpcUrl: account.vpcUrl,
                                            ownerId: account.ownerId,
                                            accessToken: account.accessToken,
                                            vhmId: account.vhmId
                                        };
                                        req.session.account = account;
                                        res.redirect('/web-app/');
                                    }
                                })
                            }
                            else {
                                Acs(account).save(function (err, account) {
                                    if (err) Error.render(
                                        { status: 500, message: err },
                                        req.originalUrl,
                                        req,
                                        res);
                                    else {
                                        req.session.xapi = {
                                            rejectUnauthorized: true,
                                            vpcUrl: account.vpcUrl,
                                            ownerId: account.ownerId,
                                            accessToken: account.accessToken,
                                            vhmId: account.vhmId
                                        };
                                        req.session.account = account;
                                        res.redirect('/web-app/');
                                    }
                                })
                            }
                        })

                }
                else Error.render(
                    { status: 500, message: "unable to save data..." },
                    req.originalUrl,
                    req,
                    res);
            }
        });
    } else Error.render(
            { status: 500, message: "Unable to retrieve the authorization code from the authorization server" },
            req.originalUrl,
            req,
            res);
});


module.exports = router;
