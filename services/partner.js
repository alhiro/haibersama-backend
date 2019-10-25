const Partner = require('../models/partner');
const PartnerCertificate = require('../models/partnerCertificate');
const PartnerAwards = require('../models/partnerAwards');
const PartnerExperience = require('../models/partnerExperience');
const PartnerPortfolio = require('../models/partnerPortfolio');

Partner.hasMany(PartnerCertificate, {as: 'Certificates'})
Partner.hasMany(PartnerExperience, {as: 'Experiences'})
Partner.hasMany(PartnerAwards, {as: 'Awards'})
Partner.hasMany(PartnerPortfolio, {as: 'Portfolios'})

module.exports =
  {  
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
            return await Partner.findOne({ 
                    where: {
                        id: partnerID
                    }, 
                    attributes: ["id",
                                "name",
                                "title",
                                "description",
                                "phone_no",
                                "email",
                                "address",
                                "nation",
                                "longitude",
                                "latitude",
                                "profile_image"
                    ],
                    include: [{
                        model: PartnerAwards,
                        as: 'Awards',
                        attributes: ['id',
                                    'name',
                                    'issuer_name',
                                    'issuer_date',
                                    'description',
                                    'location',
                                    'occupation',
                                    'image_url'],
                        where: { partner_id: partnerID },
                        paranoid: false // query and loads the soft deleted records
                    },
                    {
                        model: PartnerCertificate,
                        as: 'Certificates',
                        attributes: ['id',
                                    'name',
                                    'issuer_organization',
                                    'issuer_date',
                                    'description',
                                    'location',
                                    'image_url'],
                        where: { partner_id: partnerID },
                        paranoid: false // query and loads the soft deleted records
                    },
                    {
                        model: PartnerExperience,
                        as: 'Experiences',
                        attributes: ['id',
                                    'name',
                                    'company_name',
                                    'period_from',
                                    'period_to',
                                    'description',
                                    'location',
                                    'image_url'],
                        where: { partner_id: partnerID },
                        paranoid: false // query and loads the soft deleted records
                    },
                    {
                        model: PartnerPortfolio,
                        as: 'Portfolios',
                        attributes: ['id',
                                    'name',
                                    'portfolio_type',
                                    'portfolio_date',
                                    'description',
                                    'location',
                                    'image_url'],
                        where: { partner_id: partnerID },
                        paranoid: false // query and loads the soft deleted records
                    }] 
                });
        } catch (error) {
        throw error
        }
    },
}
  