var express = require("express");
var authRouter = express.Router();
var headerAuth  =  require('../authMiddleware')
var validator = require("../validator/auth");
var authController = require("../controllers/auth");

authRouter.post("/login", validator.login(), (req, res, next) => {
  authController.login(req, res);
});

authRouter.post("/register", validator.register(), (req, res, next) => {
  authController.register(req, res);
});

authRouter.get("/verify" ,(req, res, next) => {
  authController.verify(req, res);
});

module.exports = authRouter;
