const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const Cart = sequelize.define('Cart', {
  userId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Cart;