const bannerService = require("../services/banner");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getAllBanners = async function (req, res, next) {
  try {
        var banners = await bannerService.getAll();
        return res.status(200).json({ status: 200, data: banners, message: "Semua Banner Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getAllBannersAdmin = async function (req, res, next) {
  try {
        var banners = await bannerService.getAllAdmin();
        return res.status(200).json({ status: 200, data: banners, message: "Semua Banner Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getBanner = async function (req, res, next) {
  try {
        const params = { id: req.query.id };
        var findBanner = await bannerService.findBanner(params);
        return res.status(200).json({ status: 200, data: findBanner.data, message: findBanner.message });
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

    let insertBanner = await bannerService.findOrCreateBanner(params, req);
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

    const findBanner = await bannerService.findBanner(params);
    console.log("findBanner :", findBanner.success)
    if (findBanner.success === true){
      let updateBanner = await bannerService.updateBanner(params, req);
      return res.status(200).send(updateBanner);
    }else
    return res.status(400).send(findBanner);
    
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.deleteBanner = async function(req, res, next) {
  try {
    var result = await bannerService.deleteBanner(req);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};
