const Awards = require('../models/partnerawards');

module.exports =
  {  
    getList: async (params) => {        
      return await Awards.findAll({ 
        where: params,
        attributes: ["id",
                    "name",
                    "awards_date",
                    "organizer",
                    "description",
                    "image_url"
        ], 
        order: [["awards_date", "DESC"]]
       })
        .then((awards) => {
          return (!awards) ? { success: false, message: "Partner Awards Not Found", data: {} } : { success: true, message: "Partner Awards Found", data: awards }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Awards Not Found", data: err } 
        });
      },

    getDetail: async (id) => {
          return await Awards.findOne({ 
              where: {
                  id: id
              }, 
              attributes: ["id",
                          "name",
                          "awards_date",
                          "organizer",
                          "description",
                          "image_url"
              ], 
          })
          .then((data) => {
            return (!data) ? { success: false, message: "Award Not Found", data: {} } : { success: true, message: "Award Found", data: data }
          })
          .catch((err) => { 
            console.log(err);
            return { success: false, message: "Award Not Found", data: err } 
          });
    },

    findOrCreateAwards: async (params, data) => {
      try {
        console.log(data);
        const { partner_id, name, description, awards_date, organizer, image_url } = data;

        var objData = {
          name: name,
          partner_id: partner_id,
          awards_date: awards_date,
          organizer: organizer,
          description: description,
          image_url: image_url
        };
        
        const awards = await Awards.findOrCreate({ where: params, defaults: objData })
  
        // check name already registered or not
        if (!awards[1]) {
          throw ({ success: false, message: "Partner awards already exists", data: {} })
        }
        
        return { success: true, message: "Partner Award Successfully Created", data: awards[0].dataValues }
      } catch (error) {
        
        console.log(error);
        throw (error)
      }
    },

    updateAwards: async (data) => {
      try {
        const { name, awards_date, organizer, description, image_url, id } = data

        var objData = {
          name: name,
          awards_date: awards_date,
          organizer: organizer,
          description: description,
          image_url: image_url
        };
        
        return Awards.update(objData, { where: { id:id }})
        .then(async (updated) => { 
            const result = await Awards.findOne({ where: { id: id } })
            
            return { success: true, message: "Partner Awards Successfully Updated", data: result.dataValues[1] } })
        .catch((err) => { return { success: false, message: "Update Partner Awards Failed", data: err } });
      } catch (error) {
        console.log(error);
        throw (error)
      }
    },
}
  