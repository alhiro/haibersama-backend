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
        include: [
          {
            model: PartnerPackageDetail,
            include: [
              {
                model: SubService
              }
            ]
          }
        ]
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
      var TotalPrice = 0;
      // const Description = req.body.Description;
      var Duration = 0;
      // const Additional = req.body.Additional;
      // const terms = req.body.terms;

      var arrDetails = [];

      for (let i = 0; i < req.body.PackageDetails.length; i++) {
        var objDetail = {
          subservice_id: req.body.PackageDetails[i].SubServiceId,
          price: req.body.PackageDetails[i].Price,
          description: req.body.PackageDetails[i].Description,
          duration: req.body.PackageDetails[i].Duration,
          additional_services: req.body.PackageDetails[i].Additional,
          terms: req.body.PackageDetails[i].Terms
        };
        TotalPrice += req.body.PackageDetails[i].Price;
        Duration += req.body.PackageDetails[i].Duration;
        arrDetails.push(objDetail);
      }

      var objPackage = {
        name: name,
        partner_id: partnerId,
        category_id: CategoryId,
        service_id: ServiceId,
        totalprice: TotalPrice,
        // description: Description,
        duration: Duration,
        // additional_services: Additional,
        // terms: terms,
        partner_package_details: arrDetails
      };

      console.log(objPackage, "objPackage");

      const insertPackage = await PartnerPackageHeader.findOrCreate({
        where: { name: name, 
        partner_id: partnerId,
        category_id: CategoryId,
        service_id: ServiceId
        },
        include: [
          {
            model: PartnerPackageDetail,
            //transaction
          }
        ],
        defaults: objPackage,
        //transaction
      });

      console.log(insertPackage[1]);
      if (insertPackage[1]){
        return {
          success: true,
          message: "Insert Package Successful",
          data: insertPackage[0].dataValues
        }
      }
      else{
        return {
          success: false,
          message: "Insert Package Failed",
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
            include: [
              {
                model: SubService
              }
            ]
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
      var TotalPrice = 0;
      // const Description = req.body.Description;
      var Duration = 0;
      // const Additional = req.body.Additional;
      // const terms = req.body.terms;

      var arrDetails = [];

      for (let i = 0; i < req.body.PackageDetails.length; i++) {
        var objDetail = {
          id: req.body.PackageDetails[i].Id,
          package_header_id: req.body.PackageDetails[i].PackageHeaderId,
          subservice_id: req.body.PackageDetails[i].SubServiceId,
          price: req.body.PackageDetails[i].Price,
          description: req.body.PackageDetails[i].Description,
          duration: req.body.PackageDetails[i].Duration,
          additional_services: req.body.PackageDetails[i].Additional,
          terms: req.body.PackageDetails[i].Terms
        };
        TotalPrice += parseInt(req.body.PackageDetails[i].Price);
        Duration += req.body.PackageDetails[i].Duration;
        arrDetails.push(objDetail);
      }

      var objPackage = {
        id: Id,
        name: name,
        partner_id: partnerId,
        category_id: CategoryId,
        service_id: ServiceId,
        totalprice: TotalPrice,
        // description: Description,
        duration: Duration//,
        // additional_services: Additional,
        // terms: terms
      };

      console.log(objPackage, "objPackage");
      
      return PartnerPackageHeader.update(objPackage, { where: { id:Id }})
      .then(async (updated) => {           
          for (let i = 0; i < arrDetails.length; i++) {
            var objDetail = arrDetails[i];
            var res = PartnerPackageDetail.update(objDetail, { where: { id: objDetail.id }});
          }

          var package = await PartnerPackageHeader.findOne({
            where: { id: Id }, 
            include: [
              {
                model: PartnerPackageDetail,
                include: [
                  {
                    model: SubService
                  }
                ]
              }
            ], 
          });

          return { success: true, message: "Package Successfully Updated", data: package } })
      .catch((err) => { return { success: false, message: "Update Package Failed", data: err } });

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
            include: [
              {
                model: SubService
              }
            ]
          }
        ], 
    })
    .then((data) => {
      return (!data) ? { success: false, message: "Package Not Found", data: {} } : { success: true, message: "Package Found", data: data }
    })
    .catch((err) => { 
      console.log(err);
      return { success: false, message: "Package Not Found", data: err } 
    });
 },
};
