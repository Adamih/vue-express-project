/* jslint node: true */

'use strict';

const bcrypt = require('bcrypt');
const User = require('./models/user.model');

const QueueTable = require('./models/queue.model');
const UserTable = require('./models/user.model');


/**
 * rooms & users are effectively hash maps with the name of the entry serving as a unique key.
 */
const users = {};

/**
 * unregisteredSockets is used as a temporary pool of sockets
 * that belonging to users who are yet to login.
 */
let nextUnregisteredSocketID = 0;
let unregisteredSockets = {};

// Will be initialized in the exports.init function
exports.io = undefined;

/**
 * Initialize the model
 * @param { { io: SocketIO.Server} } config - The configurations needed to initialize the model.
 * @returns {void}
 */
exports.init = ({ io }) => {
  exports.io = io;
};

QueueTable.afterCreate(async (data, options) => {
  exports.io.emit('addToQueue', data);
});

QueueTable.afterDestroy(async (data, options) => {
  exports.io.emit('deleteFromQueue', data);
});

QueueTable.afterUpdate(async (data, options) => {
  exports.io.emit('statusUpdate', data);
});

/**
 * Add a socket.io socket to the pool of unregistered sockets
 * @param {SocketIO.Socket} socket - The socket.io socket to add to the pool.
 * @returns {Number} The ID of the socket in the pool of unregistered sockets.
 */
exports.addUnregisteredSocket = (socket) => {
  const socketID = nextUnregisteredSocketID;
  nextUnregisteredSocketID += 1;

  unregisteredSockets[socketID] = socket;
  return socketID;
};
const assignUnregisteredSocket = (socketID) => {
  const socket = unregisteredSockets[socketID];
  unregisteredSockets = Object.keys(unregisteredSockets)
    .filter((sockID) => sockID !== socketID)
    .reduce((res, sockID) => ({ ...res, [sockID]: unregisteredSockets[sockID] }), {});

  return socket;
};

/**
 * Creates a user with the given name.
 * @param {String} name - The name of the user.
 * @param {Number} socketID - An optional ID of a socket.io socket in the unregistered sockets pool.
 * @see model.addUnregisteredSocket
 * @returns {void}
 */
exports.addUser = (name, socketID = undefined) => {
  users[name] = new User(name);
  if (socketID !== undefined) {
    users[name].socket = assignUnregisteredSocket(socketID);
  }
};

/**
 * Updated the socket associated with the user with the given name.
 * @param {String} name - The name of the user.
 * @param {SocketIO.Socket} socket - A socket.io socket.
 * @returns {void}
 */
exports.updateUserSocket = (name, socket) => {
  users[name].socket = socket;
};

/**
 * Returns the user object with the given name.
 * @param {String} name - The name of the user.
 * @returns {User}
 */
exports.findUser = (name) => users[name];

exports.initDB = async () => {
  // // TODO: Stop reseting tables.
  await this.resetUsers(); await this.resetQueue();
  this.registerUser('admin', 'Admin', 'admin', true);
  this.registerUser('user0', 'User0', 'password', false);
  this.registerUser('user1', 'User1', 'password', false);
  this.registerUser('user2', 'User2', 'password', false);
  this.registerUser('user3', 'User3', 'password', false);
  this.registerUser('user4', 'User4', 'password', false);
};

exports.resetQueue = () => QueueTable.sync({ force: true });
exports.resetUsers = () => UserTable.sync({ force: true });

/**
 * Create a timeslot for a given assistant
 * @param {*} userId
 * @param {*} description
 * @param {String} status
 * @returns {*}
 */
exports.addQueue = (userId, description) => QueueTable.create({ userId, description });

exports.deleteQueue = (userId) => QueueTable.destroy({ where: { userId } });

/**
 * Returns all the Timeslots.
 * @returns {*}
 */
exports.getFullQueue = () => QueueTable.findAll({
  order: [['createdAt', 'DESC']],
});

/**
 * Returns the timeslot with the matching id
 * @param {*} userId
 * @returns {*}
 */
exports.getQueueSlot = (userId) => QueueTable.findOne({
  where: { userId },
});

exports.registerUser = (userId, userName, pass, admin) => bcrypt.hash(pass, 10).then((password) => UserTable.create({
  userId, userName, password, admin,
}));

exports.getUser = (userId) => UserTable.findOne({
  where: { userId },
});
