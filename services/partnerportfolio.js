const PartnerPortfolio = require('../models/partnerportfolio');

module.exports =
  {  
    getList: async (params) => {        
      return await PartnerPortfolio.findAll({ 
        where: params,
        attributes: ["id",
                    "name",
                    "portfolio_date",
                    "category_id",
                    "description",
                    "image_url"
        ], 
        order: [["portfolio_date", "DESC"]]
       })
        .then((portfolio) => {
          return (!portfolio) ? { success: false, message: "Partner Portfolio Not Found", data: {} } : { success: true, message: "Partner Portfolio Found", data: portfolio }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Portfolio Not Found", data: err } 
        });
      },

    getDetail: async (id) => {
        return await PartnerPortfolio.findOne({ 
              where: {
                  id: id
              }, 
              attributes: ["id",
                          "name",
                          "portfolio_date",
                          "category_id",
                          "description",
                          "image_url"
              ], 
          })
          .then((data) => {
            return (!data) ? { success: false, message: "Portfolio Not Found", data: {} } : { success: true, message: "Portfolio Found", data: data }
          })
          .catch((err) => { 
            console.log(err);
            return { success: false, message: "Portfolio Not Found", data: err } 
          });
    },

    findOrCreatePortfolio: async (params, data) => {
      try {
        const { partner_id, name, description, portfolio_date, category_id, image_url } = data;

        var objData = {
          name: name,
          partner_id: partner_id,
          portfolio_date: portfolio_date,
          category_id: category_id,
          description: description,
          image_url: image_url
        };
        
        const portfolio = await PartnerPortfolio.findOrCreate({ where: params, defaults: objData })
  
        // check name already registered or not
        if (!portfolio[1]) {
          throw ({ success: false, message: "Partner portfolio already exists", data: {} })
        }
        
        return { success: true, message: "Partner Portfolio Successfully Created", data: portfolio[0].dataValues }
      } catch (error) {
        throw (error)
      }
    },

    updatePortfolio: async (data) => {
      try {
        const { name, portfolio_date, category_id, description, image_url, id } = data

        var objData = {
          name: name,
          portfolio_date: portfolio_date,
          category_id: category_id,
          description: description,
          image_url: image_url
        };
        

        return PartnerPortfolio.update(objData, { where: { id:id }})
        .then(async (updated) => { 
            const result = await PartnerPortfolio.findOne({ where: { id: id } })
            
            return { success: true, message: "Partner Portfolio Successfully Updated", data: result } })
        .catch((err) => { return { success: false, message: "Update Partner Portfolio Failed", data: err } });
      } catch (error) {
        throw (error)
      }
    },
}
  