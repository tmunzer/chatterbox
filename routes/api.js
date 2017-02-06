var express = require('express');
var router = express.Router();

var Acs = require("../bin/models/acs");
var Slack = require("../bin/models/slack");
/* GET users listing. */

router.get("/slack", function (req, res, next) {
    if (req.session.xapi) {
        Acs
            .findOne({ ownerId: req.session.xapi.ownerId, vpcUrl: req.session.xapi.vpcUrl, vhmId: req.session.xapi.vhmId })
            .populate("slack")
            .exec(function (err, accountInDb) {
                if (err) res.status(500).json({ error: err });
                else if (accountInDb) res.status(200).json({ slack: accountInDb.slack });
                else res.status(404).json({ err: "Account no found" });
            });
    } else res.status(403).send('Unknown session');
});
router.delete("/slack", function (req, res) {
    if (req.session.xapi) {
        if (req.query.ids) {
            var ids = req.query.ids;
            if (typeof ids == "string") ids = [ids];
            Acs
                .findOne({ ownerId: req.session.xapi.ownerId, vpcUrl: req.session.xapi.vpcUrl, vhmId: req.session.xapi.vhmId })
                .populate("slack")
                .exec(function (err, account) {
                    ids.forEach(function (id) {
                        account.slack.remove(id);
                        Slack.findById(id).remove(function(err){
                            if (err) console.log(err);
                        })
                    })
                    account.save(function (err) {
                        if (err) res.status(500).json(err);
                        else res.status(200).json({ status: 'done' });
                    });
                })
        } else res.status(403).send('missing ids');
    } else res.status(403).send('Unknown session');
})

module.exports = router;
