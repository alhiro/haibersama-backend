const payment = require("../services/payment");
const reservation = require("../services/reservation");

const sequelizeTransaction = require("../config/sequelizeTransaction");
const { VERIFY_URL } = process.env;

exports.createPayment = async function(req, res, next) {
    try {   

        if(!req.reservationNo)
        {
          return res.status(400).send({ code: 400, success: false, message: "Nomor Reservasi Tidak Valid", data: {} });
        }else if(!req.paymentChannelCode)
        {
          return res.status(400).send({ code: 400, success: false, message: "Kode Channel Pembayaran Tidak Valid", data: {} });
        }

        let response = await payment.findOrCreatePayment(req);
        response.code = response.success ? 200 : 500;
      return res.status(200).send(response);
    } catch (err) {
      return res
        .status(500)
        .send({ code: 500, success: false, message: err.message, data: {} });
    }  
};

exports.updateStatus = async function(req, res, next) {
    try {            
        let data = await payment.updateStatusPayment(req);
        return res.status(200).send(data);
      } catch (err) {
        console.log(err);
        return res.status(500).send({ data: err });
      }    
};

exports.getPaymentInfo = async function(req, res, next) {
    try {
        const { reservationNo, userId } = req;
        
        let reservationData = await reservation.findReservation(reservationNo);
        console.log(userId);
        console.log(reservationData.data);

        if(userId != reservationData.data.user_id)
        {
          return res.status(400).send({ code: 400, success: false, message: "Id Pengguna Tidak Valid", data: {} });
        }
            
        let data = await payment.findPaymentInfo(reservationNo);
        data.code = data.success ? 200 : 500;
        return res.status(200).send(data);
    
      } catch (err) {
        console.log(err);
        return res.status(500).send({ data: err });
      }    
};