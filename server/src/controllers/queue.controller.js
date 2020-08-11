/* jslint node: true */

'use strict';

const express = require('express');
const model = require('../model.js');
const { requireAuth, requireAdmin } = require('./auth.controller.js');

const router = express.Router();

/**
 * Fetch the list the currently active timeslots
 * @returns {void}
 */

router.get('/queue', requireAuth, (req, res, next) => {
  model.getFullQueue().then((data) => {
    res.status(200).json(data);
  }).catch(next);
});

/**
 * Create a queueSlot
 * @returns {void}
 */
router.post('/queue', requireAuth, (req, res, next) => {
  model.addQueue(req.session.userID, req.body.description).then((data) => {
    res.status(200).json(data);
  }).catch(next);
});

router.delete('/queue/:id', requireAuth, (req, res, next) => {
  if (req.session.userID === req.params.id) next();
  else requireAdmin(req, res, next);
}, async (req, res, next) => {
  model.deleteQueue(req.params.id).then((data) => {
    res.status(200).json({ data });
  }).catch(next);
});

router.get('user/:id', (req, res, next) => {
  model.getUser(req.params.id).then((data) => {
    res.status(200).json({ data });
  }).catch(next);
});

router.use((err, req, res) => {
  console.error(err);
  res.status(500).send('Something unexpected happened.');
});

module.exports = { router };
