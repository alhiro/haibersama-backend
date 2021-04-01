var express = require("express");
var packageRouter = express.Router();
var packageController = require("../controllers/partnerpackage");
var headerAuth  =  require('../authMiddleware')

packageRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
  packageController.getAllPackage(req, res);
});

packageRouter.get("/getlist", (req, res, next) => {
  packageController.getList(req, res);
});

packageRouter.post("/add", headerAuth.isUserAuthenticated, (req, res, next) => {
  packageController.addPackage(req, res);
});

packageRouter.post("/addpackagedetail", headerAuth.isUserAuthenticated, (req, res, next) => {
  packageController.addPackageDetail(req, res);
});

packageRouter.post("/update", headerAuth.isUserAuthenticated, (req, res, next) => {
  packageController.editPackage(req, res);
});

packageRouter.get("/get", headerAuth.isUserAuthenticated, (req, res, next) => {
  packageController.get(req, res);
});

packageRouter.delete("/get", headerAuth.isUserAuthenticated, (req, res, next) => {
  packageController.deletePackage(req, res);
});

packageRouter.delete("/getdetail", headerAuth.isUserAuthenticated, (req, res, next) => {
  packageController.deletePackageDetail(req, res);
});

module.exports = packageRouter;