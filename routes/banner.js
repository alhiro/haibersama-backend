var express = require("express");
var bannerRouter = express.Router();
var bannerController = require("../controllers/banner");
var headerAuth  =  require('../authMiddleware');
const path = require('path');
const multer = require('multer');
// upload file path
const FILE_PATH = 'imagehai';
// const API_URL = process.env;
const API_URL ='http://staging.haiorganizer.com';
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
const upload = multer({ storage: storage });

bannerRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
  bannerController.getAllBanners(req, res);
});


bannerRouter.get("/get", headerAuth.isUserAuthenticated, (req, res, next) => {
  bannerController.getBanner(req, res);
});

bannerRouter.post("/add", headerAuth.isUserAuthenticated, upload.single('bannerImage'), (req, res, next) => {
  const bannerimage = req.file;
  console.log(bannerimage);
  console.log('storage location is ', req.hostname +'/' + req.file.path);
  // make sure file is available
  if (!bannerimage) {
      res.status(400).send({
          status: false,
          data: 'No file is selected.'
      });
  } else {
    console.log(req.body);
      const data = { 
        title: req.body.title, 
        description: req.body.description, 
        image_url: API_URL + '/ftp/'+ FILE_PATH + '/' + bannerimage.fieldname + '-' + now + path.extname(bannerimage.originalname), 
        order_no: parseInt(req.body.orderNo), 
        active: req.body.active
      };
      
      bannerController.addBanner(data, res);
  }    
});

bannerRouter.post("/update", headerAuth.isUserAuthenticated, upload.single('bannerImage'), (req, res, next) => {
  const bannerimage = req.file;
  
  // make sure file is available
  if (!bannerimage) {
    const data = { 
      id: parseInt(req.body.id), 
      title: req.body.title, 
      description: req.body.description, 
      image_url: req.body.imageUrl, 
      order_no: parseInt(req.body.orderNo), 
      active: req.body.active
    };
    
    bannerController.updateBanner(data, res);
  } else {
      const data = { 
        id: parseInt(req.body.id), 
        title: req.body.title, 
        description: req.body.description, 
        image_url: API_URL + '/ftp/'+ FILE_PATH + '/' + bannerimage.fieldname + '-' + now + path.extname(bannerimage.originalname), 
        order_no: parseInt(req.body.orderNo), 
        active: req.body.active
      };
      
      bannerController.updateBanner(data, res);
  }   
});

module.exports = bannerRouter;