var express = require("express");
var eventRouter = express.Router();
var controller = require("../controllers/event");
var headerAuth  =  require('../authMiddleware');
const path = require('path');
const multer = require('multer');
// upload file path
const FILE_PATH = 'event';
const ENV = process.env;
const now = Date.now();
// configure multer

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

    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      req.fileValidationError = "Forbidden extension";
      return cb(null, false, req.fileValidationError);
    }
    cb(null, true);
  }
});

eventRouter.get("/getall", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.getAllEvent(req, res);
});

eventRouter.get("/getallpublic", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.getAllPublic(req, res);
});

eventRouter.get("/getallpubliclimit", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.getAllPublicLimit(req, res);
});

eventRouter.get("/listselayang", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.getEventSelayang(req, res);
});

eventRouter.get("/partner", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.getEventPartner(req, res);
});

eventRouter.get("/partnerpubliclimit", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.getEventPartnerPublic(req, res);
});

eventRouter.get("/get", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.getEvent(req, res);
});

eventRouter.post("/search", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.searchEvent(req, res);
});

eventRouter.post("/add", headerAuth.isPartnerAuthenticated, upload.single('events'), (req, res, next) => {
  const username = res.locals.auth;
  console.log('username is ', username);
  const partner_id = res.locals.auth.id;
  const partner_email = res.locals.auth.email;

  const eventImage = req.file;
  console.log(eventImage);
  // console.log('storage location is ', req.hostname + '/' + req.file.path);

  const data = {
    partner_id: partner_id,
    title: req.body.title,
    description: req.body.description,
    link_url: req.body.link_url,
    event_date: req.body.event_date,
    order_no: parseInt(req.body.order_no),
    active: req.body.active,
    ticket: req.body.ticket,
    approval: req.body.approval,
    created_by: partner_email
  };

  if (eventImage && eventImage.filename) {
    data.image_url = ENV.API_URL + '/ftp/' + FILE_PATH + '/' + eventImage.filename;
  }

  controller.addEvent(data, res);

  // make sure file is available
  // if (!eventImage) {
  //   res.status(400).send({
  //     status: false,
  //     data: 'No file is selected.'
  //   });
  // } else {
  //   console.log(req.body);
  //   const data = {
  //     partner_id: partner_id,
  //     title: req.body.title,
  //     description: req.body.description,
  //     image_url: ENV.API_URL + '/ftp/' + FILE_PATH + '/' + eventImage.filename,
  //     link_url: req.body.link_url,
  //     event_date: req.body.event_date,
  //     order_no: parseInt(req.body.order_no),
  //     active: req.body.active,
  //     ticket: req.body.ticket,
  //     approval: req.body.approval,
  //     created_by: partner_email
  //   };

  //   controller.addEvent(data, res);
  // }
});

eventRouter.post("/update", headerAuth.isPartnerAuthenticated, upload.single('events'), (req, res, next) => {
  const partner_id = res.locals.auth.id;
  const partner_email = res.locals.auth.email;
  const partner_name = res.locals.auth.name;

  const eventImage = req.file;

  console.log("eventImage");
  console.log(eventImage);

  // make sure file is available
  if (!eventImage) {
    const data = {
      partner_id: partner_id,
      id: parseInt(req.body.id),
      title: req.body.title,
      description: req.body.description,
      image_url: req.body.events,
      link_url: req.body.link_url,
      event_date: req.body.event_date,
      order_no: parseInt(req.body.order_no),
      active: req.body.active,
      ticket: req.body.ticket,
      approval: req.body.approval,
      updated_by: partner_name
    };

    controller.updateEvent(data, req, res);
  } else {
    const data = {
      partner_id: partner_id,
      id: parseInt(req.body.id),
      title: req.body.title,
      description: req.body.description,
      image_url: ENV.API_URL + '/ftp/' + FILE_PATH + '/' + eventImage.filename,
      link_url: req.body.link_url,
      event_date: req.body.event_date,
      order_no: parseInt(req.body.order_no),
      active: req.body.active,
      ticket: req.body.ticket,
      approval: req.body.approval,
      updated_by: partner_email
    };

    controller.updateEvent(data, req, res);
  }
});

eventRouter.patch(
  "/update",
  headerAuth.isPartnerAuthenticated,
  upload.single("events"),
  (req, res, next) => {
    const partner_id = res.locals.auth.id;
    const partner_email = res.locals.auth.email;
    const partner_name = res.locals.auth.name;

    const eventImage = req.file;

    // kalau file terlalu besar => Multer otomatis lempar error "LIMIT_FILE_SIZE"
    if (req.fileValidationError) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    // siapkan data yang akan diupdate (hanya field yang dikirim)
    const data = {
      partner_id,
      id: parseInt(req.body.id),
      updated_by: partner_name,
    };

    // mapping hanya field yang ada
    if (req.body.title) data.title = req.body.title;
    if (req.body.description) data.description = req.body.description;
    if (req.body.link_url) data.link_url = req.body.link_url;
    if (req.body.event_date) data.event_date = req.body.event_date;
    if (req.body.order_no) data.order_no = parseInt(req.body.order_no);
    if (req.body.active) data.active = req.body.active;
    if (req.body.ticket) data.ticket = req.body.ticket;
    if (req.body.approval) data.approval = req.body.approval;

    console.log("req.body.image_url");
    console.log(req.body.image_url);

    if (eventImage) {
      data.image_url =
        ENV.API_URL + "/ftp/" + FILE_PATH + "/" + eventImage.filename;
    } else if (req.body.image_url) {
      data.image_url = req.body.image_url;
    }

    controller.updateEvent(data, req, res);
  }
);

// middleware khusus untuk tangkap error file size
eventRouter.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "Image too large (max 2MB)", data: err });
  }

  // Kalau error punya properti message
  if (err.message) {
    return res.status(500).json({ success: false, message: err.message, data: err });
  }

  // Default fallback kalau tidak ada message
  return res.status(500).json({ success: false, message: "Something went wrong", data: err });
});

eventRouter.delete("/delete", headerAuth.isPartnerAuthenticated, upload.single('events'), (req, res, next) => {
  const partner_id = res.locals.auth.id;
  const data = { 
    partner_id: partner_id,
    id: req.body.id
  };
  controller.deleteEvent(data, res);
});

module.exports = eventRouter;