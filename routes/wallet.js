var express = require("express");
var walletRouter = express.Router();
var walletController = require("../controllers/wallet");
var headerAuth  =  require('../authMiddleware');

walletRouter.post("/histories", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    userId: id,
    date_from: req.body.date_from,
    date_to: req.body.date_to
  };
  
  walletController.getHistories(data, res);
});

walletRouter.post("/historiesgroupbydate", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    userId: id,
    date_from: req.body.date_from,
    date_to: req.body.date_to
  };
  
  walletController.getHistoriesGroupByDate(data, res);
});

walletRouter.post("/historiesgroupbyeventdate", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  // const type = res.locals.auth.type;

  const data = { 
    userId: id,
    date_from: req.body.date_from,
    date_to: req.body.date_to,
    type: req.body.type
  };
  
  walletController.getHistoriesGroupByEventDate(data, res);
});

walletRouter.get("/getbalance", (headerAuth.isPartnerAuthenticated, headerAuth.isUserAuthenticated), (req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    userId: id
  };
  
  walletController.getbalance(data, res);
});

walletRouter.post("/withdraw", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const type = res.locals.auth.type;

  const data = { 
    userId: id,
    totalAmount: req.body.totalAmount
  };
  
  walletController.withdraw(data, res);
});

module.exports = walletRouter;