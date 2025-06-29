const User = require("../models/haiuser");
const PartnerCategory = require("../models/partnerCategory");
const PartnerService = require("../services/partner");
const PartnerAward = require('../models/partnerawards');
const PartnerCertificate = require('../models/partnercertificate');
const PartnerExperience = require('../models/partnerexperience');
const PartnerPortfolio = require('../models/partnerportfolio');
const PartnerPackage = require('../models/partnerPackageHeader');
const PartnerFollower = require("../models/partnerFollower");
const { VERIFY_URL, EMAIL_PASSWORD, EMAIL_USERNAME } = process.env;
const nodemailer = require("nodemailer");
//const Otp = require('../models/otp');
const transformers = require("../lib/transformers");
const jwt = require("../lib/jwt");
const utils = require("../lib/utils");
const dbSeq = require("../config/sequelize");
const moment = require("moment");
const path = require('path');
const {
  NODE_ENV,
  APP_ID,
  SMS_PROVIDER,
  SMS_SENDER_NUMBER,
  SMS_PRODUCER_NAME,
  EMAIL_PRODUCER_NAME,
  APP_LOCAL_DOMAIN
} = process.env;

const now = moment()
  .utcOffset(7)
  .format("YYYY-MM-DD HH:mm:ss");
const StoreHelper = require("../helpers/store");
const crypto = require("crypto-random-string");
var async = require('async');
var cryptos = require('crypto');
const resetSecret = process.env.TOKEN_JWT_SECRET;
const {check, validationResult} = require('express-validator');
const partnerfollower = require("./partnerfollower");

const sequelize = require("../config/sequelize");

module.exports = {
  login: async (users, revoke) => {
    console.log("login service");
    let user = {};

    user = await transformers.user(users);

    console.log(user);
    const token = await jwt.sign(user);
    const decoded = await jwt.verify(token);
    const random = await utils.randomChar(8);
    console.log("token", decoded);
    //check if revoke refresh token is true. return null if true, or assign new refresh token if false
    const refresh_token = revoke ? null : await jwt.sign({ random });

    let data = {
      last_login: now,
      refresh_token: refresh_token
    };

    return User.update(data, { where: { email: users.email }, 
      returning: true,
      plain: true })
      .then(updated => {
        const user = updated[1].dataValues;
        // console.log("updated : ", user)

        return {
          success: true,
          message: "Berhasil Login",
          data: {
            type: user.type == 1 ? "user" : "partner",
            active: user.active,
            phone: user.phone_number,
            idx: user.id,
            token,
            expiresIn: new Date(decoded.exp * 1000),
            refresh_token
          }
        };
      })
      .catch(err => {
        return { success: false, message: "Gagal Login", data: err };
      });
  },

  getAll: async () => {
    try {
      console.log("user get all");
      return await User.findAll({
        include: [
          {
            model: PartnerCategory,
          },
          // {
          //   model: PartnerFollower,
          // }
        ]
      }).then(users => {
        //delete users.dataValues.password
        return !users
          ? { success: false, message: "User Belum Ada!", data: {} }
          : { success: true, message: "User Berhasil Ditemukan", data: users };
      })
      .catch(err => {
        return { success: false, message: "User Belum Ada, Ada Kesalahan Server!", data: err };
      });
      ;
    } catch (error) {
      throw error;
    }
  },

  findUser: async params => {
    console.log("servive findUser")
    console.log("params : "+ JSON.stringify(params))
    return await User.findOne({ where: params })
      .then(users => {
        //delete users.dataValues.password
        return !users
          ? { success: false, message: "User Tidak Ditemukan", data: {} }
          : { success: true, message: "User Ditemukan", data: users };
      })
      .catch(err => {
        return { success: false, message: "User Tidak Ditemukan", data: err };
      });
  },

  findUserProfile: async (params, req) => {    
    try {
      console.log('req me' )
      console.log(req)

      var users = await User.findOne({ 
        where: params,
        attributes: [
          "id", "email", "name", "picture", "given_name", "family_name", "phone_number", "active", "token", "address", "nation", "dob", "province", "city", "postalcode", "type", "title", "description", "longitude", "latitude", "whatsapp_number", "last_login", "refresh_token", "reset_token", "expired_reset_token", "verified_document", "is_verified", "process_verified", "created_at", "created_by", "updated_at", "updated_by", "createdAt", "updatedAt",
          [
            sequelize.literal(`(
            SELECT COUNT(reservation_no)
                FROM reservation rv
                WHERE rv.user_id = `+req.partner_id+`
                AND (rv.status_code = 'ORDER_NEW' OR rv.status_code = 'ORDER_PARTNER_CONFIRM')
                ORDER BY COUNT(reservation_no) DESC
            )`),
            'cart_length',
          ],
        ],
        include: [
          {
            model: PartnerAward
          },
          {
            model: PartnerCertificate
          },
          {
            model: PartnerExperience
          },
          {
            model: PartnerPortfolio
          },
          {
            model: PartnerPackage
          },
          {
            model: PartnerFollower
          }
        ]
      });
        
      if(!users)
      {
        return { success: false, message: "User Tidak Ditemukan", data: {} }
      } 
      else 
      {
        console.log('users.type');
        console.log(users.type);
        if(users.type == "2")
        {
          var partnerResult = await PartnerService.getDetail(users.id);
          if(partnerResult.success){ 
            var partner = partnerResult.data;
            // console.log("Data Partner");
            // console.log(JSON.stringify(users));
            var user = {
              id: users.id,
              email: users.email,
              name: users.name,
              picture: users.picture,
              given_name: users.given_name,
              family_name: users.family_name,
              phone_number: users.phone_number,
              active: users.active,
              password: users.password,
              token: users.token,
              address: users.address,
              nation: users.nation,
              dob: users.dob,
              province: users.province,
              city: users.city,
              postalcode: users.postalcode,
              type: users.type,
              title: users.title,
              description: users.description,
              longitude: users.longitude,
              latitude: users.latitude,
              whatsapp_number: users.whatsapp_number,
              last_login: users.last_login,
              refresh_token: users.refresh_token,
              rating: partner.rating,   
              review: partner.reviewcount,   
              follower: partner.follower,   
              successjob: partner.successjob, 
              currentbalance: partner.currentbalance, 
              tiername: partner.tiername,  
              tiernames: partner.tiernames,  
              points: partner.points, 
              is_verified: !partner.is_verified ? false : partner.is_verified,
              process_verified: users.process_verified,     
              partner_awards: users.partner_awards,
              partner_portfolios: users.partner_portfolios,
              partner_experiences: users.partner_experiences,
              partner_certificates: users.partner_certificates,
              partner_packages: users.partner_package_headers,
              partner_followers: users.partner_followers,
            }
            
            return { success: true, message: "User Ditemukan", data: user };              
          } else {                
            return { success: true, message: "User Ditemukan", data: users };   
          }           
        }
        else
        {
          return { success: true, message: "User Ditemukan", data: users };
        }
      }
    } 
    catch (error) {
      console.log(error);
      throw error;
    }
  },

  findOrCreateUser: async (params, req) => {
    try {
      // 1. Insert new user
      var currentDate = moment()
        .utcOffset(7)
        .format("YYMMDD");

      const isExist = await User.findOne({ where: params });
      console.log(currentDate);

      const nowStoreId = await User.findOne({
        where: { storeid: { $like: `${currentDate}%` } },
        order: [["storeid", "DESC"]]
      });
      //const nowStoreId = await User.findOne({ where: {storeid: {$like: `%190712001` }}, order: [['storeid', 'DESC']] })

      //create new storeid
      if (!nowStoreId) {
        newStoreId = currentDate + "001";
      } else {
        var strNewId =
          Number(nowStoreId.dataValues.storeid.substring(6, 9)) + 1;
        if (strNewId.toString().length < 3) {
          newStoreId =
            currentDate + "0".repeat(3 - strNewId.toString().length) + strNewId;
        } else {
          newStoreId = currentDate + strNewId;
        }
      }

      console.log("storeid : " + newStoreId);

      // check email / phone already registered or not
      if (!isExist) {
        const { body } = req;
        const storeHelper = new StoreHelper();
        const storeData = await storeHelper.generateUserData(body, newStoreId);
        console.log(storeData);
        const insertUser = await User.findOrCreate({
          where: params,
          defaults: storeData
        });
        if (!insertUser[1]) {
          throw {
            success: false,
            message: "Nomor Handphone Sudah Ada!",
            data: {}
          };
        } else {
          delete insertUser[0].dataValues.password;
          return {
            success: true,
            message: "User Berhasil Dibuat",
            data: insertUser[0].dataValues
          };
        }
      } else {
        return {
          success: false,
          message: "Nomor Handphone Sudah Ada!",
          data: {}
        };
      }

      // all operation success
    } catch (error) {
      throw error;
    }
  },

  registerUser: async (params, transaction, res) => {
    try {
      console.log("service register user");

      const { email, password, name, address, phone } = params;
      const generateHashPassword = await jwt.hash(password, 10);

      const token = crypto({ length: 16 });
      console.log("generateHashPassword: " + generateHashPassword);
      console.log("token: " + token);
      var objHaiUser = {
        email: email,
        password: generateHashPassword,
        phone_number: phone,
        address: address,
        name: name,
        token: token,
        active: 0,
        type: 1
      };

      const insertUser = await User.create(objHaiUser, {
        transaction
      });
      console.log("returning : " + JSON.stringify(insertUser));
      if (!insertUser) {
        throw { success: false, message: "Gagal Daftar User", data: {} };
      } else {
        transaction.commit();
        delete insertUser.dataValues.password;

        return {
          success: true,
          message: "User Berhasil Dibuat",
          data: insertUser.dataValues
        };
      }
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  },

  registerGoogleUser: async (params, transaction, res) => {
    try {
      console.log("service register google user");

      const { email, picture, name, userType } = params;
      const generateHashPassword = await jwt.hash("12345678", 10);

      const token = crypto({ length: 16 });
      console.log("generateHashPassword: " + generateHashPassword);
      console.log("token: " + token);
      var objHaiUser = {
        email: email,
        name: name,
        token: token,
        password: generateHashPassword,
        //picture: picture
        active: 0,
        type: userType == "client" ? 1 : 2
      };

      const insertUser = await User.create(objHaiUser, {
        transaction
      });

      console.log("returning : " + JSON.stringify(insertUser));
      if (!insertUser) {
        throw { success: false, message: "Gagal Daftar User", data: {} };
      } else {
        transaction.commit();
        delete insertUser.dataValues.password;

        return {
          success: true,
          message: "User Berhasil Dibuat",
          data: insertUser.dataValues
        };
      }
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  },

  verifyUser: async (email, token, res) => {
    let objUser = {
      active: 1
    };
    console.log("email :" + email);
    console.log("token 2 :" + token.replace(/['"]+/g, ""));
    console.log("response :" + res);

    return await User.update(objUser, {
      where: { token: token.replace(/['"]+/g, ""), email: email }
    })
      .then(updated => {
        console.log("updated : " + updated);
        if (updated > 0)
          return res.sendFile(path.join(__dirname, '../views', 'success_activation.html'));
        else
          return res.sendFile(path.join(__dirname, '../views', 'failed_activation.html'));
      })
      .catch(err => {
        return { success: false, message: err.message, data: err };
      });
  },

  // resetPassword: async (email, token, res) => {
  //   return await User.findOne({ where: { email: email } })
  //     .then(users => {
  //       //delete users.dataValues.password

  //       if(!users) {
  //         console.log('user forget password tidak ada');
  //       }

  //       console.log('user forget password adaaaa');

  //       crypto.randomBytes(20, function (err, buf) {
  //         var token = buf.toString('hex');
  //         done(err, token);
  //       });

  //       user.token = token;
  //       // user.tokenExpires = Date.now() + 3600000; // 1 hour

  //       user.save(function (err) {
  //         done(err, token, user);
  //       });
  //     })
  //     .catch(err => {
  //       return { success: false, message: "User Tidak Ditemukan", data: err };
  //     });      
  // },


  resetPassword: async (users, req) => {
    console.log("req.query.email: " + req.query.email);

    try {     
      // generate new token expired
      const tokenX = cryptos.randomBytes(20).toString("hex");
      console.log("generateToken: " + tokenX);         
      
       // set response token expired
      user = await transformers.resetToken(users);
      const tokenExpired = await jwt.reset(user, resetSecret, { expiresIn: "1m" });
      const decoded = await jwt.verify(tokenExpired);
      console.log("token decoded ", decoded);
      console.log("token decoded expired : " + JSON.stringify(new Date(decoded.exp * 1000).toLocaleString()));

      var object = {
        reset_token: tokenX,
        expired_reset_token: new Date(decoded.exp * 1000)
      };
      const update = await User.update(object, {
        where: { email: req.query.email }
      })      

      if (!update) {
        throw { success: false, message: "Gagal Update Token Reset Password User", data: {} };
      } else {
        return {
          success: true,
          message: "Token Reset Password User Berhasil Dibuat",
          data:  {
            email: req.query.email,
            reset_token: tokenX,
          }
        };
      }
    } catch (error) {
      throw error;
    }
  },

  updateNewPassword: async (req, res) => {
    console.log("Update reset new password service");    

    const { reset_token, password, validate } = req;
    console.log("req new reset :", req);

    //Check for errors
    var errors = validationResult(validate);
    console.log("validationResult new reset :", errors.errors);

    if (!errors.isEmpty()) {
      res.render(path.join(__dirname, '../views', 'reset.jade'), {
        errors: errors,
      });
    } else {
      console.log("gooooooooooooooo:");

      const generateHashPassword = await jwt.hash(password, 10);
      var data = {
        password: generateHashPassword
      };

      return User.update(data, {
        where: { reset_token: reset_token },
        returning: true,
        plain: true
      })
        .then(async updated => {
          console.log(updated[1].dataValues);
          delete updated[1].dataValues.password;
          delete updated[1].dataValues.reset_token;
  
          // set value null token reset after change new password via reset
          var object = {
            reset_token: null,
          };
          await User.update(object, {
            where: { email: updated[1].dataValues.email }
          })
  
          return {
            success: true,
            message: "Password Berhasil Diubah",
            data: updated[1]
          };
        })
        .catch(err => {
          return { success: false, message: "Password Gagal Diubah", data: err };
        });
    }
  },

  updateProfile: async params => {
    console.log("Update profile service");

    const {
      email,
      name,
      title,
      picture,
      description,
      address,
      phone,
      whatsapp_number,
      dob,
      nation,
      province,
      city,
      postalcode,
      verified_document,
      type 
    } = params;
    console.log("params :", params);
    let data = {
      name: name,
      title: title,
      picture: picture,
      description: description,
      address: address,
      phone_number: phone,
      whatsapp_number: whatsapp_number,
      dob: dob,
      nation: nation,
      province: province,
      city: city,
      postalcode: postalcode,
      verified_document: verified_document,
      type: type
    };

    return User.update(data, {
      where: { email: email },
      returning: true,
      plain: true
    })
      .then(updated => {
        console.log(updated[1].dataValues);
        delete updated[1].dataValues.password;
        return {
          success: true,
          message: "Profil Berhasil Diubah",
          data: updated[1]
        };
      })
      .catch(err => {
        return { success: false, message: "Profil Gagal Diubah", data: err };
      });
  },

  updateActivatedUser: async params => {
    console.log("Update profile service");

    const {
      email,
    } = params.body;
    console.log("params email :", email);
    let data = {
      active: 1
    };

    return User.update(data, {
      where: { email: email },
      returning: true,
      plain: true
    })
      .then(updated => {
        console.log(updated[1].dataValues);
        delete updated[1].dataValues.password;
        return {
          success: true,
          message: "Akun berhasil diaktifkan",
          data: updated[1]
        };
      })
      .catch(err => {
        return { success: false, message: "Gagal mengaktifkan akun", data: err };
      });
  },

  updatePassword: async params => {
    console.log("Update profile password service");    

    const { email, password } = params;
    console.log("params :", params);

    const generateHashPassword = await jwt.hash(password, 10);
    let data = {
      email: email,
      password: generateHashPassword
    };

    return User.update(data, {
      where: { email: email },
      returning: true,
      plain: true
    })
      .then(updated => {
        console.log(updated[1].dataValues);
        delete updated[1].dataValues.password;
        return {
          success: true,
          message: "Password Berhasil Diubah",
          data: updated[1]
        };
      })
      .catch(err => {
        return { success: false, message: "Password Gagal Diubah", data: err };
      });
  },

  registerPartner: async (params, transaction, res) => {
    try {
      console.log("service register partner");
      console.log(params)

      const {
        email,
        password,
        name,
        address,
        phone,
        whatsapp,
        code_referral,
        firebaseUid
        // categoryid
      } = params;
      console.log("params register partner");
      console.log(params);
      const generateHashPassword = await jwt.hash(password, 10);

      const token = crypto({ length: 16 });
      console.log("generateHashPassword: " + generateHashPassword);
      console.log("token: " + token);

      var objHaiUser = {
        email: email,
        password: generateHashPassword,
        phone_number: phone,
        address: address,
        name: name,
        token: token,
        code_referral: code_referral,
        whatsapp_number: whatsapp,
        uid_firebase: firebaseUid,
        active: 0,
        type: 2
      };

      const insertUser = await User.create(objHaiUser, transaction);

      console.log("returning : " + JSON.stringify(insertUser));
      if (!insertUser) {
        throw { success: false, message: "Gagal Daftar User", data: {} };
      } else {
        transaction.commit();
        delete insertUser.dataValues.password;

        //mapping partner and category
        // var arrPartnerCategories = [];

        // if(categoryid != undefined){
        //   categoryid.forEach(element => {
        //     var objPartnerCategory = {
        //       partner_id: insertUser.dataValues.id,
        //       category_id: element
        //     };
        //     arrPartnerCategories.push(objPartnerCategory);
        //   });
        //   console.log(
        //     "arrPartnerCategories: " + JSON.stringify(arrPartnerCategories)
        //   );          

        //   const insertPartnerCategory = await PartnerCategory.bulkCreate(
        //     arrPartnerCategories
        //   );
        // }

        return {
          success: true,
          message: "User Berhasil Dibuat",
          data: insertUser.dataValues
        };
      }
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  },

  delete: async (data) => {
    try {
      const { partner_id, id } = data;

      return User.destroy({
        where: {
          id: partner_id,
        },
      })
        .then(async (deleted) => {
          console.log('deleted')
          console.log(deleted)
          if (deleted == 0) {
            return { success: true, message: "Akun Ini Tidak Ditemukan", data: [] }
          } else {
            return { success: true, message: "Akun Berhasil Dihapus", data: [] }
          }
        })
        .catch((err) => {
          console.log(err);
          return { success: false, message: "Akun Gagal Dihapus", data: err }
        });
    } catch (error) {
      console.log(error);
      throw (error)
    }
  },
  /*

  insertProfile: async params => {
    try {
      console.log("insert profile service");

      const {
        email,
        name,
        address,
        phone,
        dob,
        nation,
        province,
        city,
        postalcode
      } = params;

      console.log(JSON.stringify(params));

      var objInvent = {
        name: name,
        address: address,
        phone: phone,
        dob: dob,
        nation: nation,
        province: province,
        city: city,
        postalcode: postalcode
      };

      const insertInvent = await User.create(objInvent, {
        transaction
      });
      transaction.commit();
      console.log(insertInvent);
      if (!insertInvent) {
        return {
          success: false,
          message: "Insert User Profile Failed",
          data: insertInvent
        };
      } else {
        return {
          success: true,
          message: "Insert User Profile Successful",
          data: insertInvent
        };
      }
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  },


    forgotPassword: async (users) => {
      const user = await transformers.user(users);
      const new_password = await utils.randomChar(8);
      let data = {};
      let mail = {
        app_id: "BizzyPOS",
        type: "forgot_password",
        to: user.company_email,
        from: "info@bizzypos.id",
        title: "Your Password Renewal Link",
        message: {
          Html: {
            Charset: "UTF-8",
            Data: `<h3>Your Password Renewal Link</h3>
                                              <br>
                                              <p>Dear Customer,<p>
                                              <br>
                                              <p>Our system have detected that you have requested a password renewal</p>
                                              <p>Below is your new generated password</p>
                                              <p><b>${new_password}</b></p>
                                              <p>Please do not reply to this email, whereas this is an auto generated email by system.</p>
                                              <br>
                                              Thank you`
          },
          Text: {
            Charset: "UTF-8",
            Data: `Your Password Renewal Link
  
                                              Dear Customer,
                                              Our system have detected that you have requested a password renewal
                                              Below is your new generated password
                                              ${new_password}
                                              Please do not reply to this email, whereas this is an auto generated email by system.
  
                                              Thank you`
          }
        }
      };
  
      //update forgot_password_code & forgot_password_time
      data.password = await jwt.hash(new_password, 10);
      data.forgotten_password_time = now;
  
      return dbSeq.transaction(function (t) {
        //insert valid forgot code
        return User.update(data, { where: { company_email: user.company_email } }, { transaction: t })
          .then(async (updated) => {
            //send email
            AWS.config.update({
              region: AWS_REGION_NAME,
              accessKeyId: AWS_BUCKET_KEYID,
              secretAccessKey: AWS_BUCKET_ACCESS
            });
            var lambda = new AWS.Lambda();
  
            var params = {
              FunctionName: EMAIL_PRODUCER_NAME + ':' + NODE_ENV,
              InvocationType: 'RequestResponse',
              LogType: 'Tail',
              Payload: JSON.stringify({ mail: mail })
            };
  
            return new Promise((resolve, reject) => {
              return lambda.invoke(params, function (err, result) {
                if (err) reject({ success: false, message: "Mail Queue Not Sent", data: err });
                else resolve({ success: true, message: "Mail Queue Sent", data: { mail, result } });
              });
            });
          })
          .catch((err) => { return { success: false, message: "Request Failed", data: err } });
      })
    },
  
    sendOTP: async (users) => {
      const user = await transformers.user(users);
      let otp_code = await utils.randomNumber(4);
      var sms = {
        app_id: APP_ID,
        type: 'otp',
        message: `Your OTP code is ${otp_code}`,
        phone_no: user.phone,
        sender_id: SMS_SENDER_NUMBER,
        provider: SMS_PROVIDER
      }
      var data = {}
  
      data.otp_code = otp_code;
      data.owner_id = user.id;
      data.exp_time = moment().utcOffset(7).add(1, 'days').format("YYYY-MM-DD HH:mm:ss");
      data.created_at = now;
      data.type = "otp";
  
      return dbSeq.transaction(function (t) {
        //insert otp data
        return Otp.create(data, { transaction: t })
          .then((created) => {
            //send sms
            AWS.config.update({
              region: AWS_REGION_NAME,
              accessKeyId: AWS_BUCKET_KEYID,
              secretAccessKey: AWS_BUCKET_ACCESS
            });
            var lambda = new AWS.Lambda();
  
            var params = {
              FunctionName: SMS_PRODUCER_NAME + ':' + NODE_ENV,
              InvocationType: 'RequestResponse',
              LogType: 'Tail',
              Payload: JSON.stringify({ sms: sms })
            };
  
            return new Promise((resolve, reject) => {
              return lambda.invoke(params, function (err, result) {
                if (err) reject({ success: false, message: "OTP Queue Not Sent", data: err });
                else resolve({ success: true, message: "OTP Queue Sent", data: { created, sms, result } });
              });
            });
          })
          .catch((err) => { return { success: false, message: "OTP Not Sent", data: err } });
      })
    },
  
    verifyUser: async (users) => {
      const user = await transformers.user(users);
  
      let data = {
        is_verified: 1,
        verified_date: now
      };
  
      return await User.update(data, { where: { id: user.id } })
        .then((updated) => { return { success: true, message: "Verify User Successful", data: {} } })
        .catch((err) => { return { success: false, message: "Verify User Failed", data: err } });
    },
  
    activateUser: async (users) => {
      const user = await transformers.user(users);
  
      let data = {
        active: 1,
        active_at: now
      };
  
      return await User.update(data, { where: { id: user.id } })
        .then((updated) => { return { success: true, message: "Activate User Successful", data: {} } })
        .catch((err) => { return { success: false, message: "Activate User Failed", data: err } });
    },
  
    updateUser: async (id, userData) => {
      console.log('id',id.id)
      const { userInformation, userLegalImages } = userData
  
      delete userInformation.password
      return await User.update(userInformation, { where:  id })
        .then(
          function (foundItem) {
            if (foundItem==0) {
              return { success: false, message: "User not Found", data: {} } 
          } else {
              // Found an item, update it
              const legalImagesWithId = userLegalImages.map(image => {
                image.user_id = id.id
                return image
              })
              DocumentStatus.destroy({ where: id })
              DocumentStatus.bulkCreate(legalImagesWithId)
              delete userInformation.password
              return { success: true, message: "Update User Data Successful", data: userInformation } 
          }
        })
        .catch((err) => { return { success: false, message: "Update User Data Failed", data: err } });
    },
  
    */
};
