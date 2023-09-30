var express = require("express");
var partnerRatingRouter = express.Router();
var partnerRatingController = require("../controllers/partnerrating");
var headerAuth  =  require('../authMiddleware')

partnerRatingRouter.get("/getlist", headerAuth.isUserAuthenticated, (req, res, next) => {
  var reservationId = req.query.reservationId;
  partnerRatingController.getAllRating(reservationId, res);
});

partnerRatingRouter.post("/getlistpartner", headerAuth.isUserAuthenticated, (req, res, next) => {
  const partnerId = res.locals.auth.id;
  const partner_id = req.query.id;

  const data = { 
    page: req.body.page,
    limitItem: req.body.limitItem,
    partnerId: partnerId,
    partner_id: partner_id
  };

  partnerRatingController.getAllRatingPartner(data, res);
});

partnerRatingRouter.post("/add",  headerAuth.isUserAuthenticated, (req, res, next) => {
    const userId = res.locals.auth.id;

    const data = { 
      userId: userId,
      reservationId: req.body.reservationId,
      rating: req.body.rating,
      review: req.body.review
    };

    partnerRatingController.addRating(data, res);
  });

partnerRatingRouter.post("/reply",  headerAuth.isUserAuthenticated, (req, res, next) => {
  const partner_id = res.locals.auth.id;

  const data = { 
    partnerId: partner_id,
    id: req.body.id,
    reviewReply: req.body.reviewReply
  };

    partnerRatingController.replyReview(data, res);
  });

module.exports = partnerRatingRouter;