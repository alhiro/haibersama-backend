var express = require("express");
var packageRouter = express.Router();
var packageController = require("../controllers/partnerpackage");
var headerAuth  =  require('../authMiddleware')

packageRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
  packageController.getAllPackage(req, res);
});

packageRouter.get("/getlist", headerAuth.isUserAuthenticated, (req, res, next) => {
  const partner_id = parseInt(req.query.partnerid);
  const user_id = res.locals.auth.id;
  const user_email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = {
    partner_id: partner_id,
    user_id: user_id,
    user_email: user_email,
    type: type
  };
  console.log('data get package');
  console.log(data);
  
  packageController.getList(data, res);
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