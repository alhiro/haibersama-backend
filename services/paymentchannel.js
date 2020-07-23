const PaymentChannel = require('../models/paymentchannel');
const Sequelize = require('../config/sequelize');

module.exports =
{  
    getAllActive: async () => {
      try{
          return Sequelize.query(
              `select 
                  payment_channel_code,
                  pc.description payment_channel_desc,
                  pm.description payment_method,
                  pg.description payment_gateway,
                  pc.bank_name,
                  pc.account_no,
                  pc.account_name,
                  pc.icon_url
                from payment_channel pc 
                left join code_info pm on pm.code = pc.method_code
                left join code_info pg on pg.code = pc.pg_code
                where active = true;`,
              { 
                  raw: true,
                  type: Sequelize.QueryTypes.SELECT
              }
          ).then(payment => {
            //console.log(payment);
              return payment;
          })
      } catch (error) {
        console.log(error);
      throw error
      }
  },

    getAll: async () => {
      try {
        return await PaymentChannel.findAll();
      } catch (error) {
        throw error
      }
    },

    findPaymentChannelByCode: async (paymentChannelCode) => {
      return Sequelize.query(
        `select 
            payment_channel_code,
            pc.description payment_channel_desc,
            pm.description payment_method,
            pg.description payment_gateway,
            pc.bank_name,
            pc.account_no,
            pc.account_name,
            pc.icon_url
          from payment_channel pc 
          left join code_info pm on pm.code = pc.method_code
          left join code_info pg on pg.code = pc.pg_code
          where payment_channel_code = '`+paymentChannelCode+`';`,
        { 
            raw: true,
            type: Sequelize.QueryTypes.SELECT
        }
      ).then(payment => {
        //console.log(payment);
          return (!payment) ? { success: false, message: "Payment Channel Not Found", data: {} } : { success: true, message: "PaymentChannel Found", data: payment }
          
      })
    },

    findOrCreatePaymentChannel: async (params, req) => {
      try {
        const { paymentChannelCode, description, PGCode, methodCode, bankCode, bankName, accountNo, accountName, orderNo, iconUrl, active } = req.body
        var objPaymentChannel = {
          payment_channel_code: paymentChannelCode,
          description: description,
          pg_code: PGCode,
          method_code: methodCode,
          bank_code: bankCode,
          bank_name: bankName,
          account_no: accountNo,
          account_name: accountName,
          order_no: orderNo,
          icon_url: iconUrl,
          active: active == 1 ? true : false
        }
        const insertPaymentChannel = await PaymentChannel.findOrCreate({ where: params, defaults: objPaymentChannel })
  
        // check name already registered or not
        if (!insertPaymentChannel[1]) {
          throw ({ success: false, message: "That PaymentChannel already exists", data: {} })
        }
        
        return { success: true, message: "PaymentChannel Successfully Created", data: insertPaymentChannel[0].dataValues }
      } catch (error) {
        throw (error)
      }
    },

    updatePaymentChannel: async (params, req) => {
        try {
          const { paymentChannelCode, description, PGCode, methodCode, bankCode, bankName, accountNo, accountName, orderNo, iconUrl, active } = req.body

          var objPaymentChannel = {
            payment_channel_code: paymentChannelCode,
            description: description,
            pg_code: PGCode,
            method_code: methodCode,
            bank_code: bankCode,
            bank_name: bankName,
            account_no: accountNo,
            account_name: accountName,
            order_no: orderNo,
            icon_url: iconUrl,
            active: active == 1 ? true : false
          }
          console.log(JSON.stringify(objPaymentChannel), "objPaymentChannel")

          return PaymentChannel.update(objPaymentChannel,{where: params} )
          .then(async (updated) => { 
              const upService = await PaymentChannel.findOne({ where: { id: id } })
              console.log(JSON.stringify(upService), "upService")
              return { success: true, message: "PaymentChannel Successfully Updated", data: upService } })
          .catch((err) => { return { success: false, message: "Update PaymentChannel Failed", data: err } });
        } catch (error) {
          throw (error)
        }
      },
  }
