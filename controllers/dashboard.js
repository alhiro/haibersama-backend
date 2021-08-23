const dashboard = require("../services/dashboard");
const sequelizeTransaction = require('../config/sequelizeTransaction')
const category = require("../services/category");
const resv = require("../services/reservation");

exports.getBanners = async function (req, res, next) {
  try {
        var banners = await dashboard.getBanners();
        return res.status(200).json({ status: 200, data: banners, message: "Banner Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getHotPortfolios = async function (req, res, next) {
  try {
        var portfolios = await dashboard.getHotPortfolios();
        return res.status(200).json({ status: 200, data: portfolios, message: "Hot Portfolio Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getNewPortfolios = async function (req, res, next) {
  try {
        var portfolios = await dashboard.getNewPortfolios();
        return res.status(200).json({ status: 200, data: portfolios, message: "New Portfolio Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getAllCategories = async function (req, res, next) {
  try {
        var categories = await category.getAll();
        return res.status(200).json({ status: 200, data: categories, message: "Semua Kategori Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getPartnerReminder = async function (req, res, next) {
  try {
    const { userId } = req;

    var where = " WHERE 1=1 ";
    where += " AND rv.partner_id = " + userId;
    where += " AND rv.transaction_status_code = 'ON_PROCESS' ";
    where += " AND DATE(rv.event_date) = DATE(now() + interval '1' day) ";
    
    let data = await resv.findReminder(where);
    data.code = data.success ? 200 : 500;
    return res.status(200).send(data);

  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }  
};

exports.getPartnerReminderMore = async function (req, res, next) {
  try {
    const { userId } = req;

    var where = " WHERE 1=1 ";
    where += " AND rv.partner_id = " + userId;
    where += " AND rv.transaction_status_code = 'ON_PROCESS' ";
    where += " AND DATE(rv.event_date) BETWEEN DATE(NOW()) AND DATE(now() + interval '1' month)";
    
    let data = await resv.findReminder(where);
    data.code = data.success ? 200 : 500;
    return res.status(200).send(data);

  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }  
};


exports.getPartnerOrderSummary = async function (req, res, next) {
  try {
    const { userId } = req;

    let data = await resv.findReservationSummary(userId);
    data.code = data.success ? 200 : 500;
    return res.status(200).send(data);

  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }  
};