var express = require("express");
var paymentchannelRouter = express.Router();
var paymentchannelController = require("../controllers/paymentchannel");
var headerAuth  =  require('../authMiddleware')

paymentchannelRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
  paymentchannelController.getAll(req, res);
});

paymentchannelRouter.get("/getallactive", headerAuth.isUserAuthenticated, (req, res, next) => {
  paymentchannelController.getActiveList(req, res);
});

paymentchannelRouter.post("/add", headerAuth.isUserAuthenticated, (req, res, next) => {
  paymentchannelController.addPaymentChannel(req, res);
});

paymentchannelRouter.post("/update", headerAuth.isUserAuthenticated, (req, res, next) => {
  paymentchannelController.updatePaymentChannel(req, res);
});

module.exports = paymentchannelRouter;