const jwt = require("../lib/jwt");
const auth = require("../services/haiuser");
var nodemailer = require("nodemailer");
const sequelizeTransaction = require("../config/sequelizeTransaction");
const {
  VERIFY_URL
} = process.env;


exports.login = async function(req, res, next) {
  console.log("controller login");

  const { body } = req;
  const { email, password } = body;

  try {
    console.log("email : " + email);
    var users = await auth.findUser({ email });

    if (!users.success) {
      users.responseCode = 404;
      return res.status(users.responseCode).send(users);
    }

    if (users.data.active === 0) {
      return res.status(401).send({
        code: 401,
        success: false,
        message: "That Username is currently inactive",
        data: {}
      });
    } else {
      console.log("pass hash: "+users.data.password);

      const hashPass = await jwt.hash(password, 10);
      console.log("hash: "+hashPass)
      jwt
        .compare(password, users.data.password)
        .then(async function(done) {
          let response = await auth.login(users.data, false, 1);
          response.code = response.success ? 200 : 500;
          return res.status(response.code).send(response);
        })
        .catch(function(error) {
          return res.status(400).send({
            code: 400,
            success: false,
            message: "Invalid Username / Password",
            data: {}
          });
        });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.register = async function(req, res, next) {
  console.log("controller register 2");

  const { body } = req;
  const { email } = body;
  const transaction = await sequelizeTransaction.transaction();

  try {
    console.log("email : " + email);
    var users = await auth.findUser({ email });

    if (!users.success) {
      console.log(users);
      //create user by email n password
      //hash email
      var register = await auth.registerUser(body, transaction);
      console.log("register test" + register.data);

      var smtpTransport = nodemailer.createTransport({
        host: "mail.haiorganizer.com",
        port: 465,
        secure: true,
        auth: {
          user: "notify@haiorganizer.com",
          pass: "shasmeen11!"
        }
      });

      let mailoptions = {
        from: '"<notify>" notify@haiorganizer.com',
        to: email,
        subject: "verify your hai account",
        html:
          "<h4><b>Verify Account</b></h4>" +
          "<p>To verify hai your account, click this link:</p>" +
          "<a href=" +
          VERIFY_URL +
          "/api/" +
          "auth/" +
          "verify?" +
          "email=" +
          email +
          "&" +
          "token=" +
          register.data.token +
          '>' +
          VERIFY_URL +
          "/api/" +
          "auth/" +
          "verify?" +
          "email=" +
          email +
          "&" +
          "token=" +
          register.data.token +
          "</a>" +
          "<br><br>" +
          "<p>--Team</p>"
      };
      console.log("mailoptions :" + JSON.stringify(mailoptions));

      smtpTransport.sendMail(mailoptions, function(error, res) {
        if (error) {
          console.log(error);
        } else {
          console.log("Message sent: " + res.response);
        }
        //smtpTransport.close();
      });

      return res.status(200).send(register);
    } else {
      return res.status(401).send({
        code: 401,
        success: false,
        message: "That Email is already registered",
        data: {}
      });
    }

    /* jwt.compare(password, users.data.password)
    .then(async function (done) {
        let response = await auth.login(users.data, false, 1);
        response.code = response.success ? 200 : 500;
        return res.status(response.code).send(response);
      })
      .catch(function (error) {
        return res.status(400).send({
          code: 400,
          success: false,
          message: "Invalid Username / Password",
          data: {}
        });
      }); */
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: {} });
  }
};

exports.verify = async function(req, res, next) {
  console.log("controller verify");

  try {
    let email = req.query.email;
    let token = req.query.token;

    console.log("email : " + req.query.email);
    console.log("token : " + req.query.token);
    var users = await auth.findUser({ email });

    if (!users.success) {
      users.responseCode = 404;
      return res.status(users.responseCode).send(users);
    }

    if (users.data.active == 1) {
      console.log(users.data);
      delete users.data.dataValues.password;

      console.log(users["data"]["password"]);
      delete users["data"]["password"];
      return res.status(401).send({
        code: 401,
        success: false,
        message: "That Username is already active",
        data: users.data
      });
    }
    //console.log(users);
    var verifyUser = await auth.verifyUser(email, token);
    
    return res.status(200).send(verifyUser);
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};
