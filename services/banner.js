const Banner = require('../models/banner');

module.exports =
  {        
    getAll: async () => {
      try {
        return await Banner.findAll({
            where:{
                active : true
            },
            // attributes: ['id',
            //             'title',
            //             'description',
            //             'image_url'
            // ],
            order:[
                ["order_no", "ASC"]
            ]
        });
      } catch (error) {
        throw error
      }
    },

    getAllAdmin: async () => {
      try {
        return await Banner.findAll({
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
          return (!banners) ? { success: false, message: "Banner Belum Ada!", data: {} } : { success: true, message: "Banner Ditemukan", data: banners }
        })
        .catch((err) => { return { success: false, message: "Banner Belum Ada, Ada Kesalahan Server!", data: err } });
    },

    findOrCreateBanner: async (params, req) => {
      try {
        const { title, description, image_url, link_url, order_no, active, created_by } = req
        var objBanner = {
          title: title,
          description: description,
          image_url: image_url,
          link_url: link_url,
          order_no: order_no,
          active: active == 1 ? true : false,
          created_by: created_by
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
          const { title, description, id, image_url, link_url, active, order_no, updated_by } = req

          var objBanner = {
            title: title,
            description: description, 
            link_url: link_url,
            order_no: order_no,
            active: active == 'true' || active == 1 ? true : false,
            updated_by: updated_by
          }

          if (image_url){
            objBanner.image_url = image_url;
          }
          
          console.log(JSON.stringify(objBanner), "objBanner")

          return Banner.update(objBanner,{where: params} )
          .then(async (updated) => { 
              const upService = await Banner.findOne({ where: { id: id } })
              return { success: true, message: "Banner Berhasil Diubah", data: upService } })
          .catch((err) => { return { success: false, message: "Banner Gagal Diubah", data: err } });
        } catch (error) {
          throw (error)
        }
      },

      deleteBanner: async (data) => {
        try {
          const { partner_id, id } = data;
  
          return Banner.destroy({
            where: {
              id: id,
            },
          })
            .then(async (deleted) => {
              return { success: true, message: "Banner Berhasil Dihapus", data: [] }
            })
            .catch((err) => {
              console.log(err);
              return { success: false, message: "Banner Gagal Dihapus", data: err }
            });
        } catch (error) {
          console.log(error);
          throw (error)
        }
      },
  }
