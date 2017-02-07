var mongoose = require('mongoose');

var SparkSchema = new mongoose.Schema({
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expireAt: { type: Number, required: true },
    refreshTokenExpiresAt: { type: Number, required: true },    
    user_id: { type: String, required: true },
    emails: [{ type: String, required: true }],
    displayName: { type: String, required: true },
    nickName: { type: String, required: true },
    type: { type: String, required: true },
    created_at: { type: Date },
    updated_at: { type: Date }
});

var Spark = mongoose.model('Spark', SparkSchema);


// Pre save
SparkSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Spark;

