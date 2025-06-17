const wallethistory = require('../models/partnerwallethistory');
const walletbalance = require('../models/partnerwalletbalance');
const moment = require("moment");
const sequelize = require('../config/sequelize');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const appSetting = require('../models/applicationsetting');

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
          return (!Wallet) ? { success: false, message: "Riwayat Wallet Partner Belum Ada!", data: {} } : { success: true, message: "Partner Wallet History Found", data: Wallet }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Riwayat Wallet Partner Belum Ada, Ada Kesalahan Server!", data: err } 
        });
      },

    getHistoryDetail: async (id) => {
          return await wallethistory.findOne({ 
              where: {
                  id: id
              }
          })
          .then((data) => {
            return (!data) ? { success: false, message: "Riwayat Wallet Partner Tidak Ditemukan!", data: {} } : { success: true, message: "Wallet History Found", data: data }
          })
          .catch((err) => { 
            console.log(err);
            return { success: false, message: "Riwayat Wallet Partner Tidak Ditemukan, Ada Kesalahan Server!", data: err } 
          });
    },

    findOrCreateWallet: async (params, data) => {
      try {
        const { partner_id, event_date, reservation_no, reservation_type, transaction_type, total_amount, status } = data;

        if (!reservation_no){
          if (transaction_type == "C") {
            throw ({ success: false, message: "Silahkan Masukan Nomor Reservasi", data: {} });
          } else {
            reservation_no = "";
          }
        } else {
          if (transaction_type == "C") {                    
            //check amount transaction is exist
            const params2 = {
              partner_id: partner_id,
              transaction_type: transaction_type,
              reservation_no: reservation_no
            };

            const isExists = await wallethistory.findOne({ where: params2 });
            
            if (isExists) {
              return {
                success: false,
                message: "Riwayat Wallet Partner Sudah Ada",
                data: {}
              };
            }
          }
        }

        if (total_amount == 0) {
          console.log("error amount");
          throw ({ success: false, message: "Silahkan Masukan Jumlah Total", data: {} });
        }

        if (!transaction_type || !reservation_no || !partner_id || !status) {
          console.log("Please input all data");
          throw ({ success: false, message: "Silahkan Masukan Semua Data", data: {} })
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
          event_date: event_date,
          transaction_no: transaction_no,
          transaction_date: transaction_date,
          transaction_type: transaction_type,
          reservation_type: reservation_type,
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

        if (reservation_type == 'MANUAL_ORDER') {
          const balance = await walletbalance.findOne({ where: paramBalance });
          console.log('balance value manual order');
          console.log(balance);
          if (balance) {
            console.log("ini update balance");
            let newAmount = balance.current_balance;
            if (transaction_type == "C") {    
              newAmount = balance.current_balance + total_amount;
            } else {
              newAmount = balance.current_balance - total_amount;
            }
            
            var paramUpdate = {
              current_balance: newAmount,
              updated_at: moment().utcOffset(0),
              updated_by: partner_id
            };

            console.log('paramUpdate balance');
            console.log(paramUpdate);
            
            walletbalance.update(paramUpdate, {where: {id: balance.id}} )
          } else {      
            console.log("create balance");    
            var paramInsert = {
              current_balance: total_amount,
              partner_id: partner_id,
              created_at: moment().utcOffset(0),
              created_by: partner_id
            };          

            console.log('paramUpdate create');
            console.log(paramInsert);

            const insertBalance = await walletbalance.findOrCreate({
              where: paramBalance,
              defaults: paramInsert
            });
          }
        } else {
          const balance = await walletbalance.findOne({ where: paramBalance });
          console.log('balance value user order');
          console.log(balance.dataValues);
          if (balance) {
            console.log("ini update balance");
            let newAmount = balance.current_balance_user;
            if (transaction_type == "C") {    
              newAmount = balance.current_balance_user + total_amount;
            } else {
              newAmount = balance.current_balance_user - total_amount;
            }
            
            var paramUpdate = {
              current_balance_user: newAmount,
              updated_at: moment().utcOffset(0),
              updated_by: 'system'
            };

            console.log('paramUpdate balance');
            console.log(paramUpdate);
            
            walletbalance.update(paramUpdate, {where: {id: balance.id}} )
          } else {      
            console.log("create balance");    
            var paramInsert = {
              current_balance_user: total_amount,
              partner_id: partner_id,
              created_at: moment().utcOffset(0),
              created_by: partner_id
            };          

            console.log('paramUpdate create');
            console.log(paramInsert);

            const insertBalance = await walletbalance.findOrCreate({
              where: paramBalance,
              defaults: paramInsert
            });
          }
        }

        // const balance = await walletbalance.findOne({ where: paramBalance });
        // console.log('balance value');
        // console.log(balance);
        // if (balance) {
        //   console.log("ini update balance");
        //   let newAmount = balance.current_balance;
        //   if (transaction_type == "C") {    
        //     newAmount = balance.current_balance + total_amount;
        //   } else {
        //     newAmount = balance.current_balance - total_amount;
        //   }
          
        //   var paramUpdate = {
        //     current_balance: newAmount,
        //     updated_at: moment().utcOffset(0),
        //     updated_by: partner_id
        //   };

        //   console.log('paramUpdate balance');
        //   console.log(paramUpdate);
          
        //   walletbalance.update(paramUpdate, {where: {id: balance.id}} )
        // } else {      
        //   console.log("create balance");    
        //   var paramInsert = {
        //     current_balance: total_amount,
        //     partner_id: partner_id,
        //     created_at: moment().utcOffset(0),
        //     created_by: partner_id
        //   };          

        //   console.log('paramUpdate create');
        //   console.log(paramInsert);

        //   const insertBalance = await walletbalance.findOrCreate({
        //     where: paramBalance,
        //     defaults: paramInsert
        //   });
        // }
        
        return { success: true, message: "Riwayat Wallet Partner Berhasil Dibuat", data: Wallet[0].dataValues }
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
            
            return { success: true, message: "Riwayat Status Wallet Partner Berhasil Diubah", data: result.dataValues[1] } })
        .catch((err) => { return { success: false, message: "Riwayat Status Wallet Partner Gagal Diubah", data: err } });
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
            success: true, message: "Saldo Wallet Partner Wallet Belum Ada!", data: {current_balance:0} 
          } : { 
            success: true, message: "Riwayat Saldo Wallet Partner Ditemukan", data: Wallet 
          }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Saldo Wallet Partner Wallet Belum Ada, Ada Kesalahan Server!", data: err } 
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
          if(balance.current_balance_user < totalAmount)
          {
            return { success: true, message: "Saldo Kurang Dari " + totalAmount, data: {} } 
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
            total_amount: -Math.abs(totalAmount),
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
          const feeSetting = await appSetting.findOne({
            where: { setting_name: "ADMIN_FEE" }
          });

          let adminFee = parseInt(feeSetting.setting_value);
          
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
            total_amount: -Math.abs(adminFee),
            status: "ADMIN_FEE",
            created_at: moment().utcOffset(0),
            created_by: userId
          };

          var paramHistoryFee = {
            transaction_no: transaction_no
          };
          
          const historyFee = await wallethistory.findOrCreate({ where: paramHistoryFee, defaults: objDataFee })
    
          let newAmount = balance.current_balance_user - totalAmount - adminFee;
                    
          var paramUpdate = {
            current_balance_user: newAmount,
            updated_at: moment().utcOffset(0),
            updated_by: userId
          };
          
          return walletbalance.update(paramUpdate, { where: { id:balance.id }})
          .then(async (updated) => { 
            console.log(updated);
            const newBalance = await walletbalance.findOne( { where: { id:balance.id }});
              return { success: true, message: "Penarikan Dana Sukses", data: newBalance } }
              )
          .catch((err) => { return { success: false, message: "Penarikan Dana Gagal", data: err } });
        
        } else {     
          return { success: false, message: "Tidak Ada Saldo", data: {} }        
        }
      }catch (error) {
        
        console.log(error);
        throw (error)
      }
    },
    
    getHistoriesGroupByDate: async (req) => {
      try {
      
        const { userId, date_from, date_to } = req;
        var histories = {};

        var query = `
        select 
          json_agg(
            json_build_object(
              to_char(a.transaction_date, 'YYYY-MM-DD'), items
            )
          ) d
        FROM (select 
                distinct date(transaction_date) transaction_date, 
                partner_id	  
              from partner_wallet_history rr
              where rr.partner_id = ` + userId + `
              and date(rr.transaction_date) >= '` + date_from + `'
              and date(rr.transaction_date) <= '` + date_to + `'
          )  a
        LEFT JOIN LATERAL (
          SELECT json_agg(x) AS items
          FROM  (select 
              transaction_date,
              transaction_type,
              reservation_no,
              transaction_no,
              status,
              total_amount
              from partner_wallet_history r
              where date(r.transaction_date) = a.transaction_date
            ) x 
          ) c ON true`;
          return sequelize.query(query,{ type : sequelize.QueryTypes.SELECT}).then(results => {
              if(results === null){
                return histories;
              }
              else{
                console.log('get list history by group date');
                console.log(JSON.stringify(results[0].d));

                // var total = 0;
                // results[0].d.map(val => {
                //   // console.log('map results');
                //   // console.log(val);
                  
                //   for (var i = 0; i < val[Object.keys(val)].length; i++) {
                //     let filter = val[Object.keys(val)][i];

                //     console.log('filter object by total_amount');
                //     console.log(filter.total_amount);

                //     total += filter.total_amount;
                //   }
                // });

                // console.log('total_amount');
                // console.log(total);

                // var obj = results[0].d;
                
                // var total_amount = {
                //   "total_history_amount": total
                // };
                
                // newObj = obj.concat(total_amount);

                // let newArray = [];
                // results[0].d.map(d => {
                //   for (var i = 0; i < Object.keys(d).length; i++) {

                //     let revItem = d[Object.keys(d)[i]];
                //     let mergeWithTotal = revItem.concat({total});
                //     let combine = {
                //         [Object.keys(d)[i]] : mergeWithTotal
                //     }
                //     console.log('reviiii');
                //     console.log(combine);
                //     newArray.push(combine);
                //   }
                // });

                return results[0].d;
              }
          });

      } catch (error) {
        console.log(error);
        throw error
      }
    },

    getHistoriesGroupByEventDate: async (req) => {
      try {
      
        const { userId, date_from, date_to, type } = req;
        console.log(req);
        var histories = {};

        var query = `
            select 
              json_agg(
                json_build_object(
                  to_char(a.event_date, 'YYYY-MM-DD'), items
                )
              ) d
            FROM (select 
                    distinct date(event_date) event_date, 
                    partner_id	  
                  from partner_wallet_history rr
                  where rr.partner_id = ` + userId + `
                  and rr.reservation_type = '` + type + `'
                  and date(rr.event_date) >= '` + date_from + `'
                  and date(rr.event_date) <= '` + date_to + `'
              )  a
            LEFT JOIN LATERAL (
              SELECT json_agg(x) AS items
              FROM  (select 
                  event_date,
                  transaction_date,
                  transaction_type,
                  reservation_no,
                  reservation_type,
                  transaction_no,
                  status,
                  total_amount,
                  event_date_reservation,
                  client_name
                  from partner_wallet_history r
                  left join lateral (
                    SELECT event_date event_date_reservation,
                    name client_name
                    from reservation oyc
                    where oyc.reservation_no = r.reservation_no
                  ) sum4 on true
                  where date(r.event_date) = a.event_date and r.partner_id = ` + userId + `
                ) x 
              ) c ON true`;
          return sequelize.query(query,{ type : sequelize.QueryTypes.SELECT}).then(results => {
              if(results === null){
                return histories;
              }
              else{
                console.log('get list history by group date');
                console.log(JSON.stringify(results[0].d));

                // var total = 0;
                // results[0].d.map(val => {
                //   // console.log('map results');
                //   // console.log(val);
                  
                //   for (var i = 0; i < val[Object.keys(val)].length; i++) {
                //     let filter = val[Object.keys(val)][i];

                //     console.log('filter object by total_amount');
                //     console.log(filter.total_amount);

                //     total += filter.total_amount;
                //   }
                // });

                // console.log('total_amount');
                // console.log(total);

                // var obj = results[0].d;
                
                // var total_amount = {
                //   "total_history_amount": total
                // };
                
                // newObj = obj.concat(total_amount);

                // let newArray = [];
                // results[0].d.map(d => {
                //   for (var i = 0; i < Object.keys(d).length; i++) {

                //     let revItem = d[Object.keys(d)[i]];
                //     let mergeWithTotal = revItem.concat({total});
                //     let combine = {
                //         [Object.keys(d)[i]] : mergeWithTotal
                //     }
                //     console.log('reviiii');
                //     console.log(combine);
                //     newArray.push(combine);
                //   }
                // });

                return results[0].d;
              }
          });

      } catch (error) {
        console.log(error);
        throw error
      }
    },
}
  