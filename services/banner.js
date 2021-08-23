const Banner = require('../models/banner');

module.exports =
  {        
    getAll: async () => {
      try {
        return await Banner.findAll({
            where:{
                active : true
            },
            attributes: ['id',
                        'title',
                        'description',
                        'image_url'
            ],
            order:[
                ["order_no", "ASC"]
            ]
        });
      } catch (error) {
        throw error
      }
    },

    findBanner: async (params) => {
      return await Banner.findOne({ where: params })
        .then((banners) => {
          return (!banners) ? { success: false, message: "Banner Belum Ada!", data: {} } : { success: true, message: "Banner Found", data: banners }
        })
        .catch((err) => { return { success: false, message: "Banner Belum Ada, Ada Kesalahan Server!", data: err } });
    },

    findOrCreateBanner: async (params, req) => {
      try {
        const { title, description, image_url, order_no, active } = req
        var objBanner = {
          title: title,
          description: description,
          image_url: image_url,
          order_no: order_no,
          active: active == 1 ? true : false
        }
        const insertBanner = await Banner.findOrCreate({ where: params, defaults: objBanner })
  
        // check title already registered or not
        if (!insertBanner[1]) {
          throw ({ success: false, message: "Banner Dengan Nama Yang Sama Sudah Ada", data: {} })
        }
        
        return { success: true, message: "Banner Berhasil Dibuat", data: insertBanner[0].dataValues }
      } catch (error) {
        console.log(error);
        throw (error)
      }
    },

    updateBanner: async (params, req) => {
        try {
          const { title, description, id, image_url, active, order_no } = req

          var objBanner = {
            title: title,
            description: description, 
            image_url: image_url,
            order_no: order_no,
            active: active == 1 ? true : false
          }
          console.log(JSON.stringify(objBanner), "objBanner")

          return Banner.update(objBanner,{where: params} )
          .then(async (updated) => { 
              const upService = await Banner.findOne({ where: { id: id } })
              console.log(JSON.stringify(upService), "upService")
              return { success: true, message: "Banner Berhasil Diubah", data: upService } })
          .catch((err) => { return { success: false, message: "Banner Gagal Diubah", data: err } });
        } catch (error) {
          throw (error)
        }
      },
  }
