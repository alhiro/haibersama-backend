const Sequelize = require('sequelize');
const config = require('./config');
const Config = config.conf.db
const _ = require('lodash')

const {
  TRUCKWAY_AUTH_DB_NAME,
  TRUCKWAY_AUTH_DB_USER,
  TRUCKWAY_AUTH_DB_PASSWORD
} = process.env

let configSequelize = {
  logging: process.env.NODE_ENV === 'dev' ? console.log : null,
  dialect: Config.dialect,
  port: Config.port,
  host: Config.host,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
    acquire: 30000,
    handleDisconnects: true
  },
  dialectOptions: {
    multipleStatements: true,
    decimalNumbers: true,
    compress: true
  },
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    max: 5
  }
};

if (!_.isEmpty(Config.write) && !_.isEmpty(Config.write.host)) {

  configSequelize.replication = {}
  configSequelize.replication.write = Config.write;

  let replicas = [];

  if (_.isEmpty(Config.read)) {
    throw new Error('To enable the use of replication you must inform a database write and at least one database read');
  } else {
    Config.read.forEach(read => {
      if (!_.isEmpty(read) && !_.isEmpty(read.host)) {
        replicas.push(read);
      }
    });
  }

  if (_.isEmpty(replicas)) {
    throw new Error('To enable the use of replication you must inform a database write and at least one database read');
  }

  configSequelize.replication.read = replicas;
  delete configSequelize.host;
}

const dbSeq = new Sequelize(
  Config.database, 
  Config.user, 
  Config.password, 
  configSequelize
);

dbSeq.authenticate().then(() => {
    console.log('Connection has been established successfully.')
}).catch(err => {
    console.error('Unable to connect to the database: ', err)
})

module.exports = dbSeq
