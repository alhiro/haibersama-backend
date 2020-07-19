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
    paymentType: "103101", 
    userId: id,
    packageId: req.body.packageId, 
    eventDate: req.body.eventDate, 
    eventTime: req.body.eventTime, 
    eventAddress: req.body.eventAddress, 
    name: req.body.name, 
    address: req.body.address, 
    phoneNo: req.body.phoneNo, 
    waNo: req.body.waNo, 
    email: req.body.email, 
    socialMedia: req.body.socialMedia, 
    otherDescription: req.body.otherDescription
  };

  paymentController.createPayment(data, res);
});


paymentRouter.post("/manual", headerAuth.isPartnerAuthenticated , (req, res, next) => {  
  const id = res.locals.auth.id;

  const data = { 
    userId: null,
    partnerId: id,
    paymentDate: req.body.paymentDate, 
    paymentType: "103102", 
    packageId: req.body.packageId, 
    eventDate: req.body.eventDate, 
    eventTime: req.body.eventTime, 
    eventAddress: req.body.eventAddress, 
    name: req.body.name, 
    address: req.body.address, 
    phoneNo: req.body.phoneNo, 
    waNo: req.body.waNo, 
    email: req.body.email, 
    socialMedia: req.body.socialMedia, 
    otherDescription: req.body.otherDescription
  };

  paymentController.createPayment(data, res);
});

paymentRouter.post("/updatestatus", headerAuth.isUserAuthenticated ,(req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    paymentNo: req.body.paymentNo, 
    statusCode: req.body.statusCode, 
    userId: id, 
    type: type
  };
  
  paymentController.updateStatus(data, res);
});

module.exports = paymentRouter;