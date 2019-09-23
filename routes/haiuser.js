var express = require("express");
var authRouter = express.Router();
var headerAuth  =  require('../authMiddleware')
var validator = require("../validator/auth");

//const passportConf = require("../lib/passport");


authRouter.post("/login", validator.login(), (req, res, next) => {
  authController.login(req, res);
});

module.exports = authRouter;
