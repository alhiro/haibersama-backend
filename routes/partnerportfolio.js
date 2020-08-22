// var express = require("express");
// var partnerPortfolioRouter = express.Router();
// var partnerPortfolioController = require("../controllers/partnerportfolio");
// var headerAuth  =  require('../authMiddleware')

// partnerPortfolioRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
//   const partner_id = res.locals.auth.id;
//   partnerPortfolioController.getAllPortfolio(partner_id, res);
// });

// partnerPortfolioRouter.get("/get", headerAuth.isUserAuthenticated, (req, res, next) => {
//   partnerPortfolioController.getDetail(req, res);
// });

// partnerPortfolioRouter.post("/add",  headerAuth.isPartnerAuthenticated, (req, res, next) => {
//     const partner_id = res.locals.auth.id;

//     const data = { 
//       partner_id: partner_id,
//       name: req.body.name,
//       category_id: req.body.categoryId,
//       portfolio_date: req.body.portfolioDate,
//       organizer: req.body.organizer,
//       description: req.body.description,
//       image_url: req.body.imageUrl
//     };

//     partnerPortfolioController.addPortfolio(data, res);
//   });

// partnerPortfolioRouter.post("/update",  headerAuth.isPartnerAuthenticated, (req, res, next) => {
//   const partner_id = res.locals.auth.id;

//   const data = { 
//     partner_id: partner_id,
//     id: req.body.id,
//     name: req.body.name,
//     category_id: req.body.categoryId,
//     portfolio_date: req.body.portfolioDate,
//     organizer: req.body.organizer,
//     description: req.body.description,
//     image_url: req.body.imageUrl
//   };

//     partnerPortfolioController.updatePortfolio(data, res);
//   });

// module.exports = partnerPortfolioRouter;