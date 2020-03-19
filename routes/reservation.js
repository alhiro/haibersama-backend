var express = require("express");
var reservationRouter = express.Router();
var reservationController = require("../controllers/reservation");
var headerAuth  =  require('../authMiddleware');

reservationRouter.post("/getdetail", headerAuth.isUserAuthenticated, (req, res, next) => {
  reservationController.getReservation(req, res);
});

reservationRouter.post("/getlist", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    statusCode: req.body.statusCode, 
    categoryId: req.body.categoryId,
    userId: id, 
    type: type
  };
  
  reservationController.getReservations(data, res);
});


reservationRouter.post("/create", headerAuth.isUserAuthenticated , (req, res, next) => {  
  const id = res.locals.auth.id;

  const data = { 
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

  reservationController.createReservation(data, res);
});


reservationRouter.post("/updatestatus", headerAuth.isUserAuthenticated ,(req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    reservationNo: req.body.reservationNo, 
    statusCode: req.body.statusCode, 
    userId: id, 
    type: type
  };
  
  reservationController.updateStatus(data, res);
});

module.exports = reservationRouter;