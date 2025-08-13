var express = require("express");
var aiRouter = express.Router();
var aiController = require("../controllers/aiController");
var headerAuth  =  require('../authMiddleware')

aiRouter.post("/search", headerAuth.isUserAuthenticated,(req, res, next) => {
  const body = {
    text: req.body.text
  }

  aiController.searchAi(body, req, res);
});

aiRouter.post("/searchPartner", headerAuth.limiter, headerAuth.isUserAuthenticated,(req, res, next) => {
  const body = {
    text: req.body.text
  }

  aiController.searchAiPartner(body, req, res);
});

aiRouter.post("/searchApi", headerAuth.limiter, headerAuth.isUserAuthenticated,(req, res, next) => {
  const body = {
    text: req.body.text
  }

  aiController.searchAiApi(body, req, res);
});

module.exports = aiRouter;