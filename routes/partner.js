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

partnerRouter.get("/province", (req, res, next) => {
  partnerController.provinces(req, res);
});

partnerRouter.get("/city", (req, res, next) => {
  partnerController.city(req, res);
});

module.exports = partnerRouter;