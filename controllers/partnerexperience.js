const partnerexperience = require("../services/partnerexperience");
const sequelizeTransaction = require("../config/sequelizeTransaction");

exports.getAllExperience = async function(req, res, next) {
  const partner_id = req;
  try {
    var params = { partner_id: partner_id };
    var experience = await partnerexperience.getList(params);
    return res
      .status(200)
<<<<<<< HEAD
      .json({ status: 200, data: experience, message: "Succesfully Retrieved" });
=======
      .json({ status: 200, data: experience.data, message: "Succesfully Retrieved" });
>>>>>>> 9b4793e88594c73d9a696e8fcfc5b0c93240746d
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getDetail = async function(req, res, next) {
  const id = req.query.id;
  try {
    var experience = await partnerexperience.getDetail(id);
    return res
      .status(200)
      .json({ status: 200, data: experience, message: "Succesfully Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.addExperience = async function(req, res, next) {
  try {
    const params = { position: req.position, company_name: req.company_name };

    let result = await partnerexperience.findOrCreateExperience(params, req);
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.updateExperience = async function(req, res, next) {
  try {
      let result = await partnerexperience.updateExperience(req);
      return res.status(200).send(result);    
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};
