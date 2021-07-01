var express = require("express");
var partnerPortfolioRouter = express.Router();
var partnerPortfolioController = require("../controllers/partnerportfolio");
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

partnerPortfolioRouter.get("/getportfolio", (req, res, next) => {
  partnerPortfolioController.getPortfolio(req, res);
});

partnerPortfolioRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
  const partner_id = res.locals.auth.id;
  partnerPortfolioController.getAllPortfolio(partner_id, res);
});

partnerPortfolioRouter.get("/get", headerAuth.isUserAuthenticated, (req, res, next) => {
  partnerPortfolioController.getDetail(req, res);
});

partnerPortfolioRouter.post("/add",  headerAuth.isPartnerAuthenticated, upload.single('portfolio'), (req, res, next) => {
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
      category_id: req.body.categoryId,
      portfolio_date: req.body.portfolioDate,
      organizer: req.body.organizer,
      description: req.body.description,
      //image_url: req.body.imageUrl
      image_url: ENV.API_URL + '/ftp/'+ FILE_PATH + '/' + imagefile.filename
    };

    partnerPortfolioController.addPortfolio(data, res);
  }
});

partnerPortfolioRouter.post("/update",  headerAuth.isPartnerAuthenticated, upload.single('portfolio'), (req, res, next) => {
  const imagefile = req.file;
  const partner_id = res.locals.auth.id;

  const data = { 
    partner_id: partner_id,
    id: req.body.id,
    name: req.body.name,
    category_id: req.body.categoryId,
    portfolio_date: req.body.portfolioDate,
    organizer: req.body.organizer,
    description: req.body.description
  };

  if (imagefile) {
      data.image_url = ENV.API_URL + '/ftp/'+ FILE_PATH + '/' + imagefile.filename;
  } 

    partnerPortfolioController.updatePortfolio(data, res);
  });

  partnerPortfolioRouter.delete("/delete", headerAuth.isPartnerAuthenticated, upload.single('portfolio'), (req, res, next) => {
    const partner_id = res.locals.auth.id;
    const data = { 
      partner_id: partner_id,
      id: req.body.id
    };
    partnerPortfolioController.deletePortfolio(data, res);
  });

module.exports = partnerPortfolioRouter;