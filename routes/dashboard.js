var express = require("express");
var dashboardRouter = express.Router();
var dashboardController = require("../controllers/dashboard");

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

module.exports = dashboardRouter;