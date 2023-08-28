var express = require("express");
var paymentConfirmationRouter = express.Router();
var paymentController = require("../controllers/payment");
var paymentChannelController = require("../controllers/paymentchannel");
var headerAuth  =  require('../authMiddleware');

paymentConfirmationRouter.get("/getpaymentinfo", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const data = {
    reservationNo :  req.query.reservationNo,
    userId: id
  };

  paymentController.getPaymentInfo(data, res);
});

paymentConfirmationRouter.post("/create", headerAuth.isUserAuthenticated , (req, res, next) => {  
  const id = res.locals.auth.id;

  const data = { 
    userId: id,
    reservationNo: req.body.reservationNo, 
    totalPrice: req.body.totalPrice, 
    totalDiscount: req.body.totalDiscount, 
    totalPayment: req.body.totalPayment, 
    paymentChannelCode: req.body.paymentChannelCode, 
    paymentTimeLimit: req.body.paymentTimeLimit
  };

  paymentController.createPayment(data, res);
});


paymentConfirmationRouter.post("/updatestatus", headerAuth.isUserAuthenticated ,(req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    reservationNo: req.body.reservationNo, 
    statusCode: req.body.statusCode, 
    userId: id, 
    type: type
  };
  
  paymentController.updateStatus(data, res);
});

module.exports = paymentConfirmationRouter;