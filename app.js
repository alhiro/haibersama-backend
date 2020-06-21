const express = require("express");
const app = express()
const config = require('./config/config');
const authRouter = require('./routes/haiuser');
const categoryRouter = require('./routes/category');
const partnerRouter = require('./routes/partner');
const reservationRouter = require('./routes/reservation');
const passport = require('passport');
const serviceRouter = require('./routes/service');
const subServiceRouter = require('./routes/subservice');
const packageRouter = require('./routes/partnerpackage');
const cookieSession = require('cookie-session');
const dashboardRouter = require('./routes/dashboard');
const awardsRouter = require('./routes/partnerawards');
const portfolioRouter = require('./routes/partnerportfolio');
const certificateRouter = require('./routes/partnercertificate');
const experienceRouter = require('./routes/partnerexperience');
const paymentChannelRouter = require('./routes/paymentchannel');

// setup app with predefined configs
config.init(app);

app.use(passport.initialize()); // Used to initialize passport
app.use(passport.session()); // Used to persist login sessions

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
app.use(process.env.APP_API_PREFIX + '/paymentchannel', paymentChannelRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
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
  console.log('Express server listening on port ' + server.address().port);
});
module.exports = app;
