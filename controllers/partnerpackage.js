const package = require("../services/partnerpackage");
const sequelizeTransaction = require('../config/sequelizeTransaction')


exports.getAllPackage = async function (req, res, next) {
  console.log("controller getpackage");

  const { body } = req;
  const { token } = body;
  try {

        var categories = await package.getAll();
        return res.status(200).json({ status: 200, data: categories, message: "Succesfully retrived packages" });
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
  