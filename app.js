const express = require("express");
const app = express()
var config = require('./config/config');
var authRouter = require('./routes/haiuser');
var categoryRouter = require('./routes/category');
var partnerRouter = require('./routes/partner');
var dashboardRouter = require('./routes/dashboard');

// setup app with predefined configs
config.init(app);

// set the endpoint paths
app.use(process.env.APP_API_PREFIX + '/auth', authRouter);
app.use(process.env.APP_API_PREFIX + '/category', categoryRouter);
app.use(process.env.APP_API_PREFIX + '/partner', partnerRouter);
app.use(process.env.APP_API_PREFIX + '/dashboard', dashboardRouter);

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
