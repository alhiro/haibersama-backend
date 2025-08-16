const partner = require("../services/partner");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getDetail = async function (req, res, next) {
  console.log("controller partner");

  const { body } = req;
  const partner_id = req.query.id;
  try {
        var partnerDetail = await partner.getDetail(partner_id);
        console.log("controller test test");
        return res.status(200).json({ status: 200, data: partnerDetail.data, message: "Detail Partner Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getDetailUser = async function (req, res, next) {
  console.log("controller partner");
  
  // const { body } = req;
  // const partner_id = req.query.id;

  const params = { 
    partner_id: req.partner_id,
    user_id: req.user_id,
    user_email: req.user_email 
  };
  console.log('params get detail');
  console.log(params);

  try {
        var partnerDetail = await partner.getDetailUser(params, req);
        console.log("controller test test");
        return res.status(200).json({ status: 200, data: partnerDetail.data, message: "Detail User Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getPartner = async function (req, res, next) {
  console.log("controller partner");

  const { body } = req;
  const { token, partner_id } = body;
  try {
        var partnerDetail = await partner.getPartner(partner_id);
        console.log("controller test test");
        return res.status(200).json({ status: 200, data: partnerDetail, message: "Data Partner Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.searchPartner = async function (req, res, next) {
  const { body } = req;
  try {
        var partners = await partner.getSearchPartner(body);
        console.log("controller search");
        return res.status(200).json({ status: 200, data: partners, message: "Pencarian Partner Berhasil Diambil", length: partners[0].totalrow });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.searchPartnerGlobal = async function (req, res, next) {
  console.log("controller search partner " + JSON.stringify(req.query));
  try {
        var partners = await partner.searchPartnerGlobal(req.query);
        console.log('search partners');
        console.log(partners);
        if (partners.length > 0) {
          res.status(200).json({ status: 200, data: partners, message: "Success Find Partner" });
        } else {
          res.status(200).json({ status: 200, data: partners, message: "Partner Not Exist" })
        }
        // return res.status(200).json({ status: 200, data: partners, message: "Success Find Partner" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.provinces = async function (req, res, next) {
  try {
    var provinc = await partner.getProvinces();
    return res.status(200).json(
      { status: 200, message: "Provinsi Berhasil Diambil", data: provinc}
    );
  } catch (err) {
    return res
      .status(500)
      .send(
        { code: 500, success: false, message: err.message, data: { err } }
      );
  }
};

exports.city = async function (req, res, next) {
  try {
    var cities = await partner.getCity();
    return res.status(200).json(
      { status: 200, message: "Kota Berhasil Diambil", data: cities}
    );
  } catch (err) {
    return res
      .status(500)
      .send(
        { code: 500, success: false, message: err.message, data: { err } }
      );
  }
};