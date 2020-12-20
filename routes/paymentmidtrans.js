var express = require("express");
var paymentMidtransRouter = express.Router();
var paymentMidtransController = require("../controllers/paymentmidtrans");
var headerAuth  =  require('../authMiddleware');

paymentMidtransRouter.post("/create", headerAuth.isUserAuthenticated , (req, res, next) => {  
  const id = res.locals.auth.id;

  const data = { 
    userId: id,
    reservationNo: req.body.reservationNo, 
    totalPrice: req.body.totalPrice, 
    totalDiscount: req.body.totalDiscount, 
    // totalPayment: req.body.totalPayment, 
    // paymentTimeLimit: req.body.paymentTimeLimit,
    paymentType: req.body.paymentType
  };

  paymentMidtransController.createPayment(data, res);
});

paymentMidtransRouter.post("/callback", (req, res, next) => {
  
  paymentMidtransController.callback(data, res);
});

module.exports = paymentMidtransRouter;