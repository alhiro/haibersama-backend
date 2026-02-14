const Setting = require('../models/applicationsetting');

module.exports =
  {        
    getAll: async () => {
      try {
        return await Setting.findAll({
            // where:{
            //     active : true
            // },
            // attributes: [
            //   'id',
            //   'name',
            //   'description',
            //   'order_no',
            //   'active'
            // ],
            order:[
              ["id", "ASC"]
            ],
        });
      } catch (error) {
        throw error
      }
    },

    updateSetting: async (req) => {
      try {
        const { id, setting_name, setting_value, remark, updated_by } = req;
        console.log(req);
       
        const params = { id: id };

        var objSetting = {
          setting_name: setting_name,
          setting_value: setting_value, 
          remark: remark,
          updated_by: updated_by,
          updated_at: new Date()
        }
        console.log(JSON.stringify(objSetting), "objSetting")

        return Setting.update(objSetting, {where: params} )
        .then(async (updated) => { 
            const upService = await Setting.findOne({ where: { id: id } })
            return { success: true, message: "Setting App Berhasil Diubah", data: upService } })
        .catch((err) => { return { success: false, message: "Setting App Gagal Diubah", data: err } });
      } catch (error) {
        throw (error)
      }
    },
  }
