var express = require('express');
var router = express.Router();
const devAccount = require("../config").devAccount;
const slackAccount = require("../config").slackAccount;
const sparkAccount = require("../config").sparkAccount;
const querystring = require('querystring');

/*================================================================
 ROUTES
 ================================================================*/
/*================================================================
 DASHBOARD
 ================================================================*/
router.get('/login/', function (req, res, next) {
    if (req.session.xapi) res.redirect("/web-app/");
    else {
        var errorcode;
        if (req.query.errorcode) errorcode = req.query["errorcode"];
        res.render('login', {
            title: 'ACS Chatterbox',
            errorcode: errorcode,
            client_id: devAccount.clientID,
            redirect_uri: devAccount.redirectUrl
        });
    }
});

router.get('/web-app/', function (req, res, next) {
    if (req.session.xapi)
        require('crypto').randomBytes(24, function (err, buffer) {
            req.session.state = buffer.toString('hex');
            var spark_url = querystring.stringify({
                client_id: sparkAccount.clientID,
                response_type: 'code',
                redirect_uri: sparkAccount.redirectUrl,
                scope: sparkAccount.scope,
                state: req.session.state
            })
            var slack_url = querystring.stringify({
                client_id: slackAccount.clientID,
                redirect_uri: slackAccount.redirectUrl,
                scope: slackAccount.scope,
                state: req.session.state
            })
            res.render('web-app', {
                title: 'ACS Chatterbox',
                slack_url: "https://slack.com/oauth/authorize?" + slack_url,
                spark_url: "https://api.ciscospark.com/v1/authorize?" + spark_url
            });
        });
    else {
        res.redirect("/login/");
    }
});

router.get('/logout/', function (req, res, next) {
    if (req.session.xapi) {
        req.session.destroy();
        res.redirect('/login/');
    } else res.redirect("/");
});
module.exports = router;
