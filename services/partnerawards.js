const Awards = require('../models/partnerawards');

module.exports =
  {  
    getList: async (params) => {        
      return await Awards.findAll({ 
        where: params,
        // attributes: ["id",
        //             "name",
        //             "awards_date",
        //             "organizer",
        //             "description",
        //             "image_url"
        // ], 
        order: [["awards_date", "DESC"]]
       })
        .then((awards) => {
          return (!awards) ? { success: false, message: "Partner Award Belum Ada!", data: {} } : { success: true, message: "Partner Awards Found", data: awards }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Award Belum Ada, Ada Kesalahaan Server!", data: err } 
        });
      },

    getDetail: async (id) => {
          return await Awards.findOne({ 
              where: {
                  id: id
              }, 
              // attributes: ["id",
              //             "name",
              //             "awards_date",
              //             "organizer",
              //             "description",
              //             "image_url"
              // ], 
          })
          .then((data) => {
            return (!data) ? { success: false, message: "Partner Award Detail Belum Ada", data: {} } : { success: true, message: "Award Found", data: data }
          })
          .catch((err) => { 
            console.log(err);
            return { success: false, message: "Partner Award Detail Belum Ada, Ada Kesalahaan Server", data: err } 
          });
    },

    findOrCreateAwards: async (params, data) => {
      try {
        console.log(data);
        const { partner_id, name, description, awards_date, organizer, image_url, location, occupation } = data;

        var objData = {
          name: name,
          partner_id: partner_id,
          awards_date: awards_date,
          organizer: organizer,
          description: description,
          location: location,
          accupation: occupation,
          image_url: image_url
        };
        
        const awards = await Awards.findOrCreate({ where: params, defaults: objData })
  
        // check name already registered or not
        if (!awards[1]) {
          throw ({ success: false, message: "Partner Award Sudah Ada", data: {} })
        }
        
        return { success: true, message: "Partner Award Berhasil Dibuat", data: awards[0].dataValues }
      } catch (error) {
        
        console.log(error);
        throw (error)
      }
    },

    updateAwards: async (data) => {
      try {
        const { name, awards_date, organizer, description, image_url, id, location, occupation } = data
        var objData = {
          name: name,
          awards_date: awards_date,
          organizer: organizer,
          description: description,
          location: location,
          occupation: occupation
        };

        if(image_url){
          objData.image_url = image_url;
        }
        
        return Awards.update(objData, { where: { id:id }})
        .then(async (updated) => { 
            const result = await Awards.findOne({ where: { id: id } });
            
            return { success: true, message: "Partner Award Berhasil Diubah", data: result.dataValues } })
        .catch((err) => { 
          console.log(error);
          return { success: false, message: "Partner Award Gagal Diubah", data: err } });
      } catch (error) {
        console.log(error);
        throw (error)
      }
    },

    deleteAward: async (data) => {
      try {
        const { partner_id, id } = data;

        return Awards.destroy({
          where: {
            id: id,
            partner_id: partner_id
          },
        })
          .then(async (deleted) => {
            return { success: true, message: "Partner Award Berhasil Dihapus", data: [] }
          })
          .catch((err) => {
            console.log(err);
            return { success: false, message: "Partner Award Gagal Dihapus", data: err }
          });
      } catch (error) {
        console.log(error);
        throw (error)
      }
    },
}
  