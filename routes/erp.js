var express = require("express");
var erpRouter = express.Router();
var controller = require("../controllers/erp");
var headerAuth = require('../authMiddleware');

erpRouter.get("/modules", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.getModules(req, res);
});

erpRouter.get("/:module/options", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.getOptions(req, res);
});

erpRouter.get("/:module/getall", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.getList(req, res);
});

erpRouter.get("/:module/get", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.getDetail(req, res);
});

erpRouter.get("/:module/metrics", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.getMetrics(req, res);
});

erpRouter.get("/:module/barcode", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.getBarcodeConfig(req, res);
});

erpRouter.post("/:module/scan", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.scan(req, res);
});

erpRouter.post("/:module/add", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.create(req, res);
});

erpRouter.post("/:module/update", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.update(req, res);
});

erpRouter.patch("/:module/update", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.update(req, res);
});

erpRouter.delete("/:module/delete", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.delete(req, res);
});

module.exports = erpRouter;
