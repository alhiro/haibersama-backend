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
            // order:[
            //   ["setting_name", "ASC"]
            // ],
        });
      } catch (error) {
        throw error
      }
    },
  }
