const ser = require("../services/partnerwallethistory");
const sequelizeTransaction = require("../config/sequelizeTransaction");

exports.getHistories = async function(req, res, next) {
  console.log("controller service");  

  const { userId, date_from, date_to } = req;
  try {
    if(!date_from){
      return res.status(400).send({ code: 400, success: false, message: "Silahkan Masukan Tanggal Dari.", data: {} });
    }

    if(!date_to){
      return res.status(400).send({ code: 400, success: false, message: "Silahkan Masukan Tanggal ke.", data: {} });
    }

    var services = await ser.getList(req);
    return res
      .status(200)
      .json({ status: 200, data: services, message: "Riwayat Transaksi Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getHistoriesGroupByDate = async function(req, res, next) {
  console.log("controller service");  

  const { userId, date_from, date_to } = req;
  try {
    if(!date_from){
      return res.status(400).send({ code: 400, success: false, message: "Silahkan Masukan Tanggal Dari.", data: {} });
    }

    if(!date_to){
      return res.status(400).send({ code: 400, success: false, message: "Silahkan Masukan Tanggal Ke.", data: {} });
    }

    var services = await ser.getHistoriesGroupByDate(req);
    return res
      .status(200)
      .json({ status: 200, data: services, message: "Riwayat Transaksi Berdasarkan Group Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getHistoriesGroupByEventDate = async function(req, res, next) {
  console.log("controller service");  

  const { userId, date_from, date_to, type } = req;
  try {
    if(!date_from){
      return res.status(400).send({ code: 400, success: false, message: "Silahkan Masukan Tanggal Dari.", data: {} });
    }

    if(!date_to){
      return res.status(400).send({ code: 400, success: false, message: "Silahkan Masukan Tanggal Ke.", data: {} });
    }

    var services = await ser.getHistoriesGroupByEventDate(req);
    return res
      .status(200)
      .json({ status: 200, data: services, message: "Riwayat Transaksi Berdasarkan Group Event Date Berhasil Diambil" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getbalance = async function(req, res, next) {
  console.log("controller service");  

  const { userId } = req;
  try {
    var param = {
      partner_id: userId
    };

    var services = await ser.getBalance(param);
    return res
      .status(200)
      .json({ status: 200, data: services, message: "Riwayat Saldo Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.withdraw = async function(req, res, next) {
  console.log("controller service");  

  const { userId } = req;
  try {
    // var param = {
    //   partner_id: userId,
    //   total_amount: total_amount
    // };

    var services = await ser.withdraw(req);
    return res
      .status(200)
      .json({ status: 200, data: services, message: "Penarikan Dana Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};
