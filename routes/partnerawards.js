var express = require("express");
var partnerAwardsRouter = express.Router();
var partnerAwardsController = require("../controllers/partnerawards");
var headerAuth  =  require('../authMiddleware')
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

partnerAwardsRouter.get("/getaward", (req, res, next) => {
  partnerAwardsController.getAwards(req, res);
});

partnerAwardsRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
    const partner_id = res.locals.auth.id;
    partnerAwardsController.getAllAwards(partner_id, res);
});

partnerAwardsRouter.get("/get", headerAuth.isUserAuthenticated, (req, res, next) => {
  partnerAwardsController.getDetail(req, res);
});

partnerAwardsRouter.post("/add",  headerAuth.isPartnerAuthenticated, upload.single('imageFile'), (req, res, next) => {
    const imagefile = req.file;
    const partner_id = res.locals.auth.id;
    if (!imagefile) {
      res.status(400).send({
          status: false,
          data: 'No file is selected.'
      });
    } else {
      const data = { 
        partner_id: partner_id,
        name: req.body.name,
        awards_date: req.body.awardsDate,
        organizer: req.body.organizer,
        description: req.body.description,
        location: req.body.location,
        accupation: req.body.accupation,
        //image_url: req.body.imageUrl
        image_url: ENV.API_URL + '/ftp/'+ FILE_PATH + '/' + imagefile.filename        
      };

      partnerAwardsController.addAwards(data, res);
    }
  });

partnerAwardsRouter.post("/update",  headerAuth.isPartnerAuthenticated, upload.single('imageFile'), (req, res, next) => {
  const imagefile = req.file;
  const partner_id = res.locals.auth.id;
  
  const data = { 
    partner_id: partner_id,
    id: req.body.id,
    name: req.body.name,
    awards_date: req.body.awardsDate,
    organizer: req.body.organizer,
    description: req.body.description,
    location: req.body.location,
    accupation: req.body.accupation
  };

  if (imagefile) {
      data.image_url = ENV.API_URL + '/ftp/'+ FILE_PATH + '/' + imagefile.filename;
  }  

  partnerAwardsController.updateAwards(data, res);  
});


module.exports = partnerAwardsRouter;