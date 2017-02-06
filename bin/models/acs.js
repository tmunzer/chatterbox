var mongoose = require('mongoose');
var Slack = require('./slack');

var AcsSchema = new mongoose.Schema({
    ownerId: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    vpcUrl: { type: String, required: true },
    vhmId: { type: String, required: true },
    expireAt: { type: String, required: true },
    slack: [{ type: mongoose.Schema.ObjectId, ref: "Slack" }],
    created_at: { type: Date },
    updated_at: { type: Date }
});

var Acs = mongoose.model('Acs', AcsSchema);


// Pre save
AcsSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Acs;

