const partnerawards = require("../services/partnerawards");
const sequelizeTransaction = require("../config/sequelizeTransaction");

exports.getAwards = async function(req, res, next) {
  const partner_id = req.query.partner_id;
  try {
    var params = { partner_id: partner_id }    
    var awards = await partnerawards.getList(params);
    return res
      .status(200)
      .json({ status: 200, data: awards.data, message: "Succesfully Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getAllAwards = async function(req, res, next) {
  const partner_id = req;  
  try {
    var params = { partner_id: partner_id }    
    var awards = await partnerawards.getList(params);
    return res
      .status(200)
      .json({ status: 200, data: awards.data, message: "Succesfully Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getDetail = async function(req, res, next) {
  const id = req.query.id;
  try {
    var awards = await partnerawards.getDetail(id);
    return res
      .status(200)
      .json({ status: 200, data: awards, message: "Succesfully Retrieved" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.addAwards = async function(req, res, next) {
  try {
    const params = { name: req.name, partner_id: req.partner_id };

    let result = await partnerawards.findOrCreateAwards(params, req);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};

exports.updateAwards = async function(req, res, next) {
  try {
    let result = await partnerawards.updateAwards(req);
    return res.status(200).send(result);    
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};

exports.deleteAward = async function(req, res, next) {
  try {
    var result = await partnerawards.deleteAward(req);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};
