const Counter = require('../models/emailcounter');

module.exports =
  {  
    getList: async (params) => {        
      return await Counter.findAll({ 
        where: params
       })
        .then((counter) => {
          return (!counter) ? { success: false, message: "Email Counter Not Found", data: {} } : { success: true, message: "Email Counter Found", data: counter }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Email Counter Not Found", data: err } 
        });
      },

    getCounter: async (id) => {
          return await Counter.findOne({ 
              where: {
                  id: id
              }
          })
          .then((data) => {
            return (!data) ? { success: false, message: "Counter Not Found", data: {} } : { success: true, message: "Counter Found", data: data }
          })
          .catch((err) => { 
            console.log(err);
            return { success: false, message: "Counter Not Found", data: err } 
          });
    },

    findCounter: async (params) => {
      return await Counter.findOne({ 
          where: params
      })
      .then((data) => {
        return (!data) ? { success: false, message: "Counter Not Found", data: {} } : { success: true, message: "Counter Found", data: data }
      })
      .catch((err) => { 
        console.log(err);
        return { success: false, message: "Counter Not Found", data: err } 
      });
    },

    findOrCreateCounter: async (params, data) => {
      try {
        console.log('data counter email');
        console.log(data);
        const { reservation_no, status_code, counter } = data;

        var objData = {
          reservation_no: reservation_no,
          status_code: status_code,
          counter: counter
        };
        
        const result = await Counter.findOrCreate(
          { 
            where: params, 
            defaults: objData 
          }
        )

        if (!result[1]) {
          throw ({ success: false, message: "Email Counter already exists", data: {} })
        }
        
        return { success: true, message: "Email Counter Successfully Created", data: result[0].dataValues }
      } catch (error) {
        
        console.log(error);
        throw (error)
      }
    },

    updateCounter: async (data) => {
      try {
        const { reservation_no, counter, status_code, id } = data
        var objData = {
          reservation_no: reservation_no,
          counter: counter,
          status_code: status_code
        };
        
        return Counter.update(objData, { where: { id:id }})
        .then(async (updated) => { 
            const result = await Counter.findOne({ where: { id: id } });
            
            return { success: true, message: "Email Counter Successfully Updated", data: result.dataValues } })
        .catch((err) => { 
          console.log(error);
          return { success: false, message: "Update Email Counter Failed", data: err } });
      } catch (error) {
        console.log(error);
        throw (error)
      }
    },
}
  