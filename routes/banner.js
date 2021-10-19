var express = require("express");
var bannerRouter = express.Router();
var bannerController = require("../controllers/banner");
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

bannerRouter.get("/getall", (req, res, next) => {
  bannerController.getAllBanners(req, res);
});


bannerRouter.get("/get", (req, res, next) => {
  bannerController.getBanner(req, res);
});

bannerRouter.post("/add", headerAuth.isAdminAuthenticated, upload.single('bannerImage'), (req, res, next) => {
  const admin_email = res.locals.auth.email;

  const bannerImage = req.file;
  console.log(bannerImage);
  console.log('storage location is ', req.hostname +'/' + req.file.path);
  // make sure file is available
  if (!bannerImage) {
      res.status(400).send({
          status: false,
          data: 'No file is selected.'
      });
  } else {
    console.log(req.body);
      const data = { 
        title: req.body.title, 
        description: req.body.description, 
        image_url: ENV.API_URL + '/ftp/'+ FILE_PATH + '/' + bannerImage.filename, 
        link_url: req.body.bannerLink,
        order_no: parseInt(req.body.orderNo), 
        active: req.body.active,
        created_by: admin_email
      };
      
      bannerController.addBanner(data, res);
  }    
});

bannerRouter.post("/update", headerAuth.isAdminAuthenticated, upload.single('bannerImage'), (req, res, next) => {
  const admin_email = res.locals.auth.email;

  const bannerImage = req.file;
  // make sure file is available
  if (!bannerImage) {
    const data = { 
      id: parseInt(req.body.id), 
      title: req.body.title, 
      description: req.body.description, 
      image_url: req.body.bannerImage, 
      link_url: req.body.bannerLink,
      order_no: parseInt(req.body.orderNo), 
      active: req.body.active,
      updated_by: admin_email
    };
    
    bannerController.updateBanner(data, res);
  } else {
      const data = { 
        id: parseInt(req.body.id), 
        title: req.body.title, 
        description: req.body.description, 
        image_url: ENV.API_URL + '/ftp/'+ FILE_PATH + '/' + bannerImage.filename, 
        link_url: req.body.bannerLink,
        order_no: parseInt(req.body.orderNo), 
        active: req.body.active,
        updated_by: admin_email
      };
      
      bannerController.updateBanner(data, res);
  }   
});

module.exports = bannerRouter;