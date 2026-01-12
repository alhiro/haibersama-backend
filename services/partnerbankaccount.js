const partnerbankaccount = require('../models/partnerbankaccount');

module.exports =
  {  
    getList: async (params) => {        
      return await partnerbankaccount.findAll({ 
        where: params
       })
        .then((Account) => {
          return (!Account) ? { success: false, message: "Partner Bank Belum Ada", data: {} } : { success: true, message: "Partner Bank Account Found", data: Account }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Bank Belum Ada, Ada Kesalahan Server", data: err } 
        });
      },

    getDetail: async (id) => {
          return await partnerbankaccount.findOne({ 
              where: {
                  id: id
              }
          })
          .then((data) => {
            return (!data) ? { success: false, message: "Partner Bank Tidak Ditemukan", data: {} } : { success: true, message: "Bank Account Found", data: data }
          })
          .catch((err) => { 
            console.log(err);
            return { success: false, message: "Partner Bank Tidak Ditemukan, Ada Kesalahan Server", data: err } 
          });
    },

    findOrCreateAccount: async (params, data) => {
      try {
        console.log(data);
        const { partner_id, bank_code, account_name, bank_name, account_no, is_active } = data;

        if (!account_name || !bank_code || !bank_name || !account_name || !account_no) {
          throw ({ success: false, message: "Masukan Semua Informasi Bank", data: {} })
        }

        var objData = {
          bank_code: bank_code,
          partner_id: partner_id,
          bank_name: bank_name,
          account_no: account_no,
          account_name: account_name,
          is_active: is_active
        };
        
        const Account = await partnerbankaccount.findOrCreate({ where: params, defaults: objData })
  
        // check bank_code already registered or not
        if (!Account[1]) {
          throw ({ success: false, message: "Partner Bank Sudah Ada", data: {} })
        }
        
        return { success: true, message: "Partner Bank Berhasil Dibuat", data: Account[0].dataValues }
      } catch (error) {
        throw (error)
      }
    },

    updateAccount: async (data) => {
      try {
        const { bank_code, bank_name, account_no, account_name, is_active, id } = data;

        if (!account_name || !bank_code || !bank_name || !account_name || !account_no) {
          throw ({ success: false, message: "Masukan Semua Informasi Bank", data: {} })
        }

        var objData = {
          bank_code: bank_code,
          bank_name: bank_name,
          account_no: account_no,
          account_name: account_name,
          is_active: is_active
        };
        
        return partnerbankaccount.update(objData, { where: { id:id }})
        .then(async (updated) => { 
            const result = await partnerbankaccount.findOne({ where: { id: id } })
            
            return { success: true, message: "Partner Bank Berhasil Diubah", data: result.dataValues[1] } })
        .catch((err) => { return { success: false, message: "Partner Bank Gagal Diubah", data: err } });
      } catch (error) {
        console.log(error);
        throw (error)
      }
    },
}
  