const partner = require("../services/partner");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getDetail = async function (req, res, next) {
  console.log("controller partner");

  const { body } = req;
  const { token, partner_id } = body;
  try {
        var partnerDetail = await partner.getDetail(partner_id);
        console.log("controller test test");
        return res.status(200).json({ status: 200, data: partnerDetail, message: "Succesfully Partner Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getPartner = async function (req, res, next) {
  console.log("controller partner");

  const { body } = req;
  const { token, partner_id } = body;
  try {
        var partnerDetail = await partner.getPartner(partner_id);
        console.log("controller test test");
        return res.status(200).json({ status: 200, data: partnerDetail, message: "Succesfully Partner Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};
