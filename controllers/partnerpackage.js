const package = require("../services/partnerpackage");
const sequelizeTransaction = require('../config/sequelizeTransaction')


exports.getAllPackage = async function (req, res, next) {
  console.log("controller getpackage");

  const { body } = req;
  const { token } = body;
  try {

        var packages = await package.getAll();
        return res.status(200).json({ status: 200, data: packages, message: "Succesfully retrived packages" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.addPackage = async function(req, res, next) {
    try {
      console.log("controller addPackage")

      let insertCategory = await package.findOrCreatePackage(req);
      return res.status(200).send(insertCategory);
    } catch (err) {
      return res.status(500).send({ data: err });
    }
  };

  exports.getList = async function (req, res, next) {
    const { body } = req;
    const partner_id = parseInt(req.query.partnerid);
    try {
          var params = { partner_id: partner_id };
          var packages = await package.getList(params);
          return res.status(200).json({ status: 200, data: packages, message: "Succesfully Partner Packages Retrieved" });
    } catch (err) {
      return res
        .status(500)
        .send({ code: 500, success: false, message: err.message, data: { err } });
    }
  };
  