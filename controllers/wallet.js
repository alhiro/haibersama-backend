const ser = require("../services/partnerwallethistory");
const sequelizeTransaction = require("../config/sequelizeTransaction");

exports.getHistories = async function(req, res, next) {
  console.log("controller service");  

  const { userId, date_from, date_to } = req;
  try {
    if(!date_from){
      return res.status(400).send({ code: 400, success: false, message: "Please input date from.", data: {} });
    }

    if(!date_to){
      return res.status(400).send({ code: 400, success: false, message: "Please input date to.", data: {} });
    }

    var services = await ser.getList(req);
    return res
      .status(200)
      .json({ status: 200, data: services, message: "Succesfully Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getbalance = async function(req, res, next) {
  console.log("controller service");  

  const { userId } = req;
  try {
    var param = {
      partner_id: userId
    };

    var services = await ser.getBalance(param);
    return res
      .status(200)
      .json({ status: 200, data: services, message: "Succesfully Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};
