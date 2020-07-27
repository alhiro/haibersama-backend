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
      const TotalPrice = req.body.TotalPrice;
      const Description = req.body.Description;
      const Duration = req.body.Duration;
      const Additional = req.body.Additional;
      const terms = req.body.terms;

      var arrDetails = [];

      for (let i = 0; i < req.body.packageDetails.length; i++) {
        var objDetail = {
          subservice_id: req.body.packageDetails[i].SubServiceId,
          price: req.body.packageDetails[i].Price
        };
        arrDetails.push(objDetail);
      }

      var objPackage = {
        name: name,
        partner_id: partnerId,
        category_id: CategoryId,
        service_id: ServiceId,
        totalprice: TotalPrice,
        description: Description,
        duration: Duration,
        additional_services: Additional,
        terms: terms,
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
          message: "Insert Order Successful",
          data: insertPackage[0].dataValues
        }
      }
      else{
        return {
          success: false,
          message: "Insert Order Failed",
          data: {}
        }
      }
    } catch (error) {
      console.log(error);
      //await transaction.rollback();
      throw error;
    }
  }
};
