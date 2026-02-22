const ser = require("../services/service");
const sequelizeTransaction = require("../config/sequelizeTransaction");
const admin = require("firebase-admin");
const utilility = require("../lib/utils");

const HaiUser = require('../models/haiuser');

exports.getAllServices = async function(req, res, next) {
  console.log("controller service");

  const { body } = req;
  const { token } = body;
  try {
    var services = await ser.getAll();
    return res
      .status(200)
      .json({ status: 200, data: services, message: "Semua Jasa/Produk Layanan Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.addService = async function(req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { name: req.body.name };

    let insertService = await ser.findOrCreateService(params, req);
    return res.status(200).send(insertService);
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.updateService = async function(req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { id: req.body.id };

    const findService = await ser.findService(params);
    console.log("findService :", findService)
    if (findService.success=== true){
      let insertService = await ser.updateService(params, req);
      return res.status(200).send(insertService);
    }
    
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.sendChatService = async function(req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const {
      senderName,
      receiverId,
      message,
    } = req.body;
    console.log(req.body);

    // 🔔 Kirim Notifikasi FCM ke user dan partner
    // Ambil token penerima
    const receiverToken = await utilility.getFcmTokens(receiverId, HaiUser);

    // Notifikasi untuk Partner
    try {
      if (receiverToken) {
        const partnerPayload = {
          notification: {
            title: senderName,
            body: message,
          },
          android: {
            notification: {
              icon: "ic_notification", // harus cocok dengan nama ikon di drawable
              color: "#1B84FF", // opsional
            },
            priority: "high",
          },
          apns: {
            headers: {
              "apns-priority": "10",
            },
            payload: {
              aps: {
                alert: {
                  title: senderName,
                  body: message,
                },
                sound: "default",
                badge: 1,
              },
            },
          },
          data: {
            type: "chat",
          },
          token: receiverToken,
        };
        const partnerRes = await admin.messaging().send(partnerPayload);
        console.log("✅ Notifikasi chat sent:", partnerRes);
      } else {
        console.log("⚠️ No token for chat messaging");
      }
    } catch (err) {
      console.error("❌ Error FCM: no token receiver", err);
    }

  } catch (err) {
    console.error("❌ Error chat API:", err);
    return res.status(500).send({ data: err });
  }
};
