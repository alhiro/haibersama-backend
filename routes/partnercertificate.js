var express = require("express");
var partnerCertificateRouter = express.Router();
var partnerCertificateController = require("../controllers/partnercertificate");
var headerAuth  =  require('../authMiddleware')

partnerCertificateRouter.get("/getall", headerAuth.isPartnerAuthenticated, (req, res, next) => {
    const partner_id = res.locals.auth.id;
    partnerCertificateController.getAllCertificate(partner_id, res);
});

partnerCertificateRouter.get("/get", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  partnerCertificateController.getDetail(req, res);
});

partnerCertificateRouter.post("/add",  headerAuth.isPartnerAuthenticated, (req, res, next) => {
    const partner_id = res.locals.auth.id;

    const data = { 
      partner_id: partner_id,
      name: req.body.name,
      certificate_date: req.body.certificateDate,
      organizer: req.body.organizer,
      description: req.body.description,
      image_url: req.body.imageUrl
    };

    partnerCertificateController.addCertificate(data, res);
  });

partnerCertificateRouter.post("/update",  headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const partner_id = res.locals.auth.id;

  const data = { 
    partner_id: partner_id,
    id: req.body.id,
    name: req.body.name,
    certificate_date: req.body.certificateDate,
    organizer: req.body.organizer,
    description: req.body.description,
    image_url: req.body.imageUrl
  };

    partnerCertificateController.updateCertificate(data, res);
  });

module.exports = partnerCertificateRouter;