// Implement your server in this file.
// We should be able to run your server with node src/server.js
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.static('../client/build'));

//import database functions
var database = require('./database.js');
var readDocument = database.readDocument;
var addDocument = database.addDocument;
var writeDocument = database.writeDocument;
var deleteDocument = database.deleteDocument;
var getCollection = database.getCollection;

app.get('/user/:userId/account_info', function(req, res) {
    // Add user authentication here (getUserIdFromToken())
    var body = req.body;
    //var userAuth = getUserIdFromToken(req.get('Authorization'));
    //if(userAuth === body.userId){
      var userId = parseInt(req.params.userId,10);
      res.status(201);
      res.send(getUserData(userId));
    //}
    //else{
    //   res.status(401).end();
    //}
});

//
// app.put('/user/:userId/account_info', function(req, res) {
//   var body = req.body;
//
//     // Check that the body is a string, and not something like a JSON object.
//
//     if (typeof(req.body) !== 'string') {
//       // 400: Bad request.
//       res.status(400).end();
//       return;
//     }
//     // Update text content of update.
//     feedItem.contents.contents = req.body;
//     writeDocument('database', feedItem);
//     res.send(getFeedItemSync(feedItemId));
//
// });


app.get('/user/:userId/playlists', function(req, res) {
    // Add user authentication here (getUserIdFromToken)
    var body = req.body;
    //var userAuth = getUserIdFromToken(req.get('Authorization'));
    //if(userAuth === body.userId){
      var userId = req.params.userId;
      res.status(201);
      res.send(getUserPlaylistData(userId));
    //}
    //else{
    //   res.status(401).end();
    //}
});

app.post('/createroom/:hostId', function(req, res) {
    var body = req.body;
    var hostId = req.params.hostId,
        roomId = body.roomId;

    //var userAuth = getUserIdFromToken(req.get('Authorization'));
    //if(userAuth === body.userId){
      if(!validateRoom(roomId) && !validateRoomHost(hostId)) {
          // create a new room with a host and room id
          res.send(createRoom(hostId, roomId));
          // redirect the host to the new room
          // res.redirect('/room/' + roomId);
      }
      else {

          var error = {
              message: "You cannot create a room that already exists or you are already a host for another room",
              success: false
          }

          res.send(error);
      }
    //}
    //else{
    //   res.status(401).end();
    //}
});

app.post('/joinroom/:userId', function(req, res) {
    var body = req.body;
    var roomId = body.roomId,
        userId = req.params.userId;

    //var userAuth = getUserIdFromToken(req.get('Authorization'));
    //if(userAuth === body.userId){
      if(validateRoom(roomId)) {
          // validate that the room exists
          var roomData = getRoomData(roomId);

          // add to the rooms document a new participant and take them to the room
          var userInRoom = false;
          for(var participant in roomData.participants) {
              if(userId == roomData.participants[participant]) {
                  userInRoom = true;
              }
          }

          if(!userInRoom) {
              roomData.participants.push(userId);
              writeDocument('rooms', roomData);
          }

          res.status(200);
          res.send(roomData);

      } else {
          res.status(400).end();
          res.send("Room does not exist");
      }
    //}
    //else{
    //   res.status(401).end();
    //}
});

app.post("/room/data",function(req, res) {
    var body = req.body;
    var roomId = body.roomId,
        roomData = getRoomData(roomId);

    //var userAuth = getUserIdFromToken(req.get('Authorization'));
    //if(userAuth === body.userId){
      res.status(201);
      res.send(roomData);
    //}
    //else{
    //   res.status(401).end();
    //}
});

app.post('/room/save', function(req, res) {
    console.log("Saving room playlist");
    var body = req.body,
        userId = body.userId,
        roomId = body.roomId,
        playlistName = body.playlistName,
        roomData = getRoomData(roomId).playlist,
        playlistsToSave = roomData.map((item) => "tracks/" + item.trackID);
    //var userAuth = getUserIdFromToken(req.get('Authorization'));
    //if(userAuth === body.userId){
      res.status(201);
      res.send(saveSongsAsPlayist(userId, playlistName, playlistsToSave));
    //}
    //else{
    //   res.status(401).end();
    //}
});

app.post('/room/:songId/new_song', function(req, res) {
    var body = req.body,
        roomId = body.roomId,
        songId = parseInt(req.params.songId),
        userThatAddedSong = body.userId;
    //var userAuth = getUserIdFromToken(req.get('Authorization'));
    //if(userAuth === body.userId){
      res.status(201);
      res.send(addSongToRoomPlaylist(roomId, userThatAddedSong, songId));
    //}
    //else{
    //   res.status(401).end();
    //}
});

app.post('/room/song_like', function(req, res) {
    var body = req.body,
        userId = body.userId,
        roomId = body.roomId,
        songId = body.songId;
    //var userAuth = getUserIdFromToken(req.get('Authorization'));
    //if(userAuth === body.userId){
      res.status(201);
      res.send(addLikeToSong(roomId, userId, songId));
    //}
    //else{
    //   res.status(401).end();
    //}
});

app.post('/room/participants', function(req, res)  {
    var body = req.body,
        roomId = body.roomId;
    //var userAuth = getUserIdFromToken(req.get('Authorization'));
    //if(userAuth === body.userId){
      res.status(201);
      res.send(getRoomParticipants(roomId));
    //}
    //else{
    //   res.status(401).end();
    //}
});

app.get('/song/:songId', function(req, res) {
    var body = req.body,
        songId = parseInt(req.params.songId);
    //var userAuth = getUserIdFromToken(req.get('Authorization'));
    //if(userAuth === body.userId){
      res.status(201);
      res.send(getSongMetadata(songId));
    //}
    //else{
    //   res.status(401).end();
    //}
});

