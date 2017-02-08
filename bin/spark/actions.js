const req = require("./req");
var Spark = require("./../models/spark");

var sparkRoom = {
    list: function (sparkAccessToken, cb) {
        req.GET(sparkAccessToken, "/v1/rooms", function (err, rooms) { cb(err, rooms) })
    },
    create: function (sparkAccessToken, title, cb) {
        req.POST(sparkAccessToken, "/v1/rooms", { title: title }, function (err, room) { cb(err, room) })
    }
}
var sparkMessage = {
    create: function (sparkAccessToken, message, cb) {
        req.POST(sparkAccessToken, "/v1/messages", message, function (err, message) { cb(err, message) })
    }
}
var sparkUser = {
    me: function (sparkAccessToken, cb) {
        req.GET(sparkAccessToken, "/v1/people/me", function (err, me) { cb(err, me) })
    }
}

var saveUserRoomId = function (sparkAccount, roomId, cb) {
    sparkAccount.roomId = roomId;
    Spark.update({ _id: sparkAccount._id }, sparkAccount, function (err, newRoom) {
        cb(err, roomId);
    })
}

var getUserRoomId = function (sparkAccount, cb) {
    // try to get the roomId from DB
    if (sparkAccount.roomId) cb(null, sparkAccount.roomId);
    // else try to find the roomId from the spark API 
    else sparkRoom.list(sparkAccount.accessToken, function (err, rooms) {
        if (err) cb(err);
        // if users has rooms
        else if (rooms) {
            var roomExists = false;
            sparkRoom.items.forEach(function (room) {
                if (room.title == "Aerohive ACS") {
                    roomExists = true;
                    // if we find the room, save it into the DB
                    saveUserRoomId(sparkAccount, room.id, cb);
                }
            })
            // if user has no room "Aerohive ACS", create it (it will save it to the DB)
            if (!roomExists) createRoom(sparkAccount, cb);
        // if user has no rooms, create ours (it will save it to the DB)
        } else createRoom(sparkAccount, cb);
    })
}
function createRoom(sparkAccount, cb) {
    console.log("=====");
    console.log(sparkAccount);
    sparkRoom.create(sparkAccount.accessToken, "Aerohive ACS", function (err, room) {
        // if the spark account already exists into the DB, add the roomId to it
        if (sparkAccount._id) saveUserRoomId(sparkAccount, room.id, cb);
        // otherwise, just return the roomId
        else cb(err, room.id);
    })
}

module.exports.room = sparkRoom;
module.exports.message = sparkMessage;
module.exports.user = sparkUser;
module.exports.getUserRoomId = getUserRoomId;
module.exports.createRoom = createRoom;