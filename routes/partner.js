var express = require("express");
var partnerRouter = express.Router();
var partnerController = require("../controllers/partner");

partnerRouter.get("/getdetail", (req, res, next) => {
  partnerController.getDetail(req, res);
});

partnerRouter.post("/getpartner", (req, res, next) => {
  partnerController.getPartner(req, res);
});


partnerRouter.post("/search", (req, res, next) => {
  partnerController.searchPartner(req, res);
});

module.exports = partnerRouter;