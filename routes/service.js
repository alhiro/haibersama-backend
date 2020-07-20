var express = require("express");
var serviceRouter = express.Router();
var serviceController = require("../controllers/service");
var headerAuth  =  require('../authMiddleware')

serviceRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
    serviceController.getAllServices(req, res);
});

serviceRouter.post("/add",  headerAuth.isUserAuthenticated, (req, res, next) => {
    serviceController.addService(req, res);
  });

serviceRouter.post("/update",  headerAuth.isUserAuthenticated, (req, res, next) => {
    serviceController.updateService(req, res);
  });

module.exports = serviceRouter;