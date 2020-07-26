const cat = require("../services/banner");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getAllBanners = async function (req, res, next) {
  try {
        var banners = await cat.getAll();
        return res.status(200).json({ status: 200, data: banners, message: "Succesfully Banners Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};


exports.getBanner = async function (req, res, next) {
  try {
        const params = { id: req.query.id };
        var banner = await cat.findBanner(params);
        return res.status(200).json({ status: 200, data: banner.data, message: banner.message });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.addBanner = async function(req, res, next) {
  try {
    console.log("controller addBanner")
    const params = { title: req.title };

    let insertBanner = await cat.findOrCreateBanner(params, req);
    return res.status(200).send(insertBanner);
  } catch (err) {
    console.log(err)
    return res.status(500).send({ data: err });
  }
};

exports.updateBanner = async function(req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { id: req.id };
    console.log(req);

    const findBanner = await cat.findBanner(params);
    console.log("findBanner :", findBanner)
    if (findBanner.success=== true){
      let updateBanner = await cat.updateBanner(params, req);
      return res.status(200).send(updateBanner);
    }else
    return res.status(400).send(findBanner);
    
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};
