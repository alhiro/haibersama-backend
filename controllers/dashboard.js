const dashboard = require("../services/dashboard");
const sequelizeTransaction = require('../config/sequelizeTransaction')
const category = require("../services/category");

exports.getBanners = async function (req, res, next) {
  try {
        var banners = await dashboard.getBanners();
        return res.status(200).json({ status: 200, data: banners, message: "Succesfully Banners Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getHotPortfolios = async function (req, res, next) {
  try {
        var portfolios = await dashboard.getHotPortfolios();
        return res.status(200).json({ status: 200, data: portfolios, message: "Succesfully Hot Portfolios Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getNewPortfolios = async function (req, res, next) {
  try {
        var portfolios = await dashboard.getNewPortfolios();
        return res.status(200).json({ status: 200, data: portfolios, message: "Succesfully New Portfolios Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getAllCategories = async function (req, res, next) {
  try {
        var categories = await category.getAll();
        return res.status(200).json({ status: 200, data: categories, message: "Succesfully Categories Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};