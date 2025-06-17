var express = require("express");
var settingRouter = express.Router();
var settingController = require("../controllers/appsetting");
var headerAuth  =  require('../authMiddleware')

settingRouter.get("/get", headerAuth.isUserAuthenticated,(req, res, next) => {
  settingController.getAllSetting(req, res);
});

module.exports = settingRouter;