const Category = require('../models/category');
const moment = require('moment');

module.exports =
  {        
    getAll: async () => {
      try {
        return await Category.findAll({
            where:{
                active : true
            },
            attributes: ['id',
                        'name',
                        'description'
            ],
            order:[
                ["order_no", "ASC"]
            ]
        });
      } catch (error) {
        throw error
      }
    },

    findCategory: async (params) => {
      return await Category.findOne({ where: params })
        .then((categories) => {
          //delete categories.password
          return (!categories) ? { success: false, message: "Category Not Found", data: {} } : { success: true, message: "Category Found", data: categories }
        })
        .catch((err) => { return { success: false, message: "Category Not Found", data: err } });
    },
  }
