const package = require("../services/partnerpackage");
const sequelizeTransaction = require('../config/sequelizeTransaction')


exports.getAllPackage = async function (req, res, next) {
  console.log("controller getpackage");

  const { body } = req;
  const { token } = body;
  try {

        var packages = await package.getAll();
        return res.status(200).json({ status: 200, data: packages, message: "Semua Jasa/Produk Berhasil Diambil" });
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

  exports.editPackage = async function(req, res, next) {
    try {
      console.log("controller editPackage")

      let update = await package.updatePackage(req);
      return res.status(200).send(update);
    } catch (err) {
      return res.status(500).send({ data: err });
    }
  };

  exports.addPackageDetail = async function(req, res, next) {
    try {
      console.log("controller add package detail")

      let update = await package.createPackageDetail(req);
      return res.status(200).send(update);
    } catch (err) {
      return res.status(500).send({ data: err });
    }
  };

  exports.getList = async function (req, res, next) {
    // const { body } = req;
    // const partner_id = parseInt(req.query.partnerid);

    const data = { 
      partner_id: req.partner_id,
      user_id: req.user_id,
      user_email: req.user_email,
      type: req.type
    };
    console.log('data get list package');
    console.log(data);

    try {
      var params;
      if (data.type == 2) {
        params = { partner_id: data.partner_id };
      } else {
        params = { partner_id: data.partner_id, public: true };
      }
      console.log('param list package');
      console.log(params);
          
      var packages = await package.getList(params);
      return res.status(200).json({ status: 200, data: packages, message: "Daftar Jasa/Produk Partner Berhasil Diambil" });
    } catch (err) {
      return res
        .status(500)
        .send({ code: 500, success: false, message: err.message, data: { err } });
    }
  };
  
  exports.get = async function (req, res, next) {
    const { body } = req;
    const id = parseInt(req.query.id);
    try {
          var packages = await package.getPackage(id);
          return res.status(200).json({ status: 200, data: packages, message: "Jasa/Produk Partner Berhasil Diambil" });
    } catch (err) {
      return res
        .status(500)
        .send({ code: 500, success: false, message: err.message, data: { err } });
    }
  };

  exports.deletePackage = async function (req, res, next) {
    const { body } = req;
    const id = parseInt(req.query.id);
    try {
          var packages = await package.destroyPackage(id);
          return res.status(200).json({ status: 200, data: packages, message: "Jasa/Produk Partner Berhasil Dihapus" });
    } catch (err) {
      return res
        .status(500)
        .send({ code: 500, success: false, message: err.message, data: { err } });
    }
  };

  exports.deletePackageDetail = async function (req, res, next) {
    const { body } = req;
    const id = parseInt(req.query.id);
    try {
          var packages = await package.destroyPackageDetail(id);
          return res.status(200).json({ status: 200, data: packages, message: "Detail Jasa/Produk Partner Berhasil Dihapus" });
    } catch (err) {
      return res
        .status(500)
        .send({ code: 500, success: false, message: err.message, data: { err } });
    }
  };
  