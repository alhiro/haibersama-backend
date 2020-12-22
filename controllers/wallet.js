const ser = require("../services/partnerwallethistory");
const sequelizeTransaction = require("../config/sequelizeTransaction");

exports.getHistories = async function(req, res, next) {
  console.log("controller service");  

  const { userId } = req;
  try {
    var param = {
      partner_id: userId
    };

    var services = await ser.getList(param);
    return res
      .status(200)
      .json({ status: 200, data: services, message: "Succesfully Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};
