const wallethistory = require('../models/partnerwallethistory');
const walletbalance = require('../models/partnerwalletbalance');
const moment = require("moment");
const sequelize = require('../config/sequelize');
const Sequelize = require('sequelize');

module.exports =
  {  
    getList: async (params) => {        
      return await wallethistory.findAll({ 
        where: params
       })
        .then((Wallet) => {
          return (!Wallet) ? { success: false, message: "Partner Wallet History Not Found", data: {} } : { success: true, message: "Partner Wallet History Found", data: Wallet }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Wallet History Not Found", data: err } 
        });
      },

    getDetail: async (id) => {
          return await wallethistory.findOne({ 
              where: {
                  id: id
              }
          })
          .then((data) => {
            return (!data) ? { success: false, message: "Wallet History Not Found", data: {} } : { success: true, message: "Wallet History Found", data: data }
          })
          .catch((err) => { 
            console.log(err);
            return { success: false, message: "Wallet History Not Found", data: err } 
          });
    },

    findOrCreateWallet: async (params, data) => {
      try {
        const { partner_id, reservation_no, transaction_type, total_amount, status } = data;

        if(!reservation_no){
          if(transaction_type == "C"){
            throw ({ success: false, message: "Please input reservation no", data: {} });
          }else{
            reservation_no = "";
          }
        }else{
          if(transaction_type == "C"){                    
            //check amount transaction is exist
            const params2 = {
              partner_id: partner_id,
              transaction_type: transaction_type,
              reservation_no: reservation_no
            };

            const isExists = await wallethistory.findOne({ where: params2 });
            
            if(isExists){
              return {
                success: false,
                message: "Already exists.",
                data: {}
              };
            }
          }
        }

        if(total_amount == 0){
          throw ({ success: false, message: "Please input total amount", data: {} });
        }

        if (!transaction_type || !reservation_no || !partner_id || !status) {
          throw ({ success: false, message: "Please input all data", data: {} })
        }

        let transaction_date = moment().utcOffset(0).format("YYMMDD");

        const lastReservation = await wallethistory.findOne({
          where: { transaction_no: { [Sequelize.Op.like]: `${transaction_date}%` } },
          order: [["transaction_no", "DESC"]]
        });
        
        let transaction_no = "";
        //create new storeid
        if (!lastReservation) {
          transaction_no = transaction_date + "00001";
        } else {
          var strNewId = Number(lastReservation.reservation_no.substring(6, 11)) + 1;
          if (strNewId.toString().length < 5) {
            transaction_no = transaction_date + "0".repeat(5 - strNewId.toString().length) + strNewId;
          } else {
            transaction_no = transaction_date + strNewId;
          }
        }

        var objData = {
          partner_id: partner_id,
          transaction_no: transaction_no,
          transaction_date: transaction_date,
          transaction_type: transaction_type,
          reservation_no: reservation_no,
          total_amount: total_amount,
          status: status
        };
        
        const Wallet = await wallethistory.findOrCreate({ where: params, defaults: objData })
  
        // check reservation_no already registered or not
        // if (Wallet[1]) {
        //   throw ({ success: false, message: "Partner Wallet History already exists", data: {} })
        // }

        var paramBalance = {
          partner_id: partner_id
        };

        const balance = await walletbalance.findOne({ where: paramBalance });
        console.log(balance);
        if(balance){
          console.log("ini");
          let newAmount = balance.current_balance;
          if(transaction_type == "C"){    
            newAmount = balance.current_balance + total_amount;
          } else {
            newAmount = balance.current_balance - total_amount;
          }
          
          var paramUpdate = {
            current_balance: newAmount,
            updated_at: moment().utcOffset(0),
            updated_by: userId
          };
          
          walletbalance.update(paramUpdate, {where: {id: balance.id}} )
        } else {      
          console.log("itu");    
          var paramInsert = {
            current_balance: total_amount,
            updated_at: moment().utcOffset(0),
            updated_by: userId
          };          

          const insertBalance = await walletbalance.findOrCreate({
            where: paramBalance,
            defaults: paramInsert
          });
        }
        
        return { success: true, message: "Partner Wallet History Successfully Created", data: Wallet[0].dataValues }
      } catch (error) {
        
        console.log(error);
        throw (error)
      }
    },

    updateStatusWallet: async (data) => {
      try {
        const { status, id } = data

        var objData = {
          status: status
        };
        
        return wallethistory.update(objData, { where: { id:id }})
        .then(async (updated) => { 
            const result = await wallethistory.findOne({ where: { id: id } })
            
            return { success: true, message: "Partner Wallet History Status Successfully Updated", data: result.dataValues[1] } })
        .catch((err) => { return { success: false, message: "Update Partner Wallet History Status Failed", data: err } });
      } catch (error) {
        console.log(error);
        throw (error)
      }
    },
}
  