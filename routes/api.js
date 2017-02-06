var express = require('express');
var router = express.Router();

var Acs = require("../bin/models/acs");
/* GET users listing. */

router.get("/slack", function (req, res, next) {
    if (req.session.xapi) {
        Acs
            .findOne({ ownerId: req.session.xapi.ownerId, vpcUrl: req.session.xapi.vpcUrl, vhmId: req.session.xapi.vhmId })
            .populate("slack")
            .exec(function (err, accountInDb) {
                if (err) res.status(500).json({ error: err });
                else if (accountInDb) res.status(200).json({slack: accountInDb.slack});
                else res.status(404).json({ err: "Account no found" });
            });
    } else res.status(403).send('Unknown session');
});


module.exports = router;
