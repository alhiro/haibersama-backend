const PartnerExperience = require('../models/partnerexperience');

module.exports =
  {  
    getList: async (params) => {        
      return await PartnerExperience.findAll({ 
        where: params,
        attributes: ["id",
                    "position",
                    "period_from",
                    "period_to",
                    "company_name",
                    "description",
                    "image_url"
        ], 
        order: [["period_to", "DESC"]]
       })
        .then((experience) => {
          return (!experience) ? { success: false, message: "Partner Experience Not Found", data: {} } : { success: true, message: "Partner Experience Found", data: experience }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Experience Not Found", data: err } 
        });
      },

    getDetail: async (id) => {
        
    return await PartnerExperience.findOne({ 
            where: {
                id: id
            }, 
            attributes: ["id",
                        "position",
                        "period_from",
                        "period_to",
                        "company_name",
                        "description",
                        "image_url"
            ], 
        })
        .then((data) => {
          return (!data) ? { success: false, message: "Experience Not Found", data: {} } : { success: true, message: "Experience Found", data: data }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Experience Not Found", data: err } 
        });
    },

    findOrCreateExperience: async (params, data) => {
      try {
        const { partner_id, position, description, period_from, period_to, company_name, image_url } = data;

        var objData = {
          position: position,
          partner_id: partner_id,
          period_from: period_from,
          period_to: period_to,
          company_name: company_name,
          description: description,
          image_url: image_url
        };
        
        const experience = await PartnerExperience.findOrCreate({ where: params, defaults: objData })
  
        if (!experience[1]) {
          throw ({ success: false, message: "Partner experience already exists", data: {} })
        }
        
        return { success: true, message: "Partner Experience Successfully Created", data: experience[0].dataValues }
      } catch (error) {
        throw (error)
      }
    },

    updateExperience: async (data) => {
      try {
        const { position, period_from, period_to, company_name, description, image_url, id } = data

        var objData = {
          position: position,
          period_from: period_from,
          period_to: period_to,
          company_name: company_name,
          description: description,
          image_url: image_url
        };
        
        return PartnerExperience.update(objData, { where: { id:id }})
        .then(async (updated) => { 
            const result = await PartnerExperience.findOne({ where: { id: id } })
            
            return { success: true, message: "Partner Experience Successfully Updated", data: result } })
        .catch((err) => { return { success: false, message: "Update Partner Experience Failed", data: err } });
      } catch (error) {
        throw (error)
      }
    },
}
  