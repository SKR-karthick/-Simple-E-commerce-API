const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './ecommerce.db',
  define: {
    timestamps: true
  }
});

// Enable foreign key constraints
sequelize.query('PRAGMA foreign_keys = ON;');

module.exports = sequelize;