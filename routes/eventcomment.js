const express = require("express");
const eventCommentRouter = express.Router();
const controller = require("../controllers/eventCommentController");
var headerAuth  =  require('../authMiddleware');

eventCommentRouter.get("/get", headerAuth.isUserAuthenticated, controller.getById);
eventCommentRouter.get("/all", headerAuth.isUserAuthenticated, controller.getAllByEvent);
eventCommentRouter.post("/add", headerAuth.isUserAuthenticated, controller.addComment);
eventCommentRouter.put("/edit", headerAuth.isUserAuthenticated, controller.editComment);
eventCommentRouter.delete("/delete", headerAuth.isUserAuthenticated, controller.deleteComment);
eventCommentRouter.delete("/deleteUser", headerAuth.isAdminAuthenticated, controller.deleteCommentUser);

module.exports = eventCommentRouter;
