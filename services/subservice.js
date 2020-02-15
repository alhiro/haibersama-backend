const SubService = require('../models/subservice');

module.exports =
  {        
    getAll: async () => {
      try {
        return await SubService.findAll({
        });
      } catch (error) {
        throw error
      }
    },

    findService: async (params) => {
        console.log(params,"params")
      return await SubService.findOne({ where: params })
        .then((services) => {
          return (!services) ? { success: false, message: "SubService Not Found", data: {} } : { success: true, message: "SubService Found", data: services }
        })
        .catch((err) => { return { success: false, message: "SubService Not Found", data: err } });
    },

    findOrCreateService: async (params, serviceData) => {
        try {
          const { name, description } = serviceData.body
          var objService = {
            name: name,
            description: description,
          }
          const insertService = await SubService.findOrCreate({ where: params, defaults: objService })
    
          // check name already registered or not
          if (!insertService[1]) {
            throw ({ success: false, message: "That subservice already exists", data: {} })
          }
          
          return { success: true, message: "SubService Successfully Created", data: insertService[0].dataValues }
        } catch (error) {
          throw (error)
        }
      },

      updateService: async (params, serviceData) => {
          try {
            console.log("update sub service")
            const { name, description, id } = serviceData.body
            console.log(serviceData.body.name, "name")
            console.log(description, "description")
            console.log(id, "id")

            var objService = {
              name: name,
              description: description,
            }
            console.log(JSON.stringify(objService), "objService")

            return SubService.update(objService,{where: params} )
            .then(async (updated) => { 
                const upService = await SubService.findOne({ where: { id: id } })
                console.log(JSON.stringify(upService), "upService")
                return { success: true, message: "SubService Successfully Updated", data: upService } })
            .catch((err) => { return { success: false, message: "Update SubService Failed", data: err } });
          } catch (error) {
            throw (error)
          }
        },
  }
