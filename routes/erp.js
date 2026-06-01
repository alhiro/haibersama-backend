var express = require("express");
var erpRouter = express.Router();
var controller = require("../controllers/erp");
var headerAuth = require('../authMiddleware');

erpRouter.get("/modules", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.getModules(req, res);
});

erpRouter.get("/owner-dashboard/summary", headerAuth.isErpAuthenticated, headerAuth.requireErpRoles(['Owner']), (req, res, next) => {
  controller.getOwnerDashboard(req, res);
});

erpRouter.get("/role-approval/summary", headerAuth.isErpAuthenticated, headerAuth.requireErpRoles(['Owner', 'Supervisor']), (req, res, next) => {
  controller.getRoleApprovalDashboard(req, res);
});

erpRouter.get("/role-approval/audit-logs", headerAuth.isErpAuthenticated, headerAuth.requireErpRoles(['Owner', 'Supervisor']), (req, res, next) => {
  controller.getRoleApprovalAuditLogs(req, res);
});

erpRouter.post("/approval/approve", headerAuth.isErpAuthenticated, headerAuth.requireErpRoles(['Owner', 'Supervisor']), (req, res, next) => {
  controller.approveRequest(req, res);
});

erpRouter.post("/approval/reject", headerAuth.isErpAuthenticated, headerAuth.requireErpRoles(['Owner', 'Supervisor']), (req, res, next) => {
  controller.rejectRequest(req, res);
});

erpRouter.get("/:module/options", headerAuth.isErpAuthenticated, headerAuth.requireErpModuleAccess(), (req, res, next) => {
  controller.getOptions(req, res);
});

erpRouter.get("/:module/getall", headerAuth.isErpAuthenticated, headerAuth.requireErpModuleAccess(), (req, res, next) => {
  controller.getList(req, res);
});

erpRouter.get("/:module/get", headerAuth.isErpAuthenticated, headerAuth.requireErpModuleAccess(), (req, res, next) => {
  controller.getDetail(req, res);
});

erpRouter.get("/:module/metrics", headerAuth.isErpAuthenticated, headerAuth.requireErpModuleAccess(), (req, res, next) => {
  controller.getMetrics(req, res);
});

erpRouter.get("/:module/barcode", headerAuth.isErpAuthenticated, headerAuth.requireErpModuleAccess(), (req, res, next) => {
  controller.getBarcodeConfig(req, res);
});

erpRouter.post("/:module/scan", headerAuth.isErpAuthenticated, headerAuth.requireErpModuleAccess(), (req, res, next) => {
  controller.scan(req, res);
});

erpRouter.post("/:module/add", headerAuth.isErpAuthenticated, headerAuth.requireErpModuleAccess(), headerAuth.requireErpModuleWriteAccess(), (req, res, next) => {
  controller.create(req, res);
});

erpRouter.post("/:module/update", headerAuth.isErpAuthenticated, headerAuth.requireErpModuleAccess(), headerAuth.requireErpModuleWriteAccess(), (req, res, next) => {
  controller.update(req, res);
});

erpRouter.patch("/:module/update", headerAuth.isErpAuthenticated, headerAuth.requireErpModuleAccess(), headerAuth.requireErpModuleWriteAccess(), (req, res, next) => {
  controller.update(req, res);
});

erpRouter.delete("/:module/delete", headerAuth.isErpAuthenticated, headerAuth.requireErpModuleAccess(), headerAuth.requireErpModuleWriteAccess(), (req, res, next) => {
  controller.delete(req, res);
});

module.exports = erpRouter;
