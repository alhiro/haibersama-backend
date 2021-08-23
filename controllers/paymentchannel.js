const cat = require("../services/paymentchannel");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getAll = async function (req, res, next) {
  try {
        var channels = await cat.getAll();
        return res.status(200).json({ status: 200, data: channels, message: "Semua Channel Pembayaran Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getActiveList = async function (req, res, next) {
  try {
    var channels = await cat.getAllActive();
    return res.status(200).json({ status: 200, data: channels, message: "Channel Pembayaran Aktif Berhasil Diambil " });
  } catch (err) {
  return res
    .status(500)
    .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getPaymentChannelDetail = async function (req, res, next) {
  try {    
    let channelCode = req.query.channelCode;

    var channels = await cat.findPaymentChannelByCode(channelCode);
    return res.status(200).json({ status: 200, data: channels.data, message: "Detail Channel Pembayaran Berhasil Diambil" });
  } catch (err) {
  return res
    .status(500)
    .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.addPaymentChannel = async function(req, res, next) {
  try {
    console.log("controller addPaymentChannel")
    const params = { payment_channel_code: req.body.paymentChannelCode };

    let insertPaymentChannel = await cat.findOrCreatePaymentChannel(params, req);
    return res.status(200).send(insertPaymentChannel);
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.updatePaymentChannel = async function(req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { id: req.body.id };

    const findPaymentChannel = await cat.findPaymentChannel(params);
    console.log("findPaymentChannel :", findPaymentChannel)
    if (findPaymentChannel.success=== true){
      let updatePaymentChannel = await cat.updatePaymentChannel(params, req);
      return res.status(200).send(updatePaymentChannel);
    }
    
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};
