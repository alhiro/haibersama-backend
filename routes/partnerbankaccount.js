var express = require("express");
var partnerBankAccountRouter = express.Router();
var partnerBankAccountController = require("../controllers/partnerbankaccount");
var headerAuth  =  require('../authMiddleware')

partnerBankAccountRouter.get("/getall", headerAuth.isPartnerAuthenticated, (req, res, next) => {
    const partner_id = res.locals.auth.id;
    partnerBankAccountController.getAll(partner_id, res);
});

partnerBankAccountRouter.get("/get", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  partnerBankAccountController.getDetail(req, res);
});

partnerBankAccountRouter.post("/add",  headerAuth.isPartnerAuthenticated, (req, res, next) => {
    const partner_id = res.locals.auth.id;

    const data = { 
      partner_id: partner_id,
      bank_code: req.body.bank_code,
      bank_name: req.body.bank_name,
      account_no: req.body.account_no,
      account_name: req.body.account_name,
      is_active: req.body.is_active
    };

    partnerBankAccountController.addAccount(data, res);
  });

partnerBankAccountRouter.post("/update",  headerAuth.isPartnerAuthenticated, (req, res, next) => {
    const partner_id = res.locals.auth.id;

    const data = { 
      partner_id: partner_id,
      id: req.body.id,
      bank_code: req.body.bank_code,
      bank_name: req.body.bank_name,
      account_no: req.body.account_no,
      account_name: req.body.account_name,
      is_active: req.body.is_active
    };

    partnerBankAccountController.updateAccount(data, res);
  });

module.exports = partnerBankAccountRouter;