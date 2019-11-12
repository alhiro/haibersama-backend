var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const passport = require('passport');
const dotenv = require('dotenv')
var cors = require('cors');
var jwt = require('../lib/jwt');

const exceptions = ['production', 'uat']

if (!exceptions.includes(process.env.NODE_ENV)) {
  dotenv.config()
}

const {
  NODE_ENV,
  APP_API_PREFIX,
  AUTH_DB_HOST_MASTER,
  AUTH_DB_HOST_SLAVE,
  AUTH_DB_PORT,
  AUTH_DB_DIALECT,
  AUTH_DB_NAME,
  AUTH_DB_USER,
  AUTH_DB_PASSWORD,
  PASSPORT_GOOGLE_CLIENT_ID,
  PASSPORT_GOOGLE_CLIENT_SECRET,
  EMAIL_SERVICE_ENDPOINT,
  SMS_SERVICE_ENDPOINT,
  PORT,
  TOKEN_JWT_SECRET,
  VERIFY_URL
} = process.env


console.log("process.env : "+JSON.stringify(process.env))

module.exports = {
  conf: {
    db: {
      dialect: AUTH_DB_DIALECT,
      user: AUTH_DB_USER,
      password: AUTH_DB_PASSWORD,
      database: AUTH_DB_NAME,
      operatorAliases: false,
      port: AUTH_DB_PORT,
      host: AUTH_DB_HOST_MASTER,
      write: {
        host: AUTH_DB_HOST_MASTER,
        pool: {
          max: 5,
          min: 0,
          idle: 60000,
          acquire: 60000,
          handleDisconnects: true
        }
      },
      read: [{
        host: AUTH_DB_HOST_SLAVE,
        pool: {
          max: 5,
          min: 0,
          idle: 60000,
          acquire: 60000,
          handleDisconnects: true
        }
      },
      {
        host: AUTH_DB_HOST_SLAVE,
        pool: {
          max: 5,
          min: 0,
          idle: 60000,
          acquire: 60000,
          handleDisconnects: true
        }
      },
      {
        host: AUTH_DB_HOST_SLAVE,
        pool: {
          max: 5,
          min: 0,
          idle: 60000,
          acquire: 60000,
          handleDisconnects: true
        }
      }]
    },
    oauth: {
      google: {
        clientID: PASSPORT_GOOGLE_CLIENT_ID,
        clientSecret: PASSPORT_GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://staging.haiorganizer.com/api/auth/google/callback'
      },
      facebook: {
        clientID: 'INSERT-CLIENT-ID-HERE',
        clientSecret: 'INSERT-CLIENT-SECRET-HERE',
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        profileFields: ['id', 'name', 'displayName', 'picture', 'email'],
      }
    }
  },
  init: async (app) => {
    const apiPrefix = APP_API_PREFIX || '/api';
    const apiBaseDir = `/${apiPrefix.split('/')[0]}`

    // configure app to use bodyParser()
    // this will let us get the data from a POST
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(cookieParser());
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(apiBaseDir, cors({ origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', preflightContinue: false }));
  }
}

