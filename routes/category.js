var express = require("express");
var categoryRouter = express.Router();
var categoryController = require("../controllers/category");
var headerAuth  =  require('../authMiddleware')

categoryRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
  categoryController.getAllCategories(req, res);
});

categoryRouter.post("/add", headerAuth.isUserAuthenticated, (req, res, next) => {
  categoryController.addCategory(req, res);
});

categoryRouter.post("/update", headerAuth.isUserAuthenticated, (req, res, next) => {
  categoryController.updateCategory(req, res);
});

module.exports = categoryRouter;