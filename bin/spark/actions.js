const req = require("./req");
module.exports.room = {
    list: function (sparkAccessToken, cb) {
        req.GET(sparkAccessToken, "/v1/rooms", function(err, rooms){cb(err, rooms)})
    },
    create: function (sparkAccessToken, title, cb) {
        req.POST(sparkAccessToken, "/v1/rooms", {title: title}, function(err, room){cb(err, room)})
    }
}
module.exports.message = {
    create: function(sparkAccessToken, message, cb) {
        req.POST(sparkAccessToken, "/v1/messages", message, function(err, message){cb(err, message)})
    }
}
module.exports.user = {
    me : function(sparkAccessToken, cb){
        req.GET(sparkAccessToken, "/v1/people/me", function (err, me) {cb(err, me)})
    }
}