const common = require("../services/common");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getBanners = async function (req, res, next) {
  const { body } = req;
  const { token } = body;
  try {
        var banners = await common.getBanners();
        return res.status(200).json({ status: 200, data: banners, message: "Succesfully Banners Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};
