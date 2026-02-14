var express = require("express");
var settingRouter = express.Router();
var settingController = require("../controllers/appsetting");
var headerAuth  =  require('../authMiddleware')

settingRouter.get("/get", headerAuth.isUserAuthenticated,(req, res, next) => {
  settingController.getAllSetting(req, res);
});

settingRouter.patch("/update", headerAuth.isAdminAuthenticated,(req, res, next) => {
  const partner_id = res.locals.auth.id;

  const data = { 
    id: req.body.id,
    setting_name: req.body.setting_name,
    setting_value: req.body.setting_value,
    remark: req.body.remark,
    updated_by: partner_id,
  };
  console.log(data);

  settingController.updateSetting(data, res);
});

module.exports = settingRouter;