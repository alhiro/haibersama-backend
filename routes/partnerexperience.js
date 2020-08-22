// var express = require("express");
// var partnerExperienceRouter = express.Router();
// var partnerExperienceController = require("../controllers/partnerexperience");
// var headerAuth  =  require('../authMiddleware')

// partnerExperienceRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
//     const partner_id = res.locals.auth.id;
//     partnerExperienceController.getAllExperience(partner_id, res);
// });

// partnerExperienceRouter.get("/get", headerAuth.isUserAuthenticated, (req, res, next) => {
//   partnerExperienceController.getDetail(req, res);
// });

// partnerExperienceRouter.post("/add",  headerAuth.isPartnerAuthenticated, (req, res, next) => {
//     const partner_id = res.locals.auth.id;

//     const data = { 
//       partner_id: partner_id,
//       position: req.body.position,
//       period_from: req.body.periodFrom,
//       period_to: req.body.periodTo,
//       company_name: req.body.companyName,
//       description: req.body.description,
//       image_url: req.body.imageUrl
//     };

//     partnerExperienceController.addExperience(data, res);
//   });

// partnerExperienceRouter.post("/update",  headerAuth.isPartnerAuthenticated, (req, res, next) => {
//   const partner_id = res.locals.auth.id;

//   const data = { 
//     partner_id: partner_id,
//     id: req.body.id,
//     position: req.body.position,
//     period_from: req.body.periodFrom,
//     period_to: req.body.periodTo,
//     company_name: req.body.companyName,
//     description: req.body.description,
//     image_url: req.body.imageUrl
//   };

//     partnerExperienceController.updateExperience(data, res);
//   });

// module.exports = partnerExperienceRouter;