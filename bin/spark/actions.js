const req = require("./req");
var sparkRoom = {
    list: function (sparkAccessToken, cb) {
        req.GET(sparkAccessToken, "/v1/rooms", function(err, rooms){cb(err, rooms)})
    },
    create: function (sparkAccessToken, title, cb) {
        req.POST(sparkAccessToken, "/v1/rooms", {title: title}, function(err, room){cb(err, room)})
    }
}
var sparkMessage = {
    create: function(sparkAccessToken, message, cb) {
        req.POST(sparkAccessToken, "/v1/messages", message, function(err, message){cb(err, message)})
    }
}
var sparkUser = {
    me : function(sparkAccessToken, cb){
        req.GET(sparkAccessToken, "/v1/people/me", function (err, me) {cb(err, me)})
    }
}

var getUserRoomId = function (sparkData, cb) {
    console.log("==");
    console.log(sparkData);
    if (sparkData.roomId) cb(null, sparkData.roomId);
    else sparkRoom.list(sparkData.accessToken, function (err, rooms) {
        if (err) console.log(err);
        else if (rooms) {
            console.log(rooms);
            var roomExists = false;
            sparkRoom.items.forEach(function (room) {
                if (room.title == "Aerohive ACS") {
                    roomExists = true;
                    cb(null, room.id);
                }
            })
            if (!roomExists) createRoom(sparkData.accessToken, cb);
        } else createRoom(sparkData.accessToken, cb);
    })
}
function createRoom(sparkAccessToken, cb) {
    sparkRoom.create(sparkAccessToken, "Aerohive ACS", function (err, room) {
        cb(err, room.id);
    })
}

module.exports.room = sparkRoom;
module.exports.message = sparkMessage;
module.exports.user = sparkUser;
module.exports.getUserRoomId = getUserRoomId;