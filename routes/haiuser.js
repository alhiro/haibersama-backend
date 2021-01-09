var express = require("express");
var authRouter = express.Router();
var headerAuth  =  require('../authMiddleware')
var validator = require("../validator/auth");
var authController = require("../controllers/auth");
const passportConf = require("../lib/passport");
const jwt = require("../lib/jwt");
const path = require('path');
const multer = require('multer');
// upload file path
const FILE_PATH = 'imagehai';
// const API_URL = process.env;
const API_URL ='http://development.haiorganizer.com';
const now = Date.now();
// configure multer

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './public/' + FILE_PATH)
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

//will be using this for uplading
const upload = multer({ storage: storage });

authRouter.get("/getAll", headerAuth.isUserAuthenticated,(req, res, next) => {
  authController.getAll(req, res);
});

authRouter.post("/login", validator.login(), (req, res, next) => {
  authController.login(req, res);
});

authRouter.post("/register", validator.register(), (req, res, next) => {
  authController.registerUser(req, res);
});

authRouter.post("/registerPartner", (req, res, next) => {
  authController.registerPartner(req, res);
});

authRouter.post("/registerGoogle", (req, res, next) => {
  authController.registerGoogle(req, res);
});

authRouter.get("/verify" ,(req, res, next) => {
  authController.verify(req, res);
});

authRouter.post("/updateProfile", headerAuth.isUserAuthenticated, upload.single('verified_document'), (req, res, next) => {
  console.log("endpoint : update Profile")
  const email = res.locals.auth.email
  console.log("email :", email)
  const docimage = req.file;
  console.log(docimage);
  console.log('storage location is ', req.hostname +'/' + req.file.path);
  // make sure file is available
  if (!docimage) {
      res.status(400).send({
          status: false,
          data: 'No file is selected.'
      });
  } else {
    const verified_document =  API_URL + '/ftp/'+ FILE_PATH + '/' + docimage.fieldname + '-' + now + path.extname(docimage.originalname);
    const data = { name: req.body.name, address: req.body.address, phone: req.body.phone_number, 
                    dob: req.body.dob, nation:req.body.nation, province: req.body.province, city: req.body.city, 
                    postalcode: req.body.postalcode, verified_document: verified_document, email: email, type: req.body.usertype}
    authController.updateProfile(data, res);
  }
});

authRouter.get("/google", passportConf.authenticate("google", { scope: ["profile", "email", "openid"], state: 'client' })
 );

authRouter.get("/googlePartner", passportConf.authenticate("google", { scope: ["profile", "email", "openid"], state: 'partner' })
);

authRouter.get(
  "/google/callback",
  passportConf.authenticate("google", { failureRedirect: "api/auth/login" }),
  // response callback user, email, status verified, token
  // (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));
  async (req, res, next) => {
    try {
      console.log("state : "+ JSON.stringify(req.query.state) );

      console.log("request : "+ JSON.stringify(req.user) )
      
      const reqUser = { email: req.user.email , name: req.user.name , picture: req.user.picture, userType: req.query.state}
      console.log("data : "+ JSON.stringify(reqUser) )
      const checkUser = await authController.googleLoginCallBack(
        reqUser
      );

      let data = {};
      console.log("checkUser :"+JSON.stringify(checkUser));

      data.token = checkUser.token; // token from bizzytruckway
      const decoded = await jwt.verify(checkUser.token);
      data.expiresIn = new Date(decoded.exp * 1000),
      data.refresh_token = checkUser.refresh_token
      
      if (checkUser.token) {
        console.log("sukses login");
         return res.status(200).send({
          code: 200,
          success: true,
          message: "Login Successfull",
          data: data
        });
      } else {
        console.log("gagal login");
        return res.status(500).send({
          code: 500,
          success: false,
          message: "Login Failed",
          data: data
        });
        //res.redirect("truckway://signup?user=" + JSON.stringify(data));
        // res.send(JSON.stringify(data))
      }
    } catch (error) {
      next(error);
    }
  }
);

authRouter.get("/me", headerAuth.isUserAuthenticated , (req, res, next) => {
  console.log("endpoint : get Profile")
  const email = res.locals.auth.email
  console.log("email :", email)

  authController.getProfile(email, res);
});

module.exports = authRouter;
