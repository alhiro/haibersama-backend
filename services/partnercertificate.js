const PartnerCertificate = require('../models/partnercertificate');

module.exports =
  {  
    getList: async (params) => {        
      return await PartnerCertificate.findAll({ 
        where: params,
        attributes: ["id",
                    "name",
                    "certificate_date",
                    "organizer",
                    "description",
                    "image_url"
        ], 
        order: [["certificate_date", "DESC"]]
       })
        .then((certificate) => {
          return (!certificate) ? { success: false, message: "Partner Certificate Not Found", data: {} } : { success: true, message: "Partner Certificate Found", data: certificate }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Certificate Not Found", data: err } 
        });
      },

    getDetail: async (id) => {
        return await PartnerCertificate.findOne({ 
              where: {
                  id: id
              }, 
              attributes: ["id",
                          "name",
                          "certificate_date",
                          "organizer",
                          "description",
                          "image_url"
              ], 
          })
        .then((data) => {
          return (!data) ? { success: false, message: "Certificate Not Found", data: {} } : { success: true, message: "Certificate Found", data: data }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Certificate Not Found", data: err } 
        });
    },

    findOrCreateCertificate: async (params, data) => {
      try {
        const { partner_id, name, description, certificate_date, organizer, image_url } = data;

        var objData = {
          name: name,
          partner_id: partner_id,
          certificate_date: certificate_date,
          organizer: organizer,
          description: description,
          image_url: image_url
        };
        
        const certificate = await PartnerCertificate.findOrCreate({ where: params, defaults: objData })
  
        if (!certificate[1]) {
          throw ({ success: false, message: "Partner certificate already exists", data: {} })
        }
        
        return { success: true, message: "Partner Certificate Successfully Created", data: certificate[0].dataValues }
      } catch (error) {
        throw (error)
      }
    },

    updateCertificate: async (data) => {
      try {
        const { name, certificate_date, organizer, description, image_url, id } = data

        var objData = {
          name: name,
          certificate_date: certificate_date,
          organizer: organizer,
          description: description,
          image_url: image_url
        };
        

        
        return PartnerCertificate.update(objData, { where: { id:id }})
        .then(async (updated) => { 
            const result = await PartnerCertificate.findOne({ where: { id: id } })
            
            return { success: true, message: "Partner Certificate Successfully Updated", data: result } })
        .catch((err) => { return { success: false, message: "Update Partner Certificate Failed", data: err } });
      } catch (error) {
        throw (error)
      }
    },
}
  