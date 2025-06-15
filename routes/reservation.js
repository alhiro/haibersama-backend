var express = require("express");
var reservationRouter = express.Router();
var reservationController = require("../controllers/reservation");
var headerAuth  =  require('../authMiddleware');

const path = require('path');
const multer = require('multer');
// upload file path
const FILE_PATH = 'payment';
const ENV = process.env;
const now = Date.now();

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './public/' + FILE_PATH)
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

//will be using this for uplading
const upload = multer({
  storage: storage, 
  limits: {
    fileSize: 1024 * 2048, // 2 MB (max file size) & allow only 1 file per request
    files: 1,
  },
  fileFilter: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    console.log('ext file ' + ext);

    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf') {
      req.fileValidationError = "Forbidden extension";
      return cb(null, false, req.fileValidationError);
    }
    cb(null, true);
  }
});

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

reservationRouter.post("/getlistscart", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = { 
    categoryId: req.body.categoryId,
    page: req.body.page,
    limitItem: req.body.limitItem,
    email: email,
    userId: id,
    type: type
  };
  
  reservationController.getSuccessReservationsCart(data, res);
});

reservationRouter.get("/getcountcart", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    userId: id, 
    type: type
  };
  
  reservationController.getCountCart(data, res);
});

reservationRouter.post("/getliststransaction", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = { 
    categoryId: req.body.categoryId,
    page: req.body.page,
    limitItem: req.body.limitItem,
    email: email,
    userId: id,
    type: type
  };
  
  reservationController.getSuccessReservationsTransaction(data, res);
});

reservationRouter.post("/getalllists", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = { 
    statusCode: req.body.statusCode,
    categoryId: req.body.categoryId,
    page: req.body.page,
    limitItem: req.body.limitItem,
    email: email,
    userId: id,
    type: type
  };
  
  reservationController.getSuccessReservationsAllList(data, res);
});

reservationRouter.post("/getlists", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = { 
    statusCode: req.body.statusCode,
    categoryId: req.body.categoryId,
    eventFrom: req.body.eventFrom, 
    eventTo: req.body.eventTo,
    page: req.body.page,
    limitItem: req.body.limitItem,
    email: email,
    userId: id,
    type: type
  };
  
  reservationController.getSuccessReservationsList(data, res);
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
    reservationType: "USER_ORDER",
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
    totalDiscount: req.body.totalDiscount, 
    userId: id, 
    type: type,
    email: email
  };
  
  reservationController.updateStatusManual(data, res);
});

reservationRouter.post("/updatestatusbookingmanual", headerAuth.isPartnerAuthenticated ,(req, res, next) => {
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
  
  reservationController.updateStatusBookingManual(data, res);
});

reservationRouter.put("/updatestatusbooking", headerAuth.isUserAuthenticated ,(req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;
  const email = res.locals.auth.email;

  const data = { 
    reservationNo: req.body.reservationNo, 
    reservationType: "USER_ORDER",
    statusCode: req.body.statusCode, 
    totalDp: req.body.totalDp, 
    totalDiscount: req.body.totalDiscount,
    totalPpn: req.body.totalPpn,
    userId: id, 
    type: type,
    email: email
  };
  
  reservationController.updateStatusBooking(data, res);
});

reservationRouter.put("/update", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;

  const data = { 
    id: req.body.id,
    userId: req.body.userId,
    partnerId: id,
    packageId: req.body.packageId, 
    reservationNo: req.body.reservationNo, 
    reservationDate: req.body.reservationDate, 
    reservationType: "MANUAL_ORDER", 
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

  reservationController.getReservationDetail(data, res);
});

reservationRouter.delete("/delete", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const partner_id = res.locals.auth.id;
  const data = { 
    partner_id: partner_id,
    id: req.body.id
  };
  console.log('deleteee')
  console.log(data)
  reservationController.deleteReservation(data, res);
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

reservationRouter.post("/getlistgroupbycategories", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    statusCode: req.body.statusCode, 
    categoryId: req.body.categoryId,
    page: req.body.page,
    limitItem: req.body.limitItem,
    userId: id, 
    type: type
  };
  
  reservationController.getReservationsGroupByCategories(data, res);
});

reservationRouter.post("/getlistsdynamic", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    statusCode: req.body.statusCode || [],
    categoryId: req.body.categoryId,
    page: req.body.page,
    limitItem: req.body.limitItem,
    userId: id, 
    type: type,
    search: req.body.search
  };
  console.log("data resrvation");
  console.log(req.body);
  reservationController.getReservationsGroupByDynamic(data, res);
});

reservationRouter.post("/getinvoicelist", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = { 
    eventFrom: req.body.eventFrom, 
    eventTo: req.body.eventTo,
    email: email,
    userId: id,
    type: type
  };
  
  reservationController.getSuccessReservationDate(data, res);
});

reservationRouter.post("/getinvoicelists", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = { 
    statusCode: req.body.statusCode, 
    categoryId: req.body.categoryId,
    eventFrom: req.body.eventFrom, 
    eventTo: req.body.eventTo,
    page: req.body.page,
    limitItem: req.body.limitItem,
    email: email,
    userId: id,
    type: type
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
    totalDiscount: req.body.totalDiscount,
    totalPpn: req.body.totalPpn,
    email: email,
    userId: id
  };
  
  reservationController.sendEmailToCustomer(data, res);
});

reservationRouter.post("/sendemailtocustomermanual", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = { 
    reservationNo: req.body.reservationNo,
    statusCode: req.body.statusCode,
    counter: 1,
    totalDiscount: req.body.totalDiscount,
    totalPpn: req.body.totalPpn,
    email: email,
    userId: id
  };
  
  reservationController.sendEmailToCustomerManual(data, res);
});

reservationRouter.put("/updateTotalInvoice", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = { 
    reservationNo: req.body.reservationNo,
    reservationType: "MANUAL_ORDER",
    totalDiscount: req.body.totalDiscount,
    totalPpn: req.body.totalPpn,
    totalDp: req.body.totalDp, 
    email: email,
    userId: id
  };
  
  reservationController.updateTotalInvoice(data, res);
});

reservationRouter.put("/confirmationPayment", headerAuth.isUserAuthenticated, upload.single('confirmationImage'), (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const confirmationImage = req.file;
  // make sure file is available
  if (!confirmationImage) {
    const data = {
      email: email,
      userId: id,
      reservationType: "USER_ORDER",
      reservationNo: req.body.reservationNo,
      confirmationPayment: req.body.confirmationImage,
    };

    reservationController.updateConfirmationPayment(data, res);
  } else {
    const data = {
      email: email,
      userId: id,
      reservationType: "USER_ORDER", 
      reservationNo: req.body.reservationNo,
      confirmationPayment: ENV.API_URL + '/ftp/' + FILE_PATH + '/' + confirmationImage.filename,
    };

    reservationController.updateConfirmationPayment(data, res);
  }
});

module.exports = reservationRouter;