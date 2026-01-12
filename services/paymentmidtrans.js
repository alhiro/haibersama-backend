const Payment = require('../models/payment');
const PaymentDetail = require('../models/paymentdetail');
const Reservation = require('../models/reservation');
const ReservationStatusHistory = require('../models/reservationstatushistory');
const PaymentChannel = require('../models/paymentchannel');
const moment = require("moment");
const Sequelize = require('../config/sequelize');
const midtransClient = require('midtrans-client');
const { MIDTRANS_ENVIRONMENT, MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY } = process.env;

module.exports =
  {        
    
    findOrCreatePayment: async (data) => {
    try 
    {
        const { reservationNo, totalPrice, totalDiscount, userId, paymentType } = data;
 
        // const paramChannel = {
        //   payment_channel_code: paymentChannelCode,
        // };

        // const channel = await PaymentChannel.findOne({ where: paramChannel });        

        var statusCode = "PAYMENT_REQUEST";

        let paymentStatus = "";
        let reservationStatus = "";
        let transactionStatus = "";
        let paymentOrderID = "";
        let paymentTotalAmount = 0;
        let expiredDuration = 1;
        // var details = [];
        
        if(paymentType == "DOWN_PAYMENT")
        {
          paymentStatus = "PAYMENT_DP_REQUEST";
          reservationStatus = "ORDER_DP_REQUEST";
          transactionStatus = "NEW";
          paymentOrderID = reservationNo + "-DP";
          //sementara d hardcode
          paymentTotalAmount = (totalPrice - totalDiscount) * 20 / 100;   
          expiredDuration = 1;       
        } else if(paymentType == "REPAYMENT")
        {
          paymentStatus = "PAYMENT_REPAYMENT_REQUEST";
          reservationStatus = "ORDER_REPAYMENT_REQUEST";
          transactionStatus = "ON_PROCESS";
          paymentOrderID = reservationNo + "-RP";
          var dpAmount = (totalPrice - totalDiscount) * 20 / 100;
          paymentTotalAmount = totalPrice - dpAmount;
          expiredDuration = 1;
        } else{
          paymentStatus = "PAYMENT_REQUEST";
          reservationStatus = "ORDER_PAYMENT_REQUEST";
          transactionStatus = "NEW";
          paymentOrderID = reservationNo + "-FP";
          paymentTotalAmount = totalPrice - totalDiscount;
          expiredDuration = 1;
        }

        var objReservation = {
          status_code: reservationStatus, 
          transaction_status_code: transactionStatus,
          updated_at: moment().utcOffset(0),
          updated_by: userId
        }

        let paymentTimeLimit = moment().utcOffset(0).add(expiredDuration, "days").add(5, "minutes");
            
        console.log(JSON.stringify(objReservation), "objReservation")

        Reservation.update(objReservation, {where: {reservation_no: reservationNo}} )
        .then(async (updated) => { 
            const upReserv = await Reservation.findOne({ where: { reservation_no: reservationNo } })
            console.log(JSON.stringify(upReserv), "upReserv")

            // const history = {status_code: statusCode, reservation_id: upReserv.id, created_at: moment().utcOffset(0), created_by: userId };
            // const upHistory = await ReservationStatusHistory.create(history);
        })
        .catch((err) => { console.log(err); });

        var contacts = await Sequelize.query(
          `SELECT 
              c.id, 
              c.reservation_id, 
              c.name, 
              c.address, 
              c.phone_no, 
              c.wa_no, 
              c.email, 
              c.social_media, 
              c.other_description, 
              c.created_at, 
              c.created_by, 
              c.updated_at, 
              c.updated_by
            FROM reservation_contact c
            inner join reservation r on r.id = c.reservation_id
            where r.reservation_no = '`+reservationNo+`';`,
          {
              raw: true,
              type: Sequelize.QueryTypes.SELECT
          }
        );

        var contact = null;
        if(contacts.length > 0){
            contact = contacts[0];
        }

        var firstName = contact.name.split(' ').slice(0, -1).join(' ');
        var lastName = contact.name.split(' ').slice(-1).join(' ');

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
                  "order_id": paymentOrderID,
                  "gross_amount": paymentTotalAmount
              },
              "customer_details": {
                "first_name": firstName,
                "last_name": lastName,
                "email": contact.email,
                "phone": contact.phone_no,
                "billing_address": {
                  "first_name": firstName,
                  "last_name": lastName,
                  "email": contact.email,
                  "phone": contact.phone_no,
                  "address": contact.address
                }
              }, 
              "expiry": {
                "start_time": moment().format("YYYY-MM-DD hh:mm:ss Z"),
                "unit": "days",
                "duration": expiredDuration
              },
              "credit_card":{
                "secure" : true
              }
          }; 
          
          console.log(parameter);
          let transactionResult = await snap.createTransaction(parameter)
          .then((transaction)=>{
              // transaction token
              let transactionToken = transaction.token;
              console.log('transactionToken:',transactionToken);     
              return transaction;
          });  
          
          console.log('transactionResult:',transactionResult);    

          if(transactionResult == null || transactionResult == undefined || transactionResult.token == null)
          {
            if(!transactionResult.error_messages)
            {
              return {
                success: false,
                message: transactionResult.error_messages
              };  
            }
            else 
            {
              return {
                success: false,
                message: "Gagal Mendapatkan Token"
              };  
            }
          } 

          var details = new Array();
          var detail = {
            payment_order_id: paymentOrderID,
            pg_code: "MIDTRANS",
            // payment_channel_code: "",
            method_code: "",
            payment_amount: paymentTotalAmount,
            payment_type: paymentType,
            token: transactionResult.token,
            redirect_url: transactionResult.redirect_url,
            payment_time_limit: paymentTimeLimit,
            status_code: "request",
            created_at: moment().utcOffset(0),
            created_by: 'system'
          };

          details.push(detail);
          
          // let paymentTimeLimit = moment().utcOffset(0).add(expiredDuration, "days").add(5, "minutes");
          
          //sementara hardcode
          var totalPaymentFee = 2 * totalPrice / 100;

          var paymentData = {
            reservation_no: reservationNo,
            total_price: totalPrice,
            total_discount: totalDiscount,
            total_payment: 0,
            total_payment_fee: totalPaymentFee,
            // payment_channel_code: paymentChannelCode,
            // payment_time_limit: paymentTimeLimit,
            status_code: paymentStatus,
            created_at: moment().utcOffset(0),
            created_by: "system"
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

          if (!insertPayment) {
            throw {
              success: false,
              message: "Gagal Membuat Pembayaran",
              data: {}
            };        
           } else {
            return {
              success: true,
              message: "Berhasil Membuat Pembayaran",
              data: transactionResult
            }; 
          }
          
        } 
        else 
        {
          const existDetailParam = {
            payment_id: isPaymentExist.id,
            payment_type: paymentType
          };

          const existDetailFound = await PaymentDetail.findOne({ where: existDetailParam });     
          
          if(!existDetailFound){
            let snap = new midtransClient.Snap({
              isProduction : MIDTRANS_ENVIRONMENT == "PRODUCTION",
              serverKey : MIDTRANS_SERVER_KEY,
              clientKey : MIDTRANS_CLIENT_KEY
            });    
            
            let parameter = {
                "transaction_details": {
                    "order_id": paymentOrderID,
                    "gross_amount": paymentTotalAmount
                },
                "customer_details": {
                  "first_name": firstName,
                  "last_name": lastName,
                  "email": contact.email,
                  "phone": contact.phone_no,
                  "billing_address": {
                    "first_name": firstName,
                    "last_name": lastName,
                    "email": contact.email,
                    "phone": contact.phone_no,
                    "address": contact.address
                  }
                }, 
                "expiry": {
                  "start_time": moment().format("YYYY-MM-DD hh:mm:ss Z"),
                  "unit": "days",
                  "duration": expiredDuration
                },
                "credit_card":{
                  "secure" : true
                }
            }; 

            console.log(parameter);

            let transactionResult = await snap.createTransaction(parameter)
            .then((transaction)=>{
                // transaction token
                let transactionToken = transaction.token;
                console.log('transactionToken:',transactionToken);     
                return transaction;
            });  
            
            console.log('transactionResult:',transactionResult);    

            if(transactionResult == null || transactionResult == undefined || transactionResult.token == null)
            {
              if(!transactionResult.error_messages)
              {
                return {
                  success: false,
                  message: transactionResult.error_messages
                };  
              }
              else 
              {
                return {
                  success: false,
                  message: "Gagal Mendapatkan Token"
                };  
              }
            } 
            
            transactionResult.payment_order_id = paymentOrderID;
                        
            var detail = {
              payment_id: isPaymentExist.id,
              payment_order_id: paymentOrderID,
              pg_code: "MIDTRANS",
              // payment_channel_code: "",
              method_code: "",
              payment_amount: paymentTotalAmount,
              payment_type: paymentType,
              token: transactionResult.token,
              redirect_url: transactionResult.redirect_url,
              payment_time_limit: paymentTimeLimit,
              status_code: "request",
              created_at: moment().utcOffset(0),
              created_by: 'system'
            };
          
            const insertdetailparams = {
              payment_id: isPaymentExist.id,
              payment_type: paymentType
            };

            const insertDetailPayment = await PaymentDetail.findOrCreate({
              where: insertdetailparams,
              defaults: detail
            });

            if (!insertDetailPayment[1]) {
              throw {
                success: false,
                message: "Gagal Membuat Pembayaran",
                data: {}
              };        
            } else {
              return {
                success: true,
                message: "Berhasil Membuat Pembayaran",
                data: transactionResult
              }; 
            }
          } 
          else
          {
            if(!existDetailFound.token)
            {
              let snap = new midtransClient.Snap({
                isProduction : MIDTRANS_ENVIRONMENT == "PRODUCTION",
                serverKey : MIDTRANS_SERVER_KEY,
                clientKey : MIDTRANS_CLIENT_KEY
              });    
              
              let parameter = {
                  "transaction_details": {
                      "order_id": paymentOrderID,
                      "gross_amount": paymentTotalAmount
                  },
                  "customer_details": {
                    "first_name": firstName,
                    "last_name": lastName,
                    "email": contact.email,
                    "phone": contact.phone_no,
                    "billing_address": {
                      "first_name": firstName,
                      "last_name": lastName,
                      "email": contact.email,
                      "phone": contact.phone_no,
                      "address": contact.address
                    }
                  }, 
                  "expiry": {
                    "start_time": moment().format("YYYY-MM-DD hh:mm:ss Z"),
                    "unit": "days",
                    "duration": expiredDuration
                  },
                  "credit_card":{
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
              
              console.log('transactionResult:', transactionResult);    
                
              if(transactionResult == null || transactionResult == undefined || transactionResult.token == null)
              {
                if(!transactionResult.error_messages)
                {
                  return {
                    success: false,
                    message: transactionResult.error_messages
                  };  
                }
                else 
                {
                  return {
                    success: false,
                    message: "Gagal Mendapatkan Token"
                  };  
                }
              } 

              existDetailFound.token = transactionResult.token;
              existDetailFound.redirect_url = transactionResult.redirect_url;
              existDetailFound.payment_order_id = paymentOrderID;
              existDetailFound.payment_time_limit = paymentTimeLimit;

              transactionResult.payment_order_id = paymentOrderID;

              return PaymentDetail.update(existDetailFound, {where: {id: existDetailFound.id}} )
              .then(async (updated) => { 
                  return { success: true, message: "Berhasil Membuat Token Midtrans", data: transactionResult } })
              .catch((err) => { return { success: false, message: "Gagal Membuat Token Midtrans", data: err } });
            }
            else
            {
              return {
                success: true,
                message: "Berhasil Mendapatkan Token Midtrans",
                data: {
                  token: existDetailFound.token,
                  redirect_url: existDetailFound.redirect_url,
                  payment_order_id: paymentOrderID
                }
              };  
            }
          }
        }        
      } catch (error) {
        console.log(error);
        throw error
      }
    },
        
    updatePaymentCallback: async (req) => {
      try {
        const { status_code, status_message, transaction_id, order_id, gross_amount, payment_type, transaction_status, bank } = req;

        // cc response
      //   {
      //     "status_code":"200",
      //     "status_message":"Success, Credit Card transaction is successful",
      //     "transaction_id":"6d9677da-45a3-40d0-a0f0-8f0b2f860a64",
      //     "masked_card":"481111-1114",
      //     "order_id":"1459499971",
      //     "gross_amount":"10000.00",
      //     "payment_type":"credit_card",
      //     "transaction_time":"2016-04-01 15:39:58",
      //     "transaction_status":"capture",
      //     "fraud_status":"accept",
      //     "approval_code":"100057",
      //     "bank":"bni",
      //     "card_type":"credit"
      //  }

        // echannel
      //   {
      //     "status_code":"201",
      //     "status_message":"Transaksi sedang diproses",
      //     "transaction_id":"0ae66c29-e4a6-4e7b-b223-a103564a8d29",
      //     "order_id":"1459500813",
      //     "gross_amount":"10000.00",
      //     "payment_type":"echannel",
      //     "transaction_time":"2016-04-01 15:54:07",
      //     "transaction_status":"pending",
      //     "fraud_status":"accept",
      //     "bill_key":"001689",
      //     "biller_code":"70012",
      //     "pdf_url": "https://app.midtrans.com/snap/v1/transactions/0ae66c29-e4a6-4e7b-b223-a103564a8d29/pdf"
      //  }        
      
        const detail = await PaymentDetail.findOne({ where: { payment_order_id: order_id } })
        
        var transactionStatus = "NEW";
        var orderStatus = "ORDER_WAITING_CONFIRM";
        var paymentStatus = "NEW";
        var paymentTransactionStatus = "NEW";

        var reservationNo = order_id.split("-")[0];
        
        if(status_code == "200") 
        {
          if(detail.payment_type == "DOWN_PAYMENT")
          {
            transactionStatus = "ON_PROCESS";            
            orderStatus = "ORDER_DP_COMPLETED";
            paymentStatus =  "PAYMENT_DP_COMPLETED";
            paymentTransactionStatus = "ON_PROCESS";
          } 
          else 
          {
            transactionStatus = "ON_PROCESS";            
            orderStatus = "ORDER_PAYMENT_COMPLETED";
            paymentStatus =  "PAYMENT_COMPLETED";
            paymentTransactionStatus = "SUCCESS";
          }
        }   
        else if(status_code == "202") 
        {
          if(detail.payment_type == "DOWN_PAYMENT")
          {
            transactionStatus = "ON_PROCESS";            
            orderStatus = "ORDER_DP_FAILED";
            paymentStatus =  "PAYMENT_FAILED";
            paymentTransactionStatus = "FAILED";
          } 
          else 
          {
            transactionStatus = "ON_PROCESS";            
            orderStatus = "ORDER_PAYMENT_FAILED";
            paymentStatus =  "PAYMENT_FAILED";
            paymentTransactionStatus = "FAILED";
          }
        }  

        var upDetail = {          
          status_code: transaction_status.toString().toUpperCase(),
          payment_method_code: payment_type,
          bank: bank
        }

        return PaymentDetail.update(upDetail, {where: {payment_order_id: order_id}} )
        .then(async (updated) => { 
          var upPayment = {
            status_code: paymentStatus,
            transaction_status_code: paymentTransactionStatus
          }

          Payment.update(upPayment, {where: {id: detail.payment_id}} );
          
          var upOrder = {
            status_code: orderStatus,
            transaction_status_code: transactionStatus
          }

          Reservation.update(upOrder, {where: {reservation_no: reservationNo}} );

          return { success: true, message: "Berhasil Ubah Pembayaran", data: upDetail };
        })
        .catch((err) => { return { success: false, message: "Gagal Ubah Pembayaran", data: err } });


      } catch (error) {
        throw (error)
      }
    },
        
    updatePaymentDetailStatus: async (req) => {
      try {
        const { payment_order_id, status_code } = req;

        var objPayment = {
          status_code: statusCode, 
          updated_at: moment().utcOffset(0),
          updated_by: userId
        }

        return Payment.update(objPayment, {where: {reservation_no: reservationNo}} )
        .then(async (updated) => { 
            const updatePayment = await Payment.findOne({ where: { reservation_no: reservationNo } })

            const updateDetail = await PaymentDetail.create(detail);

            return { success: true, message: "Detail Pembayaran Berhasil Diubah", data: updatePayment } })
        .catch((err) => { return { success: false, message: "Detail Pembayaran Gagal Diubah", data: err } });
      } catch (error) {
        throw (error)
      }
    },
  }

