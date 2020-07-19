var express = require("express");
var paymentRouter = express.Router();
var paymentController = require("../controllers/payment");
var paymentChannelController = require("../controllers/paymentchannel");
var headerAuth  =  require('../authMiddleware');

paymentRouter.post("/getpaymentinfo", headerAuth.isUserAuthenticated, (req, res, next) => {
  paymentController.getPaymentInfo(req, res);
});

paymentRouter.post("/getchannellist", headerAuth.isUserAuthenticated, (req, res, next) => {    
  paymentChannelController.getActiveList(data, res);
});

paymentRouter.post("/create", headerAuth.isUserAuthenticated , (req, res, next) => {  
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


paymentRouter.post("/updatestatus", headerAuth.isUserAuthenticated ,(req, res, next) => {
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

module.exports = paymentRouter;