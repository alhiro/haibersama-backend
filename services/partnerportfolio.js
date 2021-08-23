const Portfolio = require('../models/partnerportfolio');

module.exports =
  {  
    getList: async (params) => {        
      return await Portfolio.findAll({ 
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
          return (!portfolio) ? { success: false, message: "Partner Portfolio Belum Ada!", data: {} } : { success: true, message: "Partner Portfolio Found", data: portfolio }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Portfolio Belum Ada, Ada Kesalahan Server!", data: err } 
        });
      },

    getDetail: async (id) => {
        return await Portfolio.findOne({ 
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
            return (!data) ? { success: false, message: "Partner Portfolio Tidak Ditemukan!", data: {} } : { success: true, message: "Portfolio Found", data: data }
          })
          .catch((err) => { 
            console.log(err);
            return { success: false, message: "Partner Portfolio Tidak Ditemukan, Ada Kesalahan Server!", data: err } 
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
        
        const portfolio = await Portfolio.findOrCreate({ where: params, defaults: objData })
  
        // check name already registered or not
        if (!portfolio[1]) {
          throw ({ success: false, message: "Partner Portfolio Sudah Ada", data: {} })
        }
        
        return { success: true, message: "Partner Portfolio Berhasil Dibuat", data: portfolio[0].dataValues }
      } catch (error) {
        console.log(error)
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
          description: description
        };       

        if(image_url){
          objData.image_url = image_url;
        } 

        return Portfolio.update(objData, { where: { id:id }})
        .then(async (updated) => { 
            const result = await Portfolio.findOne({ where: { id: id } })
            
            return { success: true, message: "Partner Portfolio Berhasil Diubah", data: result.dataValues } })
        .catch((err) => { return { success: false, message: "Partner Portfolio Gagal Diubah", data: err } });
      } catch (error) {
        console.log(error)
        throw (error)
      }
    },

    deletePortfolio: async (data) => {
      try {
        const { partner_id, id } = data;

        return Portfolio.destroy({
          where: {
            id: id,
            partner_id: partner_id
          },
        })
          .then(async (deleted) => {
            return { success: true, message: "Partner Portfolio Berhasil Dihapus", data: [] }
          })
          .catch((err) => {
            console.log(err);
            return { success: false, message: "Partner Portfolio Gagal Dihapus", data: err }
          });
      } catch (error) {
        console.log(error);
        throw (error)
      }
    },
}
  