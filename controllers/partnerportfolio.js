const partnerportfolio = require("../services/partnerportfolio");
const sequelizeTransaction = require("../config/sequelizeTransaction");

exports.getPortfolio = async function(req, res, next) {
  const partner_id = req.query.partner_id;
  try {
    var params = { partner_id: partner_id };
    var portfolio = await partnerportfolio.getList(params);
    return res
      .status(200)
      .json({ status: 200, data: portfolio.data, message: "Partner Portfolio Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getAllPortfolio = async function(req, res, next) {
  const partner_id = res.locals.auth.id;;
  try {
    var params = { partner_id: partner_id };
    var portfolio = await partnerportfolio.getList(params);
    return res
      .status(200)
      .json({ status: 200, data: portfolio.data, message: "Semua Partner Portfolio Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getListPortfolio = async function(req, res, next) {
  const partner_id = req.query.partner_id;
  console.log("controller list portfolio partner_id " + partner_id);

  try {
    const params = { partnerId: partner_id, page: req.query.page, limit: req.query.limit, search: req.query.search, startDate: req.query.startDate, endDate: req.query.endDate};
    var portfolio = await partnerportfolio.getFindList(params);

    return res.status(200).json(
      {
        success: portfolio.success,
        data: portfolio.data,
        message: portfolio.message,
        page: portfolio.page,
        pageCount: portfolio.count,
        length: portfolio.length
      });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getDetail = async function(req, res, next) {
  const id = req.query.id;
  try {
    var portfolio = await partnerportfolio.getDetail(id);
    return res
      .status(200)
      .json({ status: 200, data: portfolio, message: "Detail Partner Portfolio Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.addPortfolio = async function(req, res, next) {
  try {
    const params = { name: req.name, partner_id: req.partner_id };

    let result = await partnerportfolio.findOrCreatePortfolio(params, req);
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.updatePortfolio = async function(req, res, next) {
  try {
    let result = await partnerportfolio.updatePortfolio(req);
    return res.status(200).send(result);    
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.deletePortfolio = async function(req, res, next) {
  try {
    var result = await partnerportfolio.deletePortfolio(req);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};
