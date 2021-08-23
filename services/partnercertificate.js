const Certificate = require('../models/partnercertificate');

module.exports =
  {  
    getList: async (params) => {        
      return await Certificate.findAll({ 
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
          return (!certificate) ? { success: false, message: "Partner Sertifikat Belum Ada!", data: {} } : { success: true, message: "Partner Certificate Found", data: certificate }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Sertifikat Belum Ada, Ada Kesalahan Server!", data: err } 
        });
      },

    getDetail: async (id) => {
        return await Certificate.findOne({ 
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
          return (!data) ? { success: false, message: "Partner Sertifikat Tidak Ditemukan!", data: {} } : { success: true, message: "Certificate Found", data: data }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Sertifikat Tidak Ditemukan, Ada Kesalahan Server!", data: err } 
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
        
        const certificate = await Certificate.findOrCreate({ where: params, defaults: objData })
  
        if (!certificate[1]) {
          throw ({ success: false, message: "Partner Sertifikat Sudah Ada", data: {} })
        }
        
        return { success: true, message: "Partner Sertifikat Berhasil Dibuat", data: certificate[0].dataValues }
      } catch (error) {
        console.log(error)
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
          description: description
        };    

        if(image_url){
          objData.image_url = image_url;
        }
        
        return Certificate.update(objData, { where: { id:id }})
        .then(async (updated) => { 
            const result = await Certificate.findOne({ where: { id: id } })
            
            return { success: true, message: "Partner Sertifikat Berhasil Diubah", data: result.dataValues } })
        .catch((err) => { return { success: false, message: "Partner Sertifikat Gagal Diubah", data: err } });
      } catch (error) {
        console.log(error)
        throw (error)
      }
    },

    deleteCertificate: async (data) => {
      try {
        const { partner_id, id } = data;

        return Certificate.destroy({
          where: {
            id: id,
            partner_id: partner_id
          },
        })
          .then(async (deleted) => {
            return { success: true, message: "Partner Sertifikat Berhasil Dihapus", data: [] }
          })
          .catch((err) => {
            console.log(err);
            return { success: false, message: "Partner Sertifikat Gagal Dihapus", data: err }
          });
      } catch (error) {
        console.log(error);
        throw (error)
      }
    },
}
  