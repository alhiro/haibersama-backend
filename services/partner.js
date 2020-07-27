const Partner = require('../models/haiuser');
const PartnerCertificate = require('../models/partnercertificate');
const PartnerAwards = require('../models/partnerawards');
const PartnerExperience = require('../models/partnerexperience');
const PartnerPortfolio = require('../models/partnerportfolio');

const PartnerAwardsService = require('../services/partnerawards');
const PartnerExperienceService = require('../services/partnerexperience');
const PartnerPortfolioService = require('../services/partnerportfolio');

Partner.hasMany(PartnerCertificate, {as: 'Certificates'})
Partner.hasMany(PartnerExperience, {as: 'Experiences'})
Partner.hasMany(PartnerAwards, {as: 'Awards'})
Partner.hasMany(PartnerPortfolio, {as: 'Portfolios'})

const sequelize = require("../config/sequelize");
const { count } = require('sequelize/lib/model');

module.exports =
  {  
    getSearchPartner: async (param) => {
      try {
          const { start, pageSize, orderBy, categoryID, latitude, longitude, address, serviceID, availableDate, rating, minPrice, maxPrice} = param;

          // var query = "CALL someprocedure(:userId,:status)";
          var query = "select * from sp_partner_search_get_list_paging(:p_start,:p_page_size,:p_order_by,:p_category_id,:p_latitude,:p_longitude,:p_address,:p_service_id,:p_available_date,:p_rating,:p_min_price,:p_max_price)";
          return sequelize.query(query,{ replacements : { 
              p_start: start,
              p_page_size: pageSize,
              p_order_by: orderBy,
              p_category_id: categoryID,
              p_latitude: latitude,
              p_longitude: longitude,
              p_address: address,
              p_service_id: serviceID,
              p_available_date: availableDate,
              p_rating: rating,
              p_min_price: minPrice,
              p_max_price: maxPrice
            }, type : sequelize.QueryTypes.SELECT}).then(results => {
              return results;
          });

      } catch (error) {
        console.log(error);
        throw error
      }
    },

    getPartner: async (partnerID) => {
        try {
          return await Partner.findOne({
            where: {
                id: partnerID
            }
          });
        } catch (error) {
          throw error
        }
      },

    getDetail: async (partnerID) => {
        try{
          return sequelize.query(
            `SELECT
                part.id partnerid, 
                part.name partnername,
                part.address, 
                part.nation, 
                coalesce(rating, 0) rating,
                coalesce(follower, 0) follower,
                coalesce(successjob, 0) successjob
                FROM hai_user part
                left join lateral (
                  select avg(rating) rating
                  from partner_rating prr
                  where prr.partner_id = part.id
                ) pr on true
                left join lateral (
                  select count(user_id) follower
                  from partner_rating pff
                  where pff.partner_id = part.id
                ) pf on true
                left join lateral (
                  select count(reservation_no) successjob
                  from reservation rvv
                  where rvv.partner_id = part.id
                  and rvv.status_code = '102109'
                ) rv on true
              WHERE part.type = 2
              and part.id = `+partnerID+`;`,
            {
                raw: true,
                type: sequelize.QueryTypes.SELECT
            }
        ).then(partners => {
          console.log(!partners);
          console.log(partners);
          console.log(partners.length);
          if(partners.length > 0){
            console.log("kesini");
            var params = { partner_id: partnerID };
            var partner = partners[0];
            console.log(partner);

            var awardsData = PartnerAwardsService.getList(params);
            var awards = awardsData.success ? awardsData.data : [];
            
            var portfolioData = PartnerPortfolioService.getList(params);
            var portfolios = portfolioData.success ? portfolioData.data : [];

            var experienceData = PartnerExperienceService.getList(params);
            var experiences = experienceData.success ? experienceData.data : [];

            partner.awards = awards;
            partner.portfolios = portfolios;
            partner.experiences = experiences;

            console.log(partner);

            return { success: true, data: partner }
          }else{
            return { success: false, message: "Partner Info Not Found", data: {} };
          }
        });
            // return await Partner.findOne({ 
            //         where: {
            //             id: partnerID
            //         }, 
            //         attributes: ["id",
            //                     "name",
            //                     "title",
            //                     "description",
            //                     "phone_no",
            //                     "email",
            //                     "address",
            //                     "nation",
            //                     "longitude",
            //                     "latitude",
            //                     "profile_image"
            //         ],
            //         include: [{
            //             model: PartnerAwards,
            //             as: 'Awards',
            //             attributes: ['id',
            //                         'name',
            //                         'organizer',
            //                         'awards_date',
            //                         'description',
            //                         'location',
            //                         'occupation',
            //                         'image_url'],
            //             where: { partner_id: partnerID },
            //             paranoid: false // query and loads the soft deleted records
            //         },
            //         {
            //             model: PartnerCertificate,
            //             as: 'Certificates',
            //             attributes: ['id',
            //                         'name',
            //                         'organizer',
            //                         'certificate_date',
            //                         'description',
            //                         'location',
            //                         'image_url'],
            //             where: { partner_id: partnerID },
            //             paranoid: false // query and loads the soft deleted records
            //         },
            //         {
            //             model: PartnerExperience,
            //             as: 'Experiences',
            //             attributes: ['id',
            //                         'name',
            //                         'company_name',
            //                         'period_from',
            //                         'period_to',
            //                         'description',
            //                         'location',
            //                         'image_url'],
            //             where: { partner_id: partnerID },
            //             paranoid: false // query and loads the soft deleted records
            //         },
            //         {
            //             model: PartnerPortfolio,
            //             as: 'Portfolios',
            //             attributes: ['id',
            //                         'name',
            //                         'portfolio_type',
            //                         'portfolio_date',
            //                         'description',
            //                         'location',
            //                         'image_url'],
            //             where: { partner_id: partnerID },
            //             paranoid: false // query and loads the soft deleted records
            //         }] 
            //     });
        } catch (error) {
        throw error
        }
    },
}
  
