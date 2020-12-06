const Payment = require('../models/payment');
const PaymentDetail = require('../models/paymentdetail');
const PaymentChannel = require('../models/paymentchannel');
const moment = require("moment");
const Sequelize = require('../config/sequelize');
const midtransClient = require('midtrans-client');
const { MIDTRANS_ENVIRONMENT, MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY } = process.env;

module.exports =
  {        
    
    findOrCreatePayment: async (data) => {
      try {
        const { reservationNo, totalPrice, totalDiscount, userId, totalPayment } = data;
 
        // const paramChannel = {
        //   payment_channel_code: paymentChannelCode,
        // };

        // const channel = await PaymentChannel.findOne({ where: paramChannel });        

        var statusCode = "PAYMENT_REQUEST";
        // var details = [];

        // var detail = {
        //   payment_channel_code: paymentChannelCode,
        //   pg_code: channel.pg_code,
        //   method_code: channel.method_code,
        //   payment_amount: totalPayment,
        //   status_code: statusCode,
        //   created_at: moment().utcOffset(0),
        //   created_by: 'system'
        // };
        // details.push(detail);
        
        const existPayment = {
          reservation_no: reservationNo,
        };

        const isPaymentExist = await Payment.findOne({ where: existPayment });
        
        if (!isPaymentExist) {
          let snap = new midtransClient.Snap({
              isProduction : MIDTRANS_ENVIRONMENT == "PRODUCTION",
              serverKey : MIDTRANS_SERVER_KEY,
              clientKey : MIDTRANS_CLIENT_KEY
          });
    
          let parameter = {
              "transaction_details": {
                  "order_id": reservationNo,
                  "gross_amount": totalPrice
              }, "credit_card":{
                  "secure" : true
              }
          }; 
       
          let transactionResult = await snap.createTransaction(parameter)
          .then((transaction)=>{
              // transaction token
              let transactionToken = transaction.token;
              console.log('transactionToken:',transactionToken);     
              return transaction;
          });  
          
          console.log('transactionResult:',transactionResult);    

          let paymentTimeLimit = moment().utcOffset(0).add(1, "days").add(5, "minutes");
          
          var paymentData = {
            reservation_no: reservationNo,
            total_price: totalPrice,
            total_discount: totalDiscount,
            total_payment: totalPayment,
            // payment_channel_code: paymentChannelCode,
            payment_time_limit: paymentTimeLimit,
            status_code: statusCode,
            created_at: moment().utcOffset(0),
            created_by: "system"
        };      
        
        const insertparams = {
          reservation_no: reservationNo
        };

        const insertPayment = await Payment.findOrCreate({
          where: insertparams,
          // include: [
          //   {
          //     model: PaymentDetail,
          //     as: 'payment_detail'
          //   }
          // ],
          defaults: paymentData
        });

        if (!insertPayment[1]) {
          throw {
            success: false,
            message: "Failed to create payment",
            data: {}
          };
        } else {          
          if(!transactionResult)
          {     
            return {
              success: true,
              message: "Failed to create midtrans token",
              data: {}
            }; 
          }
          else
          {                 
            return {
              success: false,
              message: "Payment Successfully Created",
              data: transactionResult
            };
          }
        }
          
        } else {

          detail.payment_id = existPayment.id;
          
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
    
    findPaymentInfo: async (reservationNo) => {
      try{
          return Sequelize.query(
              `select 
                  reservation_no,
                  total_payment,
                  payment_time_limit,
                  pm.description payment_method,
                  pc.bank_name,
                  pc.account_no,
                  pc.account_name
                from payment p
                inner join payment_channel pc on pc.payment_channel_code = p.payment_channel_code
                left join code_info pm on pm.code = pc.method_code
                where reservation_no = '`+reservationNo+`';`,
              { 
                  raw: true,
                  type: Sequelize.QueryTypes.SELECT
              }
          ).then(payment => {
            return (!payment) ? { success: false, message: "Payment Info Not Found", data: {} } : { success: true, data: payment[0] }
          })
      } catch (error) {
      throw error
      }
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

            const updateDetail = await PaymentDetail.create(detail);

            return { success: true, message: "Payment Successfully Updated", data: updatePayment } })
        .catch((err) => { return { success: false, message: "Update Payment Failed", data: err } });
      } catch (error) {
        throw (error)
      }
    },
  }

