var express = require("express");
var walletRouter = express.Router();
var walletController = require("../controllers/wallet");
var headerAuth  =  require('../authMiddleware');

walletRouter.get("/gethistories", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    userId: id
  };
  
  walletController.getHistories(data, res);
});

module.exports = walletRouter;