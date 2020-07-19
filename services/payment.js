const Payment = require('../models/payment');
const PaymentDetail = require('../models/paymentdetail');
const PaymentChannel = require('../models/paymentchannel');
// const PaymentStatusHistory = require('../models/paymentstatushistory');
const moment = require("moment");

module.exports =
  {        
    
    findOrCreatePayment: async (data) => {
      try {
        const { reservationNo, totalPrice, totalDiscount, userId, totalPayment, paymentChannelCode, paymentTimeLimit } = data;
 
        const paramChannel = {
          payment_channel_code: paymentChannelCode,
        };

        const channel = await Payment.findOne({ where: paramChannel });        

        var statusCode = "104101";
        var details = [];

        var detail = {
          payment_channel_code: paymentChannelCode,
          pg_code: channel.pg_code,
          method_code: channel.method_code,
          payment_amount: channel.payment_amount,
          status_code: statusCode,
          created_at: moment().utcOffset(0),
          created_by: 'system'
        };
        details.push(detail);
        
        const existPayment = {
          reservation_no: reservationNo,
        };

        const isPaymentExist = await Payment.findOne({ where: existPayment });
        
        if (!isDuplicate) {

          var paymentData = {
              reservation_no: reservationNo,
              total_price: totalPrice,
              total_discount: totalDiscount,
              total_payment: totalPayment,
              payment_channel_code: payment_channel_code,
              payment_time_limit: paymentTimeLimit,
              status_code: statusCode,
              created_at: moment().utcOffset(0),
              created_by: "system",
              payment_detail: details
          };      
          
          const insertparams = {
            reservation_no: reservationNo
          };

          const insertPayment = await Payment.findOrCreate({
            where: insertparams,
            include: [
              {
                model: PaymentDetail,
                as: 'payment_detail'
              }
            ],
            defaults: paymentData
          });

          if (!insertPayment[1]) {
            throw {
              success: false,
              message: "Failed to create payment",
              data: {}
            };
          } else {
            return {
              success: true,
              message: "Payment Successfully Created",
              data: insertPayment[0].dataValues
            };
          }
        } else {
          var objPayment = {
            payment_channel_code: paymentChannelCode, 
            updated_at: moment().utcOffset(0),
            updated_by: userId
          }
  
          return Payment.update(objPayment, {where: {reservation_no: reservationNo}} )
          .then(async (updated) => { 
              const updatePayment = await Payment.findOne({ where: { reservation_no: reservationNo } });  
              const updateDetail = await PaymentDetail.create(detail);
  
              return { success: true, message: "Payment Successfully Updated", data: updatePayment } })
          .catch((err) => { return { success: false, message: "Update Payment Failed", data: err } });
        }
      } catch (error) {
        console.log(error);
        throw error
      }
    },
    
    findPayment: async (reservationNo) => {
      return await Payment.findOne({ where: {reservation_no: reservationNo }})
        .then((payments) => {
          return (!payments) ? { success: false, message: "Payment Not Found", data: {} } : { success: true, message: "Payment Found", data: payments }
        })
        .catch((err) => { return { success: false, message: "Payment Not Found", data: err } });
    },
        
    updateStatusPayment: async (req) => {
      try {
        const { reservationNo, statusCode, userId } = req;

        var objPayment = {
          status_code: statusCode, 
          updated_at: moment().utcOffset(0),
          updated_by: userId
        }

        return Payment.update(objPayment, {where: {reservation_no: reservationNo}} )
        .then(async (updated) => { 
            const updatePayment = await Payment.findOne({ where: { reservation_no: reservationNo } })

            const history = {status_code: statusCode, payment_id: updatePayment.id, updatedcreated_at: moment().utcOffset(0), created_by: userId };
            const updateDetail = await PaymentStatusHistory.create(history);

            return { success: true, message: "Payment Successfully Updated", data: updatePayment } })
        .catch((err) => { return { success: false, message: "Update Payment Failed", data: err } });
      } catch (error) {
        throw (error)
      }
    },
  }

