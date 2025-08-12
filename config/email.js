const { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_PASSWORD, EMAIL_USERNAME, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;
const nodemailer = require("nodemailer");
// const { google } = require("googleapis");

// const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
// const accessToken = await oAuth2Client.getAccessToken();

const transporterSmtp = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
});

// const transporterGmail = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     type: "OAuth2",
//     user: EMAIL_PASSWORD_GMAIL,
//     clientId: CLIENT_ID,
//     clientSecret: CLIENT_SECRET,
//     refreshToken: REFRESH_TOKEN,
//     accessToken: accessToken.token,
//   },
// });

module.exports = {transporterSmtp};
