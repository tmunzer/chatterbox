
var mongoose = require('mongoose');

var DeviceSchema = new mongoose.Schema({
    ownerId: { type: String, required: true },
    deviceId: { type: String, required: true },
    macAddress: { type: String, required: true },
    hostName: { type: String, required: true },
    serialId: { type: String, required: true },
    model: { type: String, required: true },
    ip: { type: String,  default: "0.0.0.0" },
    connected: {type: Boolean, required: true},
    created_at: { type: Date },
    updated_at: { type: Date }
}, {usePushEach: true});

 
var Device = mongoose.model('Device', DeviceSchema);


// Pre save
DeviceSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Device;

