const Category = require('../models/category');

module.exports =
  {        
    getAll: async () => {
      try {
        return await Category.findAll({
            // where:{
            //     active : true
            // },
            attributes: ['id',
                        'name',
                        'description',
                        'active'
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
          return (!categories) ? { success: false, message: "Category Not Found", data: {} } : { success: true, message: "Category Found", data: categories }
        })
        .catch((err) => { return { success: false, message: "Category Not Found", data: err } });
    },

    findOrCreateCategory: async (params, req) => {
      try {
        const { name, description, order_no, active } = req.body
        var objCategory = {
          name: name,
          description: description,
          order_no: order_no,
          active: active == 1 ? true : false
        }
        const insertCategory = await Category.findOrCreate({ where: params, defaults: objCategory })
  
        // check name already registered or not
        if (!insertCategory[1]) {
          throw ({ success: false, message: "That Category already exists", data: {} })
        }
        
        return { success: true, message: "Category Successfully Created", data: insertCategory[0].dataValues }
      } catch (error) {
        throw (error)
      }
    },

    updateCategory: async (params, req) => {
        try {
          const { name, description, id, active, order_no } = req.body

          var objCategory = {
            name: name,
            description: description, 
            order_no: order_no,
            active: active == 1 ? true : false
          }
          console.log(JSON.stringify(objCategory), "objCategory")

          return Category.update(objCategory,{where: params} )
          .then(async (updated) => { 
              const upService = await Category.findOne({ where: { id: id } })
              console.log(JSON.stringify(upService), "upService")
              return { success: true, message: "Category Successfully Updated", data: upService } })
          .catch((err) => { return { success: false, message: "Update Category Failed", data: err } });
        } catch (error) {
          throw (error)
        }
      },
  }
