var express = require("express");
var categoryRouter = express.Router();
var categoryController = require("../controllers/category");
var headerAuth  =  require('../authMiddleware')

categoryRouter.get("/getall", (req, res, next) => {
  categoryController.getAllCategories(req, res);
});

categoryRouter.post("/add", headerAuth.isAdminAuthenticated, (req, res, next) => {
  categoryController.addCategory(req, res);
});

categoryRouter.post("/update", headerAuth.isAdminAuthenticated, (req, res, next) => {
  categoryController.updateCategory(req, res);
});

module.exports = categoryRouter;