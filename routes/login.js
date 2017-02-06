var express = require('express');
var router = express.Router();
var devAccount = require("../config").devAccount;
var slackAccount = require("../config").slackAccount;


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
        res.render('web-app', {
            title: 'ACS Chatterbox',
            slack_client_id: slackAccount.clientID
        });
    else {
        res.redirect("/login/");
    }
});

router.get('/logout/', function (req, res, next) {
    if (req.session.xapi){
    req.logout();
    req.session.destroy();
    res.redirect('/login/');
    } else res.redirect("/");
});
module.exports = router;