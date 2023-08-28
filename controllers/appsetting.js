const Setting = require("../services/appsetting");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getAllSetting = async function (req, res, next) {
  try {
    var categories = await Setting.getAll();
    return res.status(200).json(
      { status: 200, data: categories, message: "Semua Setting Berhasil Diambil" }
    );
  } catch (err) {
    return res
      .status(500)
      .send(
        { code: 500, success: false, message: err.message, data: { err } }
      );
  }
};
