const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, './config/haio-app-firebase-adminsdk-jrwdx-30646f6468.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
