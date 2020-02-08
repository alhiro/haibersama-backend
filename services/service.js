const Service = require('../models/service');

module.exports =
  {        
    getAll: async () => {
      try {
        return await Service.findAll({
        });
      } catch (error) {
        throw error
      }
    },

    findService: async (params) => {
      return await Service.findOne({ where: params })
        .then((services) => {
          return (!services) ? { success: false, message: "Service Not Found", data: {} } : { success: true, message: "Service Found", data: services }
        })
        .catch((err) => { return { success: false, message: "Service Not Found", data: err } });
    },

    findOrCreateService: async (params, serviceData) => {
        try {
          const { name, description } = serviceData.body
          var objService = {
            name: name,
            description: description,
          }
          const insertService = await Service.findOrCreate({ where: params, defaults: objService })
    
          // check name already registered or not
          if (!insertService[1]) {
            throw ({ success: false, message: "That service already exists", data: {} })
          }
          
          return { success: true, message: "Service Successfully Created", data: insertService[0].dataValues }
        } catch (error) {
          throw (error)
        }
      },

      updateService: async (params, serviceData) => {
          try {
            const { name, description, id } = serviceData.body
            console.log(serviceData.body.name, "name")
            console.log(description, "description")
            console.log(id, "id")

            var objService = {
              name: name,
              description: description,
            }
            console.log(JSON.stringify(objService), "objService")

            return Service.update(objService,{where: params} )
            .then(async (updated) => { 
                const upService = await Service.findOne({ where: { id: id } })
                console.log(JSON.stringify(upService), "upService")
                return { success: true, message: "Service Successfully Updated", data: upService } })
            .catch((err) => { return { success: false, message: "Update Service Failed", data: err } });
          } catch (error) {
            throw (error)
          }
        },
  }