// Reset database.
app.post('/resetdb', function(req, res) {
  console.log("Resetting database...");
  // This is a debug route, so don't do any validation.
  database.resetDatabase();
  // res.send() sends an empty response with status code 200
  res.send();
});

app.delete('/room/:roomid/participants/:participantid', function(req, res) {
  console.log("Deleting participant...");
  var roomId = parseInt(req.params.roomid, 10);
  var participantId = req.params.participantid;
  var room = readDocument('rooms', roomId);
  console.log(room);
  var participantIndex = room.participants.indexOf(participantId);
  if (participantIndex != -1) {
    room.participants.splice(participantIndex, 1);
    writeDocument('rooms', room);
  }
  console.log(room);
  res.send();
});

function getRoomParticipants(roomId) {
    var roomData = getRoomByAccessCode(roomId);
    var participantsIds = [];
    for(var id in roomData.participants) {
        participantsIds.push(roomData.participants[id]);
    }

    var participants = participantsIds.map((id) => {
        var userData = getUserData(id);
        return userData.firstname + " " + userData.lastname;
    });

    return {"participants": participants};
}

function addLikeToSong(roomId, userId, songId) {
    var roomData = getRoomData(roomId);

    if(!validateSongLikes(roomId, userId, songId)) {
        for(var song in roomData.playlist) {
            if(songId === roomData.playlist[song].trackID) {
                roomData.playlist[song].likes += 1
                roomData.playlist[song].userLikes.push(userId);
            }
        }
        writeDocument('rooms', roomData);
        return roomData;
    }
    else {
        return {message: "You can't like the same song more than once", success: false};
    }

}

function saveSongsAsPlayist(userId, playlistName, playlistsToSave) {
    if(!validatePlaylistName(userId, playlistName)) {
        var userData = readDocument("users", userId);
        userData.playlists[playlistName] = playlistsToSave;
        writeDocument('users', userData);
        return userData;
    }
    else {
        return {message: "Playlist already exists", success: false};
    }
}

function createRoom(hostId, roomId) {

    // update users roomHostID key in the users table
    var userAccountInfo = readDocument('users', hostId);
    userAccountInfo.roomHostID = roomId;
    writeDocument('users', userAccountInfo);

    // create a new empty room in the table
    var newRoomDocument = {
        "roomId": roomId,
        "host": hostId,
        "participants": [hostId],
        "playlists": []
    };
    var newRoom = addDocument('rooms', newRoomDocument);

    return newRoom;
}

function getUserIdFromToken(authorizationLine) {
  try {
    var token = authorizationLine.slice(7);
    var regularString = new Buffer(token, 'base64').toString('utf8');
    var tokenObj = JSON.parse(regularString);
    var id = tokenObj['id'];
    if (typeof id === 'number') {
      return id;
    } else {
      return -1;
    }
  } catch (e) {
    return -1;
  }
}

function getUserPlaylistData(userId) {
    var playlist = readDocument('users', userId).playlists
    return playlist;
}

function getUserData(userId) {
    return readDocument('users', userId);
}

function getSongsData(songId) {
    return readDocument('songs', songId);
}

function getRoomData(roomId) {
    return getRoomByAccessCode(roomId);
}

function addSongToRoomPlaylist(roomId, userId, songId) {
    var roomData = getRoomData(roomId);
    if(!validateSongsInRoomPlaylist(roomId, songId)) {
        var songDocument = {
            trackID: songId,
            likes: 1,
            userLikes: [userId]
        }
        roomData.playlist.push(songDocument);
        writeDocument('rooms', roomData);
        return songDocument;
    }
    else {
        return "Song already in the playlist";
    }
}

function validateRoom(roomId) {
    var roomCollection = getCollection('rooms');
    var roomIds = Object.keys(roomCollection).map((item) => roomCollection[item].roomId);
    for(var id in roomIds) {
        if(roomIds[id] === roomId) return true;
    }
    return false;
}

function validateSongsInRoomPlaylist(roomId, songId) {
    var roomData = getRoomData(roomId);
    for(var songs in roomData.playlist) {
        var checkSong = roomData.playlist[songs].trackID;
        if(checkSong === songId) return true;
    }
    return false;
}

function validateSongLikes(roomId, userId, songId){
  var roomData = getRoomData(roomId);
  for (var song in roomData.playlist){
    if(songId === roomData.playlist[song].trackID){
        for(var user in roomData.playlist[song].userLikes) {
            if(userId == roomData.playlist[song].userLikes[user]) {
                return true;
            }
        }
    }
  }
  return false;
}

function validatePlaylistName(userId, playlistName) {
    var userData = getUserData(userId);
    for(var plName in userData.playlists) {
        if(playlistName === plName) {
            return true;
        }
    }
    return false;
}

function validateRoomHost(hostId) {
    var rooms = getCollection('rooms');
    for(var room in rooms) {
        if(rooms[room].host === hostId) {
            return true;
        }
    }
    return false;
}

function getRoomByAccessCode(code) {
    var rooms = getCollection('rooms');
    for(var room in rooms) {
        if(rooms[room].roomId == code) {
            return rooms[room];
        }
    }
}

function getSongMetadata(songId) {
    SC.initialize({
        client_id: 'd0cfb4e9bb689b898b7185fbd6d13a57'
    });

    return SC.get("tracks/" + songId);
}

// Starts the server on port 3000!
app.listen(3000, function () {
    console.log('Soundroom app listening on port 3000!');
});
