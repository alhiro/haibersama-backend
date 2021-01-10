var express = require("express");
var dashboardRouter = express.Router();
var dashboardController = require("../controllers/dashboard");
var headerAuth  =  require('../authMiddleware');

dashboardRouter.get("/getbanners", (req, res, next) => {
  dashboardController.getBanners(req, res);
});

dashboardRouter.get("/gethotportfolios", (req, res, next) => {
  dashboardController.getHotPortfolios(req, res);
});

dashboardRouter.get("/getnewportfolios", (req, res, next) => {
  dashboardController.getNewPortfolios(req, res);
});

dashboardRouter.get("/getcategories", (req, res, next) => {
  dashboardController.getAllCategories(req, res);
});

dashboardRouter.get("/getpartnerreminder", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const data = { 
    userId: id
  };
  dashboardController.getPartnerReminder(data, res);
});

dashboardRouter.get("/getpartnerremindermore", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const data = { 
    userId: id
  };
  dashboardController.getPartnerReminderMore(data, res);
});

dashboardRouter.get("/getpartnerordersummary", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const data = { 
    userId: id
  };
  dashboardController.getPartnerOrderSummary(data, res);
});

module.exports = dashboardRouter;