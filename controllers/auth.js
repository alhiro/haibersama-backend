const jwt = require("../lib/jwt");
const auth = require("../services/haiuser");
const sequelizeTransaction = require("../config/sequelizeTransaction");
const axios = require("axios");
const utils = require("../lib/utils");
const { VERIFY_URL, EMAIL_PASSWORD, EMAIL_USERNAME } = process.env;
var nodemailer = require("nodemailer");
var Hogan = require("hogan.js");
var fs = require("fs");

exports.getAll =  async function(req, res, next) {
  try {
    let response = await auth.getAll();

    response.code = response.success ? 200 : 500;
    
    console.log( response.code, "error")
    return res.status(response.code).send(response);
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: "Error Data User", data: { err } });
  }
}

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
        message: "Nama Pengguna Saat Ini Tidak Aktif",
        data: {}
      });
    } else {
      console.log("pass hash: " + users.data.password);

      const hashPass = await jwt.hash(password, 10);
      console.log("hash: " + hashPass);
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
            message: "Nama Pengguna / Kata Sandi Tidak Benar",
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

exports.registerUser = async function(req, res, next) {
  console.log("controller register User");

  const { body } = req;
  const { email } = body;
  const transaction = await sequelizeTransaction.transaction();

  try {
    if(!email)
    {    
      return res.status(401).send({
        code: 401,
        success: false,
        message: "Emailnya Kosong",
        data: {}
      });    
    } else {
      console.log("email : " + email);
      var users = await auth.findUser({ email });

      if (!users.success) {
        console.log(users);
        //create user by email n password
        //hash email
        var register = await auth.registerUser(body, transaction);
        console.log("register test" + register.data);

        var smtpTransport = nodemailer.createTransport({
          host: "missandei.id.rapidplex.com",
          port: 465,
          secure: true,
          auth: {
            user: EMAIL_USERNAME,
            pass: EMAIL_PASSWORD
          }
        });

        var templateInvoice = fs.readFileSync('./views/activation.html', 'utf-8');
        var compileInvoice = Hogan.compile(templateInvoice);

        let mailoptions = {
          from: '"Haio Notify" notify@haiorganizer.com',
          to: email,
          subject: `Hai ${register.data.name}, silahkan verifikasi akun Haio`,
          html: compileInvoice.render({
            userName: register.data.name,
            verifyUrl: VERIFY_URL,
            userEmail: email,
            token: register.data.token
          })
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
          message: "Email Sudah Terdaftar",
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
    }
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: {} });
  }
};

exports.registerPartner = async function(req, res, next) {
  console.log("controller register Partner");

  const { body } = req;
  const { email } = body;
  const transaction = await sequelizeTransaction.transaction();

  console.log("body: "+ JSON.stringify(body.categoryid))

  try {
    console.log("email : " + email);
    var users = await auth.findUser({ email });

    if (!users.success) {
      console.log(users);
      //create user by email n password
      //hash email
      var register = await auth.registerPartner(body, transaction);
      console.log("register partner" + register.data);

      var smtpTransport = nodemailer.createTransport({
        host: "missandei.id.rapidplex.com",
        port: 465,
        secure: true,
        auth: {
          user: EMAIL_USERNAME,
          pass: EMAIL_PASSWORD
        }
      });

      var templateInvoice = fs.readFileSync('./views/activation.html', 'utf-8');
      var compileInvoice = Hogan.compile(templateInvoice);

      let mailoptions = {
        from: '"Haio Aktifasi" notify@haiorganizer.com',
        to: email,
        subject: `Hai ${register.data.name}, silahkan verifikasi akun Haio`,
        html: compileInvoice.render({
          userName: register.data.name,
          verifyUrl: VERIFY_URL,
          userEmail: email,
          token: register.data.token
        })
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
        message: "Email Sudah Terdaftar",
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

exports.registerGoogle = async function(req, res, next) {
  console.log("controller register google");

  const { body } = req;
  const { token } = body;

  const response = await axios({
    url: "https://oauth2.googleapis.com/tokeninfo?id_token=" + token,
    method: "get"
  });

  console.log(response.data);
  const { email, name, picture } = response.data;
  const transaction = await sequelizeTransaction.transaction();

  try {
    console.log("email : " + email);
    var users = await auth.findUser({ email });

    if (!users.success) {
      console.log(users);
      //create user by email n password
      //hash email
      var register = await auth.registerGoogleUser(
        { email, name, picture },
        transaction
      );
      console.log("register test" + register.data);

      var smtpTransport = nodemailer.createTransport({
        host: "missandei.id.rapidplex.com",
        port: 465,
        secure: true,
        auth: {
          user: EMAIL_USERNAME,
          pass: EMAIL_PASSWORD
        }
      });

      let mailoptions = {
        from: '"<notify>" notify@haiorganizer.com',
        to: email,
        subject: "Verifikasi Akun Haio",
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
          ">" +
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
        message: "Email Sudah Terdaftar",
        data: {}
      });
    }
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
        // code: 401,
        // success: false,
        message: "Akun sudah aktif ya. Silahkan login di aplikasi. Terima kasih dan selamat bergabung :)",
        // data: users.data
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

exports.updateProfile = async function(req, res, next) {
  console.log("controller update profile");

  try {
    var response = await auth.updateProfile(req);

    response.code = response.success ? 200 : 500;
    return res.status(200).send(response);
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: {} });
  }
};

exports.updatePassword = async function(req, res, next) {
  console.log("controller update profile password");

  try {
    var response = await auth.updatePassword(req);

    response.code = response.success ? 200 : 500;
    return res.status(200).send(response);
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: {} });
  }
};

exports.googleLoginCallBack = async function(req, res, next) {
  try {
    const { email, name, picture, userType } = req;
    console.log("email2 : " + email);
    console.log("name2 : " + name);
    console.log("picture2: " + picture);
    console.log("userType: " + userType);

    let users = await auth.findUser({
      email: email
    });

    console.log("users :" + JSON.stringify(users));
    if (!users.success) {
      //create user by email n password
      //hash email

      const transaction = await sequelizeTransaction.transaction();
      users = await auth.registerGoogleUser(
        { email, name, picture, userType },
        transaction
      );
      console.log("register test" + users.data);

      /* 
      var smtpTransport = nodemailer.createTransport({
        host: "missandei.id.rapidplex.com",
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
      }); */

      //return res.status(200).send(register);
    }

    let data = {
      id: users.data.id,
      email: email,
      refresh_token: null,
      phone_number: users.data.phone_number,
      provider: "google",
      type : users.data.type
    };

    console.log("data: " + JSON.stringify(data));

    const token = await jwt.sign(data);
    const decoded = await jwt.verify(token);
    const random = await utils.randomChar(8);

    //check if revoke refresh token is true. return null if true, or assign new refresh token if false
    const refresh_token = await jwt.sign({ random });

    console.log("token: " + token);

    return { users, token, decoded, refresh_token };
  } catch (error) {
    throw error;
  }
};

exports.getProfile =  async function(req, res, next) {
  try {
    const params = { email: req }
    let response = await auth.findUserProfile(params);

    response.code = response.success ? 200 : 500;
    return res.status(response.code).send(response);
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: "Error", data: { err } });
  }
}
