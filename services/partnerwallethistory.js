const wallethistory = require('../models/partnerwallethistory');
const walletbalance = require('../models/partnerwalletbalance');
const moment = require("moment");
const sequelize = require('../config/sequelize');
const Sequelize = require('sequelize');
const { Op } = Sequelize;

module.exports =
  {  
    getList: async (req) => {       
      
  const { userId, date_from, date_to } = req;
 
      return await wallethistory.findAll({ 
        where: {
          partner_id: userId,
          transaction_date: {
            [Op.gte]: Date.parse(date_from),
            [Op.lte]: Date.parse(date_to)
          }
        }
       })
        .then((Wallet) => {
          return (!Wallet) ? { success: false, message: "Partner Wallet History Not Found", data: {} } : { success: true, message: "Partner Wallet History Found", data: Wallet }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Wallet History Not Found", data: err } 
        });
      },

    getHistoryDetail: async (id) => {
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
          console.log("error amount");
          throw ({ success: false, message: "Please input total amount", data: {} });
        }

        if (!transaction_type || !reservation_no || !partner_id || !status) {
          console.log("Please input all data");
          throw ({ success: false, message: "Please input all data", data: {} })
        }

        let transaction_date = moment().utcOffset(0);
        let transaction_date_format = moment().utcOffset(0).format("YYMMDD");

        const lastReservation = await wallethistory.findOne({
          where: { transaction_no: { [Sequelize.Op.like]: `${transaction_date_format}%` } },
          order: [["transaction_no", "DESC"]]
        });
        
        let transaction_no = "";
        //create new storeid
        if (!lastReservation) {
          transaction_no = transaction_date_format + "00001";
        } else {
          var strNewId = Number(lastReservation.transaction_no.substring(6, 11)) + 1;
          
          if (strNewId.toString().length < 5) {
            transaction_no = transaction_date_format + "0".repeat(5 - strNewId.toString().length) + strNewId;
          } else {
            transaction_no = transaction_date_format + strNewId;
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
            updated_by: partner_id
          };
          
          walletbalance.update(paramUpdate, {where: {id: balance.id}} )
        } else {      
          console.log("itu");    
          var paramInsert = {
            current_balance: total_amount,
            partner_id: partner_id,
            created_at: moment().utcOffset(0),
            created_by: partner_id
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

    
    getBalance: async (params) => {        
      return await walletbalance.findOne({ 
        where: params
       })
        .then((Wallet) => {
          return (!Wallet) ? { 
            success: true, message: "Partner Wallet Balance Not Found", data: {current_balance:0} 
          } : { 
            success: true, message: "Partner Wallet History Found", data: Wallet 
          }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Wallet Balance Not Found", data: err } 
        });
      },
      
    withdraw: async (data) => {
      try {
        const { userId, totalAmount } = data

        var paramBalance = {
          partner_id: userId
        };
        
        const balance = await walletbalance.findOne({ where: paramBalance });
        console.log(balance);
        if(balance){
          if(balance.current_balance < totalAmount)
          {
            return { success: true, message: "Balance is less than " + totalAmount, data: {} } 
          }
          
          let transaction_date = moment().utcOffset(0);
          let transaction_date_format = moment().utcOffset(0).format("YYMMDD");

          const lastReservation = await wallethistory.findOne({
            where: { transaction_no: { [Sequelize.Op.like]: `${transaction_date_format}%` } },
            order: [["transaction_no", "DESC"]]
          });
          
          let transaction_no = "";
          //create new storeid
          if (!lastReservation) {
            transaction_no = transaction_date_format + "00001";
          } else {
            var strNewId = Number(lastReservation.transaction_no.substring(6, 11)) + 1;
            
            if (strNewId.toString().length < 5) {
              transaction_no = transaction_date_format + "0".repeat(5 - strNewId.toString().length) + strNewId;
            } else {
              transaction_no = transaction_date_format + strNewId;
            }
          }

          var objData = {
            partner_id: userId,
            transaction_no: transaction_no,
            transaction_date: transaction_date,
            transaction_type: "D",
            reservation_no: "",
            total_amount: totalAmount,
            status: "WITHDRAW",
            created_at: moment().utcOffset(0),
            created_by: userId
          };

          var paramHistory = {
            transaction_no: transaction_no
          };
          
          const history = await wallethistory.findOrCreate({ where: paramHistory, defaults: objData })

          //admin fee
          // transaction_date = moment().utcOffset(0);
          // transaction_date_format = moment().utcOffset(0).format("YYMMDD");

          const lastReservationFee = await wallethistory.findOne({
            where: { transaction_no: { [Sequelize.Op.like]: `${transaction_date_format}%` } },
            order: [["transaction_no", "DESC"]]
          });

          transaction_no = "";
          let adminFee = 0;
          //create new storeid
          if (!lastReservationFee) {
            transaction_no = transaction_date_format + "00001";
          } else {
            var strNewId = Number(lastReservationFee.transaction_no.substring(6, 11)) + 1;
            
            if (strNewId.toString().length < 5) {
              transaction_no = transaction_date_format + "0".repeat(5 - strNewId.toString().length) + strNewId;
            } else {
              transaction_no = transaction_date_format + strNewId;
            }
          }

          var objDataFee = {
            partner_id: userId,
            transaction_no: transaction_no,
            transaction_date: transaction_date,
            transaction_type: "D",
            reservation_no: "",
            total_amount: adminFee,
            status: "ADMIN_FEE",
            created_at: moment().utcOffset(0),
            created_by: userId
          };

          var paramHistoryFee = {
            transaction_no: transaction_no
          };
          
          const historyFee = await wallethistory.findOrCreate({ where: paramHistoryFee, defaults: objDataFee })
    
          let newAmount = balance.current_balance - totalAmount - adminFee;
                    
          var paramUpdate = {
            current_balance: newAmount,
            updated_at: moment().utcOffset(0),
            updated_by: userId
          };
          
          return walletbalance.update(paramUpdate, { where: { id:balance.id }})
          .then(async (updated) => { 
            console.log(updated);
            const newBalance = await walletbalance.findOne( { where: { id:balance.id }});
              return { success: true, message: "Withdraw success", data: newBalance } }
              )
          .catch((err) => { return { success: false, message: "Withdraw Failed", data: err } });
        
        } else {     
          return { success: false, message: "No saldo", data: {} }        
        }
      }catch (error) {
        
        console.log(error);
        throw (error)
      }
    },
}
  