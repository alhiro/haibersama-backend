var express = require("express");
var followerRouter = express.Router();
var followerController = require("../controllers/partnerfollower");
var headerAuth  =  require('../authMiddleware')

followerRouter.get("/getall", (req, res, next) => {
  followerController.getAllFollower(req, res);
});

followerRouter.post("/getbyid", headerAuth.isUserAuthenticated, (req, res, next) => {
  const id = res.locals.auth.id;
  const email = res.locals.auth.email;
  const type = res.locals.auth.type;

  const data = { 
    page: req.body.page,
    limitItem: req.body.limitItem,
    email: email,
    userId: id,
    type: type
  };

  followerController.getByIdFollower(data, res);
});

followerRouter.post("/add", headerAuth.isUserAuthenticated, (req, res, next) => {
  const user_id = res.locals.auth.id;
  const user_email = res.locals.auth.email;

  const data = {
    user_id: user_id,
    partner_id: req.body.partner_id,
    is_delete: req.body.is_delete,
    created_by: user_email
  };

  followerController.addFollower(data, res);
});

followerRouter.post("/update", headerAuth.isUserAuthenticated, (req, res, next) => {
  followerController.updateCategory(req, res);
});

followerRouter.delete("/delete", headerAuth.isUserAuthenticated, (req, res, next) => {
  const user_id = res.locals.auth.id;
  const data = { 
    user_id: user_id,
    partner_id: req.body.partner_id
  };
  followerController.deleteFollower(data, res);
});

module.exports = followerRouter;