var express = require("express");
var partnerRouter = express.Router();
var partnerController = require("../controllers/partner");
var headerAuth  =  require('../authMiddleware')

partnerRouter.get("/getdetail", headerAuth.isUserAuthenticated, (req, res, next) => {
  const partner_id = req.query.id;
  const user_id = res.locals.auth.id;
  const user_email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = {
    partner_id: partner_id,
    user_id: user_id,
    user_email: user_email,
    type: type
  };
  console.log('data partner');
  console.log(data);

  partnerController.getDetailUser(data, res);
});

// partnerRouter.get("/getdetail", (req, res, next) => {
//   partnerController.getDetailUser(req, res);
// });

partnerRouter.post("/getpartner", (req, res, next) => {
  partnerController.getPartner(req, res);
});

partnerRouter.post("/search", (req, res, next) => {
  partnerController.searchPartner(req, res);
});

partnerRouter.post("/searchglobal", (req, res, next) => {
  partnerController.searchPartnerGlobal(req, res);
});

partnerRouter.get("/province", (req, res, next) => {
  partnerController.provinces(req, res);
});

partnerRouter.get("/city", (req, res, next) => {
  partnerController.city(req, res);
});

module.exports = partnerRouter;