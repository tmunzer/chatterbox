var mongoose = require('mongoose');

var SlackSchema = new mongoose.Schema({
    ok: { type: Boolean, required: true },
    access_token: { type: String, required: true },
    scope: { type: String, required: true },
    user_id: { type: String, required: true },
    team_name: { type: String, required: true },
    team_id: { type: String, required: true },
    incoming_webhook: { 
        channel: { type: String, required: true },
        channel_id: { type: String, required: true },
        configuration_url: { type: String, required: true },
        url: { type: String, required: true },
    },
    created_at: { type: Date },
    updated_at: { type: Date }
});
 
var Slack = mongoose.model('Slack', SlackSchema);


// Pre save
SlackSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Slack;

