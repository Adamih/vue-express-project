/* jslint node: true */

'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const model = require('../model.js');

const router = express.Router();

/**
 * requireAuth is an endpoint guard for logged in users.
 * aka: A middle ware used to limit access to an endpoint to authenticated users
 */
const requireAuth = (req, res, next) => {
  if (!req.session.userID) {
    res.status(401).send('Unauthorized. Please make sure you are logged in before attempting this action again.');
    return;
  }

  model.getUser(req.session.userID).then((maybeUser) => {
    // "auth" check
    if (maybeUser === undefined) {
      res.status(401).send('Unauthorized. Please make sure you are logged in before attempting this action again.');
      return;
    }

    next();
  }).catch(next);
};

/**
 * requireAuth is an endpoint guard for logged in users.
 * aka: A middle ware used to limit access to an endpoint to authenticated users
 */
const requireAdmin = (req, res, next) => {
  if (!req.session.userID) {
    res.status(401).send('Unauthorized. Please make sure you are logged in before attempting this action again.');
    return;
  }

  model.getUser(req.session.userID).then((maybeUser) => {
    // "auth" check
    if (maybeUser === undefined) {
      res.status(401).send('Unauthorized. Please make sure you are logged in before attempting this action again.');
      return;
    }

    // Admin check
    if (!maybeUser.admin) {
      res.status(401).send('Unauthorized. You cannot perform this action.');
      return;
    }

    next();
  }).catch(next);
};


/**
 * Tells the client if they are in an authenticated user-session.
 */
router.get('/isAuthenticated', (req, res) => {
  // Check if client have active session
  if (!req.session.userID) {
    res.status(200).json({ isAuthenticated: false, username: null });
    return;
  }
  if (req.session.ip !== req.connection.remoteAddress) {
    req.session.destroy();
    res.status(200).json({ isAuthenticated: false, username: null });
  }

  model.getUser(req.session.userID).then((data) => {
    res.status(200).json({
      isAuthenticated: true,
      username: data.userId,
      isAdmin: data.admin,
    });
  }).catch(console.error);
});

/**
 * Attempts to authenticate the user-session
 */
router.post('/authenticate', async (req, res) => {
  const user = await model.getUser(req.body.username);
  if (user === null) {
    res.sendStatus(401);
    return;
  }

  // Check password
  const valid = bcrypt.compareSync(req.body.password, user.password);
  if (!valid) {
    res.sendStatus(401);
    return;
  }

  // Update the userID of the currently active session
  req.session.userID = req.body.username;
  req.session.ip = req.connection.remoteAddress;

  req.session.save((err) => {
    if (err) console.error(err);
    else console.debug(`Saved userID: ${req.session.userID}`);
  });

  res.status(200).json({
    username: user.userId,
    isAdmin: user.admin,
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.sendStatus(200);
});

// TODO: Add 'create account' route.
// The 'authenticate' route is only supposed to check if the user can login.

module.exports = { router, requireAuth, requireAdmin };
