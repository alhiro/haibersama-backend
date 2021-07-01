const partnercertificate = require("../services/partnercertificate");
const sequelizeTransaction = require("../config/sequelizeTransaction");

exports.getCertificate = async function(req, res, next) {
  // const partner_id = req;
  const partner_id = req.query.partner_id;
  try {
    var params = { partner_id: partner_id };
    var certificate = await partnercertificate.getList(params);
    return res
      .status(200)
      .json({ status: 200, data: certificate.data, message: "Succesfully Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getAllCertificate = async function(req, res, next) {
  const partner_id = req;
  try {
    var params = { partner_id: partner_id };
    var certificate = await partnercertificate.getList(params);
    return res
      .status(200)
      .json({ status: 200, data: certificate.data, message: "Succesfully Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getDetail = async function(req, res, next) {
  const id = req.query.id;
  try {
    var certificate = await partnercertificate.getDetail(id);
    return res
      .status(200)
      .json({ status: 200, data: certificate, message: "Succesfully Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.addCertificate = async function(req, res, next) {
  try {
    const params = { name: req.name, partner_id: req.partner_id };

    let result = await partnercertificate.findOrCreateCertificate(params, req);
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.updateCertificate = async function(req, res, next) {
  try {
      let result = await partnercertificate.updateCertificate(req);
      return res.status(200).send(result);    
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.deleteCertificate = async function(req, res, next) {
  try {
    var result = await partnercertificate.deleteCertificate(req);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};
