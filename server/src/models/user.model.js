/* jslint node: true */

'use strict';

const { Sequelize, Model, DataTypes } = require('sequelize');

const path = require('path');

const databasePath = path.join(__dirname, 'db.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databasePath,
});

class UserTable extends Model {}
UserTable.init({
  userId: { type: DataTypes.STRING, primaryKey: true },
  userName: DataTypes.STRING,
  password: DataTypes.STRING,
  admin: DataTypes.BOOLEAN,
}, { sequelize, modelName: 'users' });

module.exports = UserTable;
