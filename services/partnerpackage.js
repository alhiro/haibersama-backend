const PartnerPackageHeader = require("../models/partnerPackageHeader");
const PartnerPackageDetail = require("../models/partnerPackageDetail");
const SubService = require("../models/subservice");

module.exports = {
  getAll: async () => {
    try {
      return await PartnerPackageHeader.findAll({
        where: {
          // active : true
        },
        //   attributes: ['id',
        //               'name',
        //               'description'
        //   ],
        order: [["created_at", "ASC"]],
        // include: [
        //   {
        //     model: PartnerPackageDetail,
        //     // include: [
        //     //   {
        //     //     model: SubService
        //     //   }
        //     // ]
        //   }
        // ]
      });
    } catch (error) {
      throw error;
    }
  },

  findOrCreatePackage: async req => {
    try {
      console.log(req.body, "request create package");
      const name = req.body.Name;
      console.log("name :", name);
      const partnerId = req.body.PartnerId;
      const CategoryId = req.body.CategoryId;
      const ServiceId = req.body.ServiceId;
      const TotalPrice = req.body.Price;
      const Duration = req.body.Duration;
      const Description = req.body.Description;
      const Additional = req.body.Additional;
      const Terms = req.body.Terms;

      // var arrDetails = [];

      // for (let i = 0; i < req.body.PackageDetails.length; i++) {
      //   var objDetail = {
      //     // subservice_id: req.body.PackageDetails[i].SubServiceId,
      //     sub_service_title: req.body.PackageDetails[i].SubServiceTitle,
      //     price: req.body.PackageDetails[i].Price,
      //     description: req.body.PackageDetails[i].Description,
      //     duration: req.body.PackageDetails[i].Duration,
      //     additional_services: req.body.PackageDetails[i].Additional,
      //     terms: req.body.PackageDetails[i].Terms
      //   };
      //   TotalPrice += req.body.PackageDetails[i].Price;
      //   Duration += req.body.PackageDetails[i].Duration;
      //   arrDetails.push(objDetail);
      // }

      var objPackage = {
        name: name,
        partner_id: partnerId,
        category_id: CategoryId,
        service_id: ServiceId,
        totalprice: TotalPrice,        
        duration: Duration,
        description: Description,
        additional_services: Additional,
        terms: Terms,
        //partner_package_details: arrDetails
      };

      console.log(objPackage, "objPackage");

      const insertPackage = await PartnerPackageHeader.findOrCreate({
        where: { 
          name: name, 
          partner_id: partnerId,
          category_id: CategoryId,
          service_id: ServiceId
        },
        // include: [
        //   {
        //     model: PartnerPackageDetail,
        //     //transaction
        //   }
        // ],
        defaults: objPackage,
        //transaction
      });

      console.log(insertPackage[1]);
      if (insertPackage[1]){
        return {
          success: true,
          message: "Paket Jasa/Produk Berhasil Dibuat",
          data: insertPackage[0].dataValues
        }
      }
      else{
        return {
          success: false,
          message: "Paket Jasa/Produk Gagal Dibuat",
          data: {}
        }
      }
    } catch (error) {
      console.log(error);
      //await transaction.rollback();
      throw error;
    }
  },
  
  getList: async (params) => {
    try {
      return await PartnerPackageHeader.findAll({
        where: params,
        order: [["created_at", "ASC"]],
        include: [
          {
            model: PartnerPackageDetail,
            // include: [
            //   {
            //     model: SubService
            //   }
            // ]
          }
        ]
      });
    } catch (error) {
      throw error;
    }
  },
  
  updatePackage: async req => {
    try {
      const Id = req.body.Id;
      const name = req.body.Name;
      const partnerId = req.body.PartnerId;
      const CategoryId = req.body.CategoryId;
      const ServiceId = req.body.ServiceId;
      const TotalPrice = req.body.Price;
      const Duration = req.body.Duration;
      const Description = req.body.Description;
      const Additional = req.body.Additional;
      const Terms = req.body.Terms;

      // var arrDetails = [];

      // for (let i = 0; i < req.body.PackageDetails.length; i++) {
      //   var objDetail = {
      //     id: req.body.PackageDetails[i].Id,
      //     package_header_id: req.body.PackageDetails[i].PackageHeaderId,
      //     // subservice_id: req.body.PackageDetails[i].SubServiceId,
      //     sub_service_title: req.body.PackageDetails[i].SubServiceTitle,
      //     price: req.body.PackageDetails[i].Price,
      //     description: req.body.PackageDetails[i].Description,
      //     duration: req.body.PackageDetails[i].Duration,
      //     additional_services: req.body.PackageDetails[i].Additional,
      //     terms: req.body.PackageDetails[i].Terms
      //   };
      //   TotalPrice += parseInt(req.body.PackageDetails[i].Price);
      //   Duration += req.body.PackageDetails[i].Duration;
      //   arrDetails.push(objDetail);
      // }

      var objPackage = {
        id: Id,
        name: name,
        partner_id: partnerId,
        category_id: CategoryId,
        service_id: ServiceId,
        totalprice: TotalPrice,        
        duration: Duration,
        description: Description,
        additional_services: Additional,
        terms: Terms,
        //partner_package_details: arrDetails
      };

      console.log(objPackage, "objPackage");
      
      return PartnerPackageHeader.update(objPackage, { where: { id: Id }})
      .then(async (updated) => {   
          const package = await PartnerPackageHeader.findOne({
            where: { id: Id }, 
            // include: [
            //   {
            //     model: PartnerPackageDetail,
            //     // include: [
            //     //   {
            //     //     model: SubService
            //     //   }
            //     // ]
            //   }
            // ], 
          });

          return { success: true, message: "Paket Jasa/Produk Berhasil Diubah", data: package } })
      .catch((err) => { return { success: false, message: "Paket Jasa/Produk Gagal Diubah", data: err } });

    } catch (error) {
      console.log(error);
      //await transaction.rollback();
      throw error;
    }
  },

  createPackageDetail: async req => {
    try {
      const Id = req.body.Id;
      
      var arrDetails = [];

      for (let i = 0; i < req.body.PackageDetails.length; i++) {
        var objDetail = {
          package_header_id: req.body.PackageDetails[i].PackageHeaderId,
          // subservice_id: req.body.PackageDetails[i].SubServiceId,
          sub_service_title: req.body.PackageDetails[i].SubServiceTitle,
          price: req.body.PackageDetails[i].Price,
          description: req.body.PackageDetails[i].Description,
          duration: req.body.PackageDetails[i].Duration,
          additional_services: req.body.PackageDetails[i].Additional,
          terms: req.body.PackageDetails[i].Terms,
          reservation_no: req.body.PackageDetails[i].ReservationNo
        };
        // TotalPrice += parseInt(req.body.PackageDetails[i].Price);
        // Duration += req.body.PackageDetails[i].Duration;
        arrDetails.push(objDetail);
      }
      console.log(arrDetails, "arrDetails");
      
      for (let i = 0; i < arrDetails.length; i++) {
        var objDetail = arrDetails[i];
        var res = await PartnerPackageDetail.create(objDetail,{ 
          where: { reservation_no: objDetail.reservation_no }
        });
      }

      var packageDetail = await PartnerPackageDetail.findOne({
        where: { package_header_id: arrDetails[0].package_header_id }, 
        // include: [
        //   {
        //     model: PartnerPackageDetail
        //   }
        // ], 
      });

      return { success: true, message: "Paket Detail Jasa/Produk Berhasil Ditambah", data: packageDetail };

    } catch (error) {
      console.log(error);
      //await transaction.rollback();
      throw error;
    }
  },

  updatePackageDetail: async req => {
    try {
      const Id = req.body.Id;
      const name = req.body.Name;
      const partnerId = req.body.PartnerId;
      const CategoryId = req.body.CategoryId;
      const ServiceId = req.body.ServiceId;
      const TotalPrice = req.body.Price;
      const Duration = req.body.Duration;
      const Description = req.body.Description;
      const Additional = req.body.Additional;
      const Terms = req.body.Terms;

      var arrDetails = [];

      for (let i = 0; i < req.body.PackageDetails.length; i++) {
        var objDetail = {
          id: req.body.PackageDetails[i].Id,
          package_header_id: req.body.PackageDetails[i].PackageHeaderId,
          // subservice_id: req.body.PackageDetails[i].SubServiceId,
          sub_service_title: req.body.PackageDetails[i].SubServiceTitle,
          price: req.body.PackageDetails[i].Price,
          description: req.body.PackageDetails[i].Description,
          duration: req.body.PackageDetails[i].Duration,
          additional_services: req.body.PackageDetails[i].Additional,
          terms: req.body.PackageDetails[i].Terms
        };
        // TotalPrice += parseInt(req.body.PackageDetails[i].Price);
        // Duration += req.body.PackageDetails[i].Duration;
        arrDetails.push(objDetail);
      }

      var objPackage = {
        id: Id,
        name: name,
        partner_id: partnerId,
        category_id: CategoryId,
        service_id: ServiceId,
        totalprice: TotalPrice,        
        duration: Duration,
        description: Description,
        additional_services: Additional,
        terms: Terms,
        partner_package_details: arrDetails
      };

      console.log(objPackage, "objPackage");
      
      return PartnerPackageHeader.update(objPackage, { where: { id: Id }})
      .then(async (updated) => {           
          for (let i = 0; i < arrDetails.length; i++) {
            var objDetail = arrDetails[i];
            var res = await PartnerPackageDetail.create(objDetail,{ 
              where: { package_header_id: objDetail.package_header_id }
            });
          }

          var package = await PartnerPackageHeader.findOne({
            where: { id: Id }, 
            include: [
              {
                model: PartnerPackageDetail
              }
            ], 
          });

          return { success: true, message: "Paket Detail Jasa/Produk Berhasil Ditambah", data: package } })
      .catch((err) => { return { success: false, message: "Paket Detail Jasa/Produk Gagal Ditambah", data: err } });

    } catch (error) {
      console.log(error);
      //await transaction.rollback();
      throw error;
    }
  },

  getPackage: async (id) => {
    return await PartnerPackageHeader.findOne({ 
        where: {
            id: id
        }, 
        include: [
          {
            model: PartnerPackageDetail,
            // include: [
            //   {
            //     model: SubService
            //   }
            // ]
          }
        ], 
    })
    .then((data) => {
      return (!data) ? { success: false, message: "Paket Jasa/Produk Belum Ada!", data: {} } : { success: true, message: "Package Found", data: data }
    })
    .catch((err) => { 
      console.log(err);
      return { success: false, message: "Paket Jasa/Produk Belum Ada!, Ada Kesalahan Server", data: err } 
    });
  },

  destroyPackage: async (id) => {
    return await PartnerPackageHeader.destroy({
      where: {
        id: id
      }
    })
      .then((data) => {
        return (!data) ? { success: false, message: "Paket Jasa/Produk Tidak Ditemukan", data: {} } : { success: true, message: "Package Found", data: {} }
      })
      .catch((err) => {
        console.log(err);
        return { success: false, message: "Paket Jasa/Produk Tidak Ditemukan, Ada Kesalahan Server", data: err }
      });
  },

  destroyPackageDetail: async (id) => {
    var packageDetail = await PartnerPackageDetail.findOne({
      where: { id: id }
    });
    
    return await PartnerPackageDetail.destroy({
      where: {
        id: id
      }
    })
      .then(async (data) => {
        return (!data) ? { success: false, message: "Paket Detail Jasa/Produk Tidak Ditemukan", data: {} } : { success: true, message: "Package Found", data: packageDetail }
      })
      .catch((err) => {
        console.log(err);
        return { success: false, message: "Paket Detail Jasa/Produk Tidak Ditemukan, Ada Kesalahan Server", data: err }
      });
  },  
};
