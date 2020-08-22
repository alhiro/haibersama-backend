var express = require("express");
var partnerAwardsRouter = express.Router();
var partnerAwardsController = require("../controllers/partnerawards");
var headerAuth  =  require('../authMiddleware')

partnerAwardsRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
    const partner_id = res.locals.auth.id;
    partnerAwardsController.getAllAwards(partner_id, res);
});

partnerAwardsRouter.get("/get", headerAuth.isUserAuthenticated, (req, res, next) => {
  partnerAwardsController.getDetail(req, res);
});

partnerAwardsRouter.post("/add",  headerAuth.isPartnerAuthenticated, (req, res, next) => {
    const partner_id = res.locals.auth.id;

    const data = { 
      partner_id: partner_id,
      name: req.body.name,
      awards_date: req.body.awardsDate,
      organizer: req.body.organizer,
      description: req.body.description,
      image_url: req.body.imageUrl
    };

    partnerAwardsController.addAwards(data, res);
  });

partnerAwardsRouter.post("/update",  headerAuth.isPartnerAuthenticated, (req, res, next) => {
    const partner_id = res.locals.auth.id;

    const data = { 
      partner_id: partner_id,
      id: req.body.id,
      name: req.body.name,
      awards_date: req.body.awardsDate,
      organizer: req.body.organizer,
      description: req.body.description,
      image_url: req.body.imageUrl
    };

    partnerAwardsController.updateAwards(data, res);
  });

module.exports = partnerAwardsRouter;