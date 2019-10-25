const Banner = require('../models/banner');
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

module.exports =
  {  
    getBanners: async () => {
        let now = new Date();
        try{
            return await Banner.findAll({ 
                    where: {
                        active: true,
                        start_date: { [Op.lte]: now.toLocaleString().slice(0,10) },
                        end_date: { [Op.gte]: now.toLocaleString().slice(0,10) }
                    }, 
                    attributes: [
                        "id",
                        "title",
                        "description",
                        "image_url"
                    ],
                    order:[
                        ["order_no", "ASC"]
                    ]
                });
        } catch (error) {
        throw error
        }
    },
}
  