const cat = require("../services/banner");
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

exports.addBanner = async function(req, res, next) {
  try {
    console.log("controller addBanner")
    const params = { name: req.body.name };

    let insertBanner = await cat.findOrCreateBanner(params, req);
    return res.status(200).send(insertBanner);
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.updateBanner = async function(req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { id: req.body.id };

    const findBanner = await cat.findBanner(params);
    console.log("findBanner :", findBanner)
    if (findBanner.success=== true){
      let updateBanner = await cat.updateBanner(params, req);
      return res.status(200).send(updateBanner);
    }
    
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};
