const Service = require('../models/service');
const subService = require('../models/subservice');
const Category = require('../models/category');

module.exports =
  {        
    getAll: async () => {
      try {
        return await Service.findAll({
          attributes: [
            'id',
            'name',
            'description',
            'category_id',
            'created_by',
            'updated_by',
            'createdAt',
            'updatedAt'
          ],
          order:[
            ["createdAt", "ASC"]
          ],
          include: [
            {
              model: Category
            }
          ]
        });
      } catch (error) {
        throw error
      }
    },

    findService: async (params) => {
      return await Service.findOne({ where: params })
        .then((services) => {
          return (!services) ? { success: false, message: "Jasa Tidak Ditemukan!", data: {} } : { success: true, message: "Jasa Berhasil Ditemukan", data: services }
        })
        .catch((err) => { return { success: false, message: "Jasa Tidak Ditemukan, Ada Kesalahan Server!", data: err } });
    },

    findOrCreateService: async (params, serviceData) => {
        try {
          console.log("Create new service")
          const { name, description, category_id } = serviceData.body
          var objService = {
            name: name,
            description: description,
            category_id: category_id
          }
          
          const insertService = await Service.findOrCreate({ where: params, defaults: objService })

          // check name already registered or not
          // if (!insertService[1]) {
          //   throw ({ success: false, message: "That service already exists", data: {} })
          // }

          return await Service.create(objService)
          .then(async (data) => {
            return { success: true, message: "Jasa Berhasil Dibuat", data: insertService[0].dataValues }
          })
          .catch((err) => {
            return { success: false, message: "Jasa Gagal Dibuat", data: err }
          });
        } catch (error) {
          throw (error)
        }
      },

      updateService: async (params, serviceData) => {
          try {
            const {id, name, description, category_id} = serviceData.body
            console.log(id, "id")
            console.log(name, "name")
            console.log(description, "description")
            console.log(category_id, "category id")

            var objService = {
              name: name,
              description: description,
              category_id: category_id,
            }
            console.log(JSON.stringify(objService), "objService")

            return await Service.update(objService,{where: params} )
            .then(async (updated) => { 
              const upService = await Service.findOne({ where: { id: id } })
              console.log(JSON.stringify(upService), "upService")
              return { success: true, message: "Jasa Berhasil Diubah", data: upService } })
            .catch((err) => { 
              return { success: false, message: "Jasa Gagal Diubah", data: err } 
            });
          } catch (error) {
            throw (error)
          }
        },
  }
