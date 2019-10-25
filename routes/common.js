var express = require("express");
var commonRouter = express.Router();
var commonController = require("../controllers/common");

commonRouter.post("/getbanners", (req, res, next) => {
  commonController.getBanners(req, res);
});

module.exports = commonRouter;