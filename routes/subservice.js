var express = require("express");
var subServiceRouter = express.Router();
var serviceController = require("../controllers/subservice");
var headerAuth  =  require('../authMiddleware')

subServiceRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
    serviceController.getAllSubServices(req, res);
});

subServiceRouter.post("/add",  headerAuth.isUserAuthenticated, (req, res, next) => {
    serviceController.addSubService(req, res);
  });

subServiceRouter.post("/update",  headerAuth.isUserAuthenticated, (req, res, next) => {
    serviceController.updateSubService(req, res);
  });

module.exports = subServiceRouter;