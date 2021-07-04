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
    reservationType: "USER_ORDER", 
    userId: id,
    packageId: req.body.packageId, 
    eventDate: req.body.eventDate, 
    eventTime: req.body.eventTime, 
    eventAddress: req.body.eventAddress, 
    name: req.body.name, 
    provinsi: req.body.provinsi, 
    city: req.body.city,
    address: req.body.address, 
    phoneNo: req.body.phoneNo, 
    waNo: req.body.waNo, 
    email: req.body.email, 
    socialMedia: req.body.socialMedia, 
    otherDescription: req.body.otherDescription
  };

  reservationController.createReservation(data, res);
});


reservationRouter.post("/manual", headerAuth.isPartnerAuthenticated , (req, res, next) => {  
  const id = res.locals.auth.id;

  const data = { 
    userId: null,
    partnerId: id,
    reservationDate: req.body.reservationDate, 
    reservationType: "MANUAL_ORDER", 
    packageId: req.body.packageId, 
    eventDate: req.body.eventDate, 
    eventTime: req.body.eventTime, 
    eventAddress: req.body.eventAddress, 
    name: req.body.name, 
    provinsi: req.body.provinsi, 
    city: req.body.city,
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
  const email = res.locals.auth.email;

  const data = { 
    reservationNo: req.body.reservationNo, 
    statusCode: req.body.statusCode, 
    totalDp: req.body.totalDp, 
    userId: id, 
    type: type,
    email: email
  };
  
  reservationController.updateStatus(data, res);
});

reservationRouter.post("/updatestatusmanual", headerAuth.isPartnerAuthenticated ,(req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;
  const email = res.locals.auth.email;

  const data = { 
    reservationNo: req.body.reservationNo, 
    reservationType: "MANUAL_ORDER",
    statusCode: req.body.statusCode, 
    totalDp: req.body.totalDp, 
    userId: id, 
    type: type,
    email: email
  };
  
  reservationController.updateStatusManual(data, res);
});

// reservationRouter.post("/agendaitems", headerAuth.isPartnerAuthenticated, (req, res, next) => {
//   const id = res.locals.auth.id;
//   const type = res.locals.auth.type;

//   const data = { 
//     partnerId: id,
//     month: req.body.month, 
//     year: req.body.year
//   };
  
//   reservationController.getAgendaItems(data, res);
// });

reservationRouter.post("/calendardata", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    partnerId: id,
    month: req.body.month, 
    year: req.body.year
  };
  
  reservationController.getCalendarData(data, res);
});


reservationRouter.post("/getlistgroupbycategory", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    statusCode: req.body.statusCode, 
    categoryId: req.body.categoryId,
    userId: id, 
    type: type
  };
  
  reservationController.getReservationsGroupByCategory(data, res);
});

reservationRouter.post("/getinvoicelist", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;

  const data = { 
    eventFrom: req.body.eventFrom, 
    eventTo: req.body.eventTo,
    email: email,
    userId: id
  };
  
  reservationController.getSuccessReservations(data, res);
});

reservationRouter.post("/sendinvoicelistemail", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = { 
    eventFrom: req.body.eventFrom, 
    eventTo: req.body.eventTo,
    type: type,
    email: email,
    userId: id
  };
  
  reservationController.getSuccessReservationsEmail(data, res);
});

reservationRouter.post("/sendinvoiceemail", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;

  const data = { 
    reservationNo: req.body.reservationNo,
    email: email,
    userId: id
  };
  
  reservationController.getSuccessReservationEmail(data, res);
});

reservationRouter.post("/sendemailtocustomer", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = { 
    reservationNo: req.body.reservationNo,
    statusCode: req.body.statusCode,
    counter: 1,
    email: email,
    userId: id
  };
  
  reservationController.sendEmailToCustomer(data, res);
});

module.exports = reservationRouter;