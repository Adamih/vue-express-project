/* jslint node: true */

'use strict';

const { Sequelize, Model, DataTypes } = require('sequelize');

const path = require('path');

const databasePath = path.join(__dirname, 'db.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databasePath,
});

class QueueTable extends Model {}
QueueTable.init({
  userId: { type: DataTypes.STRING, primaryKey: true },
  description: DataTypes.STRING,
  status: DataTypes.STRING,
}, {
  hooks: {
    beforeBulkDestroy(options) {
      options.individualHooks = true;
    },
    beforeBulkUpdate(options) {
      options.individualHooks = true;
    },
  },
  sequelize,
  modelName: 'queue',
});

module.exports = QueueTable;
