const PaymentChannel = require('../models/paymentchannel');

module.exports =
  {        
    getAllActive: async () => {
      try {
        return await PaymentChannel.findAll({
            where:{
                active : true
            }//,
            // attributes: ['id',
            //             'name',
            //             'description'
            // ],
            // order:[
            //     ["order_no", "ASC"]
            // ]
        });
      } catch (error) {
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

    findPaymentChannel: async (params) => {
      return await PaymentChannel.findOne({ where: params })
        .then((categories) => {
          return (!categories) ? { success: false, message: "Payment Channel Not Found", data: {} } : { success: true, message: "PaymentChannel Found", data: categories }
        })
        .catch((err) => { return { success: false, message: "Payment Channel Not Found", data: err } });
    },

    findOrCreatePaymentChannel: async (params, req) => {
      try {
        const { paymentChannelCode, description, PGCode, methodCode, bankCode, bankName, accountNo, accountName, orderNo, active } = req.body
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
          const { paymentChannelCode, description, PGCode, methodCode, bankCode, bankName, accountNo, accountName, orderNo, active } = req.body

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
