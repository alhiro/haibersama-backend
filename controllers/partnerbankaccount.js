const partnerbankaccount = require("../services/partnerbankaccount");
const sequelizeTransaction = require("../config/sequelizeTransaction");

exports.getAll = async function(req, res, next) {
  const partner_id = req;
  try {
    var params = { partner_id: partner_id };
    var account = await partnerbankaccount.getList(params);
    return res
      .status(200)
      .json({ status: 200, data: account.data, message: "Akun Bank Partner Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getDetail = async function(req, res, next) {
  const id = req.query.id;
  try {
    var account = await partnerbankaccount.getDetail(id);
    return res
      .status(200)
      .json({ status: 200, data: account, message: "Detail Akun Bank Partner Berhasil Diambil" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.addAccount = async function(req, res, next) {
  try {
    // const params = { account_no: req.account_no, partner_id: req.partner_id };
    //1 partner 1 account
    const params = { partner_id: req.partner_id };

    let result = await partnerbankaccount.findOrCreateAccount(params, req);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};

exports.updateAccount = async function(req, res, next) {
  try {
      let result = await partnerbankaccount.updateAccount(req);
      return res.status(200).send(result);    
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};
