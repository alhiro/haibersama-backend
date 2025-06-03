// Require necessary modules
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Set the NODE_ENV variable
const env = process.env.NODE_ENV || 'development';
console.log('Run server env ' + env);
const envFile = env === 'production' ? '.env-production' : '.env';
console.log('Run env file ' + envFile);

// Load environment variables
const envPath = path.resolve(__dirname, envFile);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error(`Environment file ${envFile} not found.`);
  process.exit(1);
}

const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const config = require('./config/config');
const passport = require('passport');
const cookieSession = require('cookie-session');
const serveIndex = require('serve-index');
const initDB = require('./models/index');

// Router
const authRouter = require('./routes/haiuser');
const categoryRouter = require('./routes/category');
const partnerRouter = require('./routes/partner');
const reservationRouter = require('./routes/reservation');
const serviceRouter = require('./routes/service');
const subServiceRouter = require('./routes/subservice');
const packageRouter = require('./routes/partnerpackage');
const dashboardRouter = require('./routes/dashboard');
const awardsRouter = require('./routes/partnerawards');
const portfolioRouter = require('./routes/partnerportfolio');
const certificateRouter = require('./routes/partnercertificate');
const experienceRouter = require('./routes/partnerexperience');
const paymentRouter = require('./routes/payment');
const paymentMidtransRouter = require('./routes/paymentmidtrans');
const bannerRouter = require('./routes/banner');
const eventRouter = require('./routes/event');
const followerRouter = require('./routes/partnerfollower');
const partnerBankAccountRouter = require('./routes/partnerbankaccount');
const partnerRatingRouter = require('./routes/partnerrating');
const walletRouter = require('./routes/wallet');
const settingRouter = require('./routes/appsetting');

// Seed model into table
// const haiuser = require("./models/reservation");
// haiuser.sequelize.sync({ alter: true })
// const haiuser2 = require("./models/partnerwalletbalance");
// haiuser2.sequelize.sync({alter: true})

// setup app with predefined configs
config.init(app);

app.use('/ftp', express.static('public'), serveIndex('public', {'icons': true}));

// enable CORS
app.use(cors());

// add other middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(passport.initialize()); // Used to initialize passport
app.use(passport.session()); // Used to persist login sessions
// set static file
app.use(express.static(path.join(__dirname, 'views')));

// set the endpoint paths
app.use(process.env.APP_API_PREFIX + '/auth', authRouter);
app.use(process.env.APP_API_PREFIX + '/category', categoryRouter);
app.use(process.env.APP_API_PREFIX + '/partner', partnerRouter);
app.use(process.env.APP_API_PREFIX + '/service', serviceRouter);
app.use(process.env.APP_API_PREFIX + '/subservice', subServiceRouter);
app.use(process.env.APP_API_PREFIX + '/package', packageRouter);
app.use(process.env.APP_API_PREFIX + '/reservation', reservationRouter);
app.use(process.env.APP_API_PREFIX + '/dashboard', dashboardRouter);
app.use(process.env.APP_API_PREFIX + '/award', awardsRouter);
app.use(process.env.APP_API_PREFIX + '/certificate', certificateRouter);
app.use(process.env.APP_API_PREFIX + '/portfolio', portfolioRouter);
app.use(process.env.APP_API_PREFIX + '/experience', experienceRouter);
app.use(process.env.APP_API_PREFIX + '/payment', paymentRouter);
app.use(process.env.APP_API_PREFIX + '/paymentmidtrans', paymentMidtransRouter);
app.use(process.env.APP_API_PREFIX + '/banner', bannerRouter);
app.use(process.env.APP_API_PREFIX + '/partnerbankaccount', partnerBankAccountRouter);
app.use(process.env.APP_API_PREFIX + '/rating', partnerRatingRouter);
app.use(process.env.APP_API_PREFIX + '/wallet', walletRouter);
app.use(process.env.APP_API_PREFIX + '/event', eventRouter);
app.use(process.env.APP_API_PREFIX + '/follower', followerRouter);
app.use(process.env.APP_API_PREFIX + '/setting', settingRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Io application." });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // res.status(404).render('404.jade');

  res.status(404);
  res.send('404: File Not Found');

  // var err = new Error('Not Found');
  // err.status = 404;
  // next(err);
});

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  if (err.name === 'Unauthorized Error') {
    res.json({
      error: err
    }).status(401)

  } else if (res.finished !== true) {
    console.error(err)
    res.json({
      error: err
    }).status(500)
  }
})

app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  initDB;
  console.log('Express server listening on port ' + server.address().port);
});
// set html view with ejs render file
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

module.exports = app;
