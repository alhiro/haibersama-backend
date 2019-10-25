var express = require("express");
var categoryRouter = express.Router();
var categoryController = require("../controllers/category");

categoryRouter.post("/getall", (req, res, next) => {
  categoryController.getAllCategories(req, res);
});

module.exports = categoryRouter;