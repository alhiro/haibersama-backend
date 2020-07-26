var express = require("express");
var bannerRouter = express.Router();
var bannerController = require("../controllers/banner");
var headerAuth  =  require('../authMiddleware')

bannerRouter.get("/getall", headerAuth.isUserAuthenticated, (req, res, next) => {
  bannerController.getAllCategories(req, res);
});

bannerRouter.post("/add", headerAuth.isUserAuthenticated, upload.single('bannerImage'), (req, res, next) => {
  const bannerimage = req.file;
  
  // make sure file is available
  if (!bannerimage) {
      res.status(400).send({
          status: false,
          data: 'No file is selected.'
      });
  } else {
      const data = { 
        title: req.body.title, 
        description: req.body.description, 
        image_url: 'http://staging.haiorganizer.com/imagehai/' + avatar.originalname, 
        order_no: req.body.orderNo, 
        active: req.body.active
      };
      
      bannerController.addBanner(data, res);
  }    
});

bannerRouter.post("/update", headerAuth.isUserAuthenticated, (req, res, next) => {
  const bannerimage = req.file;
  
  // make sure file is available
  if (!bannerimage) {
    const data = { 
      title: req.body.title, 
      description: req.body.description, 
      image_url: req.body.imageUrl, 
      order_no: req.body.orderNo, 
      active: req.body.active
    };
    
    bannerController.updateBanner(data, res);
  } else {
      const data = { 
        title: req.body.title, 
        description: req.body.description, 
        image_url: 'http://staging.haiorganizer.com/imagehai/' + avatar.originalname, 
        order_no: req.body.orderNo, 
        active: req.body.active
      };
      
      bannerController.updateBanner(data, res);
  }   
});

module.exports = bannerRouter;