const User = require("../models/haiuser");
//const Otp = require('../models/otp');
const transformers = require("../lib/transformers");
const jwt = require("../lib/jwt");
const utils = require("../lib/utils");
const dbSeq = require("../config/sequelize");
const moment = require("moment");
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

    return User.update(data, { where: { email: users.email } })
      .then(updated => {
        return {
          success: true,
          message: "Login Successful",
          data: {
            type: "user",
            token,
            expiresIn: new Date(decoded.exp * 1000),
            refresh_token
          }
        };
      })
      .catch(err => {
        return { success: false, message: "Login Failed", data: err };
      });
  },

  getAll: async () => {
    try {
      return await User.getAll();
    } catch (error) {
      throw error;
    }
  },

  findUser: async params => {
    return await User.findOne({ where: params })
      .then(users => {
        //delete users.dataValues.password
        return !users
          ? { success: false, message: "User Not Found", data: {} }
          : { success: true, message: "User Found", data: users };
      })
      .catch(err => {
        return { success: false, message: "User Not Found", data: err };
      });
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
            message: "That Phone Number already exists",
            data: {}
          };
        } else {
          delete insertUser[0].dataValues.password;
          return {
            success: true,
            message: "User Successfully Created",
            data: insertUser[0].dataValues
          };
        }
      } else {
        return {
          success: false,
          message: "That Phone Number already exists",
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

      const { email, password, name, address, phone, nation, dob } = params;
      const generateHashPassword = await jwt.hash(password, 10);

      const token = crypto({ length: 16 });
      console.log("generateHashPassword: " + generateHashPassword);
      console.log("token: " + token);
      var objHaiUser = {
        email: email,
        password: generateHashPassword,
        phone_number: phone,
        nation: nation,
        dob: dob,
        address: address,
        name: name,
        token: token,
        active: 0
      };

      const insertUser = await User.create(objHaiUser, {
        transaction
      });
      console.log("returning : " + JSON.stringify(insertUser));
      if (!insertUser) {
        throw { success: false, message: "Failed to register user", data: {} };
      } else {
        transaction.commit();
        delete insertUser.dataValues.password;

        return {
          success: true,
          message: "User Successfully Created",
          data: insertUser.dataValues
        };
      }
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  },

  verifyUser: async (email, token, transaction, res) => {
    let objUser = {
      active:1,
    };
    console.log("email :"+ email)
    console.log("token 2 :"+ token.replace(/['"]+/g, '') )

    return await User.update(objUser, { where: {token: token.replace(/['"]+/g, '') , email:email} })
    .then((updated) => {  
      console.log("updated : "+updated)
      if (updated > 0) 
        return { success: true, message: "User activation successfull", data: updated } 
      else
        return { success: false, message: "User activation failed", data: updated } 
    })
    .catch((err) => { return { success: false, message: err.message, data: err } });
  },

  /*
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
