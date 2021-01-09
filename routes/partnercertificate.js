var express = require("express");
var partnerCertificateRouter = express.Router();
var partnerCertificateController = require("../controllers/partnercertificate");
var headerAuth  =  require('../authMiddleware')
const path = require('path');
const multer = require('multer');
// upload file path
const FILE_PATH = 'imagehai';
// const API_URL = process.env;
const API_URL ='http://development.haiorganizer.com';
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

partnerCertificateRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
    const partner_id = res.locals.auth.id;
    partnerCertificateController.getAllCertificate(partner_id, res);
});

partnerCertificateRouter.get("/get", headerAuth.isUserAuthenticated, (req, res, next) => {
  partnerCertificateController.getDetail(req, res);
});

partnerCertificateRouter.post("/add", headerAuth.isPartnerAuthenticated, upload.single('imageFile'), (req, res, next) => {
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
      certificate_date: req.body.certificateDate,
      organizer: req.body.organizer,
      description: req.body.description,
      //image_url: req.body.imageUrl
      image_url: API_URL + '/ftp/'+ FILE_PATH + '/' + imagefile.fieldname + '-' + now + path.extname(imagefile.originalname)   
    };

    partnerCertificateController.addCertificate(data, res);
  }
});

partnerCertificateRouter.post("/update",  headerAuth.isPartnerAuthenticated, upload.single('imageFile'), (req, res, next) => {
  const imagefile = req.file;
  const partner_id = res.locals.auth.id;

  const data = { 
    partner_id: partner_id,
    id: req.body.id,
    name: req.body.name,
    certificate_date: req.body.certificateDate,
    organizer: req.body.organizer,
    description: req.body.description
  };

  if (imagefile) {
      data.image_url = API_URL + '/ftp/'+ FILE_PATH + '/' + imagefile.fieldname + '-' + now + path.extname(imagefile.originalname);
  } 

    partnerCertificateController.updateCertificate(data, res);
  });

module.exports = partnerCertificateRouter;