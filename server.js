var express = require('express');
var path = require('path');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var uuid = require('node-uuid');

var users = 0;
var videoID;
var uuidCurr;

var uid;

var sessions = [];

// Firebase Configuration
var admin = require("firebase-admin");
var serviceAccount = require("./foxpad-44db4-firebase-adminsdk.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://foxpad-44db4.firebaseio.com"
});

// Port Configuration
var port = process.env.PORT || 3000
http.listen(port);

app.get('/', function (req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.send('All good here :)');
});

// Session Configuration
// var cookieparser = require('cookie-parser');
// var session = require('express-session');
// var MemoryStore = require('memorystore')(session);
// var store = new MemoryStore({
//   checkPeriod: 86400000 // prune expired entries every 24h
// });
// var parseCookie = cookieparser("my-secret");
// var currSession = session({
//   secret: "my-secret",
//   resave: true,
//   saveUninitialized: true,
//   store: store,
// });

// app.use(currSession);

// var sharedsession = require("express-socket.io-session");
// io.use(sharedsession(currSession));

// io.set('authorization', function (handshake, callback) {
//   if (handshake.headers.cookie) {
//     // pass a req, res, and next as if it were middleware
//     parseCookie(handshake, null, function (err) {
//       handshake.sessionID = handshake.signedCookies['connect.sid'];
//       // or if you don't have signed cookies
//       handshake.sessionID = handshake.cookies['connect.sid'];

//       store.get(handshake.sessionID, function (err, session) {
//         if (err || !session) {
//           // if we cannot grab a session, turn down the connection
//           callback('Session not found.', false);
//         } else {
//           // save the session data and accept the connection
//           handshake.session = session;
//           callback(null, true);
//         }
//       });
//     });
//   } else {
//     return callback('No session.', false);
//   }
//   callback(null, true);
// });

// IO Handlers
io.on('connection', (socket) => {
  console.log("a user connected");
  users += 1;
  console.log("# of users: " + users);


  socket.on("disconnect", () => {
    console.log("a user disconnected");
    users -= 1;
    console.log("# of users: " + users);
  });
  socket.on("login", (data) => {
    admin.auth().verifyIdToken(data)
      .then(function (decodedToken) {
        uid = decodedToken.uid;
        // socket.handshake.session.userdata = uuid.v4();
        // socket.handshake.session.save();
      }).catch(function (error) {
        console.log(error);
      });
  });
  socket.on("logout", () => {
    // if (socket.handshake.session.userdata) {
    //   uid = null;
    //   delete socket.handshake.session.userdata;
    //   socket.handshake.session.save();
    // }
  });
  socket.on("host", () => {
    console.log("host is logged in");
  });
  socket.on("user", () => {
    console.log("user is logged in");
    io.emit("video id", videoID);
  });
  socket.on("video id", (id) => {
    console.log(id);
    videoID = id;
    io.emit("video id", id);
  });
  socket.on("get videoID", () => {
    io.emit("get videoID", videoID);
  });
  socket.on("get seconds", () => {
    console.log("getting seconds");
    io.emit("get seconds");
  });
  socket.on("send seconds", (data) => {
    console.log("sending seconds", data);
    io.emit("send seconds", data);
  });
  socket.on("signout", () => {
    console.log("signing out");
    socket.emit("signout");
  });
  socket.on("stop", (data) => {
    console.log("video is stopped");
    io.emit("stop", data);
  });
  socket.on("play", (data) => {
    console.log("video is playing");
    io.emit("play", data);
  });
  socket.on("pause", (data) => {
    console.log("video is paused");
    io.emit("pause", data);
  });
  socket.on("get-uuid", () => {
    io.emit("get-uuid", uuid.v4());
  });
  socket.on("session-data", (video) => {
    temp = uuid.v4();
    sessions[temp] = video;
    socket.emit("uuid", temp);
  });
  socket.on("get-session-data", (data) => {
    // console.log(socket.handshake.session.userdata);
    video = sessions[data];
    io.emit("get-session-data", video);
  })
});