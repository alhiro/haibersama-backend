const cat = require("../services/category");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getAllCategories = async function (req, res, next) {
  try {
        var categories = await cat.getAll();
        return res.status(200).json({ status: 200, data: categories, message: "Succesfully Categories Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};
