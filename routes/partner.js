var express = require("express");
var partnerRouter = express.Router();
var partnerController = require("../controllers/partner");

partnerRouter.post("/getdetail", (req, res, next) => {
  partnerController.getDetail(req, res);
});

partnerRouter.post("/getpartner", (req, res, next) => {
  partnerController.getPartner(req, res);
});

module.exports = partnerRouter;