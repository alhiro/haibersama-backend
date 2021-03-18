const partnerportfolio = require("../services/partnerportfolio");
const sequelizeTransaction = require("../config/sequelizeTransaction");

exports.getAllPortfolio = async function(req, res, next) {
  // const partner_id = req;
  const partner_id = req.query.partner_id;
  try {
    var params = { partner_id: partner_id };
    var portfolio = await partnerportfolio.getList(params);
    return res
      .status(200)
      .json({ status: 200, data: portfolio.data, message: "Succesfully Retrieved" });
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
      .json({ status: 200, data: portfolio, message: "Succesfully Retrieved" });
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
