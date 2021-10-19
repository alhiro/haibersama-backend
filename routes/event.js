var express = require("express");
var eventRouter = express.Router();
var controller = require("../controllers/event");
var headerAuth  =  require('../authMiddleware');
const path = require('path');
const multer = require('multer');
// upload file path
const FILE_PATH = 'imagehai';
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

eventRouter.get("/getall", (req, res, next) => {
  controller.getAllEvent(req, res);
});


eventRouter.get("/get", (req, res, next) => {
  controller.getEvent(req, res);
});

eventRouter.post("/add", headerAuth.isPartnerAuthenticated, upload.single('eventImage'), (req, res, next) => {
  const admin_email = res.locals.auth.email;

  const eventImage = req.file;
  console.log(eventImage);
  console.log('storage location is ', req.hostname +'/' + req.file.path);
  // make sure file is available
  if (!eventImage) {
      res.status(400).send({
          status: false,
          data: 'No file is selected.'
      });
  } else {
    console.log(req.body);
      const data = { 
        title: req.body.title, 
        description: req.body.description, 
        image_url: ENV.API_URL + '/ftp/'+ FILE_PATH + '/' + eventImage.filename, 
        link_url: req.body.eventLink, 
        order_no: parseInt(req.body.orderNo), 
        active: req.body.active,
        ticket: req.body.ticket, 
        approval: req.body.approval,
        created_by: admin_email
      };
      
      controller.addEvent(data, res);
  }    
});

eventRouter.post("/update", headerAuth.isPartnerAuthenticated, upload.single('eventImage'), (req, res, next) => {
  const admin_email = res.locals.auth.email;

  const eventImage = req.file;  
  // make sure file is available
  if (!eventImage) {
    const data = { 
      id: parseInt(req.body.id), 
      title: req.body.title, 
        description: req.body.description, 
        image_url: req.body.imageUrl, 
        link_url: req.body.eventLink, 
        order_no: parseInt(req.body.orderNo), 
        active: req.body.active,
        ticket: req.body.ticket, 
        approval: req.body.approval,
        updated_by: admin_email
    };
    
    controller.updateEvent(data, res);
  } else {
      const data = { 
        id: parseInt(req.body.id), 
        title: req.body.title, 
        description: req.body.description, 
        image_url: ENV.API_URL + '/ftp/'+ FILE_PATH + '/' + eventImage.filename, 
        link_url: req.body.eventLink, 
        order_no: parseInt(req.body.orderNo), 
        active: req.body.active,
        ticket: req.body.ticket, 
        approval: req.body.approval,
        updated_by: admin_email
      };
      
      controller.updateEvent(data, res);
  }   
});

module.exports = eventRouter;