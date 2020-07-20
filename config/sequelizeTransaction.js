var Sequelize = require('sequelize');
var config = require('./config');

const {
  AUTH_DB_NAME,
  AUTH_DB_USER,
  AUTH_DB_PASSWORD
} = process.env


config.conf.db.isolationLevel = Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE || "SERIALIZABLE"
const sequelizeTransaction = new Sequelize(AUTH_DB_NAME, AUTH_DB_USER, AUTH_DB_PASSWORD, config.conf.db);

module.exports = sequelizeTransaction
 