/* eslint-disable no-param-reassign */

'use strict';

// #region require dependencies
const betterLogging = require('better-logging');
// enhances log messages with timestamps etc
betterLogging.default(console, {
  stampColor: (Color) => Color.Light_Green,
  typeColors: (Color) => ({
    log: Color.Light_Green,
  }),
});
const path = require('path'); // helper library for resolving relative paths
const expressSession = require('express-session');
const socketIOSession = require('express-socket.io-session');
const express = require('express');
const { Sequelize } = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(expressSession.Store);
// const http = require('https');
const http = require('http');
// const fs = require('fs');
// #endregion

// #region setup boilerplate
console.loglevel = 4; // Enables debug output
const publicPath = path.join(__dirname, '..', '..', 'client', 'dist');
const port = 8989; // The port that the server will listen to
const app = express(); // Creates express app

// const privateKey = fs.readFileSync('/etc/letsencrypt/live/115guild.online/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/115guild.online/cert.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/115guild.online/chain.pem', 'utf8');

// const credentials = {
//   key: privateKey,
//   cert: certificate,
//   ca,
// };

// Express usually does this for us, but socket.io needs the httpServer directly
// const httpServer = http.createServer(credentials, app);
const httpServer = http.createServer(app);
const io = require('socket.io').listen(httpServer); // Creates socket.io app

const databasePath = path.join(__dirname, 'models/db.sqlite');

const sequelize = new Sequelize(
  {
    dialect: 'sqlite',
    storage: databasePath,
  },
);

// Setup middlewares
app.use(betterLogging.expressMiddleware(console, {
  ip: { show: true },
  path: { show: true },
  body: { show: true },
}));
app.use(express.json()); /*
This is a middleware that parses the body of the request into a javascript object.
It's basically just replacing the body property like this:
req.body = JSON.parse(req.body)
*/
app.use(express.urlencoded({ extended: true }));

// Setup session
const session = expressSession({
  secret: 'Super secret! Shh! Don\'t tell anyone...',
  store: new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 15 * 1000, // 15 seconds
    expiration: 60 * 1000, // 60 seconds
  }),
  resave: false,
  saveUninitialized: true,
});
app.use(session);
sequelize.sync();
io.use(socketIOSession(session, {
  autoSave: true,
  saveUninitialized: true,
}));
// #endregion

// Serve client
app.use(express.static(publicPath));/*
express.static(absolutePathToPublicDirectory)
This will serve static files from the public directory, starting with index.html
*/

// Bind REST controllers to /api/*
const auth = require('./controllers/auth.controller.js');
const queue = require('./controllers/queue.controller.js');

app.use('/api', auth.router);
app.use('/api', queue.router);


// Init model
const model = require('./model.js');

model.initDB();

model.init({ io });

// Handle connected socket.io sockets
io.on('connection', (socket) => {
  // This function serves to bind socket.io connections to user models

  if (socket.handshake.session.userID
    && model.findUser(socket.handshake.session.userID) !== undefined
  ) {
    // If the current user already logged in and then reloaded the page
    model.updateUserSocket(socket.handshake.session.userID, socket);
  } else {
    socket.handshake.session.socketID = model.addUnregisteredSocket(socket);
    socket.handshake.session.save((err) => {
      if (err) console.error(err);
      else console.debug(`Saved socketID: ${socket.handshake.session.socketID}`);
    });
  }
});

// Start server
httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
