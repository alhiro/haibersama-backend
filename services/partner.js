const Partner = require('../models/haiuser');
const Province = require('../models/province');
const City = require('../models/city');

// const PartnerAwardsService = require('../services/partnerawards');
// const PartnerExperienceService = require('../services/partnerexperience');
// const PartnerPortfolioService = require('../services/partnerportfolio');
// const PartnerCertificateService = require('../services/partnercertificate');

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

    getProvinces: async () => {
      try {
        return await Province.findAll({
          attributes: [
            'id',
            'name'
          ],
          include: [
            {
              model: City
            }
          ]
        });
      } catch (error) {
        throw error
      }
    },

    getCity: async () => {
      try {
        return await City.findAll({
          attributes: [
            'id',
            'name',
            'province_id',
          ],
          include: [
            {
              model: Province
            }
          ]
        });
      } catch (error) {
        throw error
      }
    },

    getDetail: async (partnerID) => {
        try{
          var partners = await sequelize.query(
            `SELECT
                part.id partnerid, 
                part.name partnername,
                part.description,
                part.address, 
                part.nation, 
                part.picture,
                part.is_verified,
                part.title,
                part.dob,
                part.province,
                coalesce(rating, 0) rating,
                coalesce(reviewcount, 0) reviewcount,
                coalesce(follower, 0) follower,
                coalesce(successjob, 0) successjob,
                coalesce(pbb.current_balance, 0) currentbalance,
                coalesce(pt.tier_name, 'Perintis') tiername
                FROM hai_user part
                left join lateral (
                  select avg(rating) rating, count(prr.user_id) reviewcount
                  from partner_rating prr
                  where prr.partner_id = part.id
                ) pr on true
                left join lateral (
                  select count(user_id) follower
                  from partner_follower pff
                  where pff.partner_id = part.id
                ) pf on true
                left join lateral (
                  select count(reservation_no) successjob
                  from reservation rvv
                  where rvv.partner_id = part.id
                  and rvv.transaction_status_code = 'SUCCESS'
                ) rv on true
                left join lateral (
                  select current_balance
                  from partner_wallet_balance pb
                  where pb.partner_id = part.id
                ) pbb on true
                left join lateral (
                  select tier_name
                  from tier_history ppt
                  where ppt.user_id = part.id
                  AND date(start_date) <= date(now()) 
                  AND date(end_date) >= date(now()) 
                ) pt on true
              WHERE part.type = 2
              and part.id = `+partnerID+`;`,
            {
                raw: true,
                type: sequelize.QueryTypes.SELECT
            }
        );

        if(partners.length > 0){
            var params = { partner_id: partnerID };
            var partner = partners[0];
            console.log(partner);

            // var awardsData = await PartnerAwardsService.getList(params);
            // var awards = awardsData.success ? awardsData.data : [];
            
            // var portfolioData = await PartnerPortfolioService.getList(params);
            // var portfolios = portfolioData.success ? portfolioData.data : [];

            // var experienceData = await PartnerExperienceService.getList(params);
            // var experiences = experienceData.success ? experienceData.data : [];
            
            // var certificateData = await PartnerCertificateService.getList(params);
            // var certificates = certificateData.success ? certificateData.data : [];

            // partner.awards = awards;
            // partner.portfolios = portfolios;
            // partner.experiences = experiences;
            // partner.certificates = certificates;         
  
            return { success: true, data: partner }
          
        } else {
          return { success: false, message: "Partner Info Not Found", data: {} };
        }
        } catch (error) {
          console.log(error);
        throw error
        }
    },
}

// /*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/
// /*::                                                                         :*/
// /*::  This routine calculates the distance between two points (given the     :*/
// /*::  latitude/longitude of those points). It is being used to calculate     :*/
// /*::  the distance between two locations using GeoDataSource(TM) Products    :*/
// /*::                                                                         :*/
// /*::  Definitions:                                                           :*/
// /*::    South latitudes are negative, east longitudes are positive           :*/
// /*::                                                                         :*/
// /*::  Passed to function:                                                    :*/
// /*::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :*/
// /*::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :*/
// /*::    unit = the unit you desire for results                               :*/
// /*::           where: 'M' is statute miles (default)                         :*/
// /*::                  'K' is kilometers                                      :*/
// /*::                  'N' is nautical miles                                  :*/
// /*::  Worldwide cities and other features databases with latitude longitude  :*/
// /*::  are available at https://www.geodatasource.com                         :*/
// /*::                                                                         :*/
// /*::  For enquiries, please contact sales@geodatasource.com                  :*/
// /*::                                                                         :*/
// /*::  Official Web site: https://www.geodatasource.com                       :*/
// /*::                                                                         :*/
// /*::  Thanks to Kirill Bekus for contributing the source code.               :*/
// /*::                                                                         :*/
// /*::         GeoDataSource.com (C) All Rights Reserved 2019                  :*/
// /*::                                                                         :*/
// /*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/

// CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float, units varchar)
// RETURNS float AS $dist$
//     DECLARE
//         dist float = 0;
//         radlat1 float;
//         radlat2 float;
//         theta float;
//         radtheta float;
//     BEGIN
//         IF lat1 = lat2 OR lon1 = lon2
//             THEN RETURN dist;
//         ELSE
//             radlat1 = pi() * lat1 / 180;
//             radlat2 = pi() * lat2 / 180;
//             theta = lon1 - lon2;
//             radtheta = pi() * theta / 180;
//             dist = sin(radlat1) * sin(radlat2) + cos(radlat1) * cos(radlat2) * cos(radtheta);

//             IF dist > 1 THEN dist = 1; END IF;

//             dist = acos(dist);
//             dist = dist * 180 / pi();
//             dist = dist * 60 * 1.1515;

//             IF units = 'K' THEN dist = dist * 1.609344; END IF;
//             IF units = 'N' THEN dist = dist * 0.8684; END IF;

//             RETURN dist;
//         END IF;
//     END;
// $dist$ LANGUAGE plpgsql;



// -- FUNCTION: public.sp_partner_search_get_list_paging(integer, integer, text, text)

// -- DROP FUNCTION sp_partner_search_get_list_paging(integer,integer,text,integer,double precision,double precision,text,integer,timestamp without time zone,integer,integer,integer);

// -- select * from sp_partner_search_get_list_paging(0,10,'partnername',null,null,null,null,null,null,null,null,null);

// CREATE OR REPLACE FUNCTION public.sp_partner_search_get_list_paging(
// 	p_start integer,
// 	p_page_size integer,
// 	p_order_by text,
//     p_category_id integer,
//     p_latitude double precision,
//     p_longitude double precision,
//     p_address text,
//     p_service_id integer,
//     p_available_date timestamp without time zone,
//     p_rating integer,
//     p_min_price integer,
//     p_max_price integer)
//     RETURNS TABLE(rowno integer, partnerid integer, partnername character varying, nation character varying, address character varying, picture character varying, rating integer, follower integer, successjob integer, totalrow integer) 
//     LANGUAGE 'plpgsql'

//     COST 100
//     VOLATILE 
//     ROWS 1000
// AS $BODY$  DECLARE p_total integer;
// BEGIN
// 	p_total = (select count(distinct p.id)
// 					from hai_user p
// 					inner join partner_package_header pc on pc.partner_id = p.id
// 					left join lateral (
// 					  select avg(prr.rating) rating
// 					  from partner_rating prr
// 					  where prr.partner_id = p.id
// 					) pr on true
// 					left join lateral (
// 						select 
// 							count(user_id) follower 
// 						from  partner_follower r
// 						where r.partner_id = p.id 
// 					) ff on true 
// 					left join lateral (select 
// 						distinct date(event_date) event_date
// 					  from reservation rr
// 					  where rr.partner_id = p.id 
// 					  and rr.transaction_status_code in ('ON_PROCESS')
// 					) rv on true
// 					left join lateral (
// 					  select count(reservation_no) successjob
// 					  from reservation rvv
// 					  where rvv.partner_id = p.id
// 					  and rvv.transaction_status_code = 'SUCCESS'
// 					) sj on true
// 					where p.type = 2
// 					and (p_category_id is null or pc.category_id = p_category_id)
// 					and (p_service_id is null or pc.service_id = p_service_id)
// 					and ((p_latitude is null and p_longitude is null) or calculate_distance(p_latitude, p_longitude, p.latitude, p.longitude, 'K') <= 2)
// 					and (p_address is null or p.address ilike '%' || p_address || '%')
// 					and (p_rating is null or pr.rating = p_rating)
// 					and (p_min_price is null or pc.totalprice >= p_min_price)
// 					and (p_max_price is null or pc.totalprice <= p_max_price)
// 					and (p_available_date is null or rv.event_date != p_available_date)
// 	 );

// 	RETURN QUERY EXECUTE 'SELECT A.rowno::integer,
// 			A.partnerid,
// 			A.partnername,
// 			A.nation,
// 			A.address,
// 			A.picture,
// 			A.rating::integer,
// 			A.follower::integer,
// 			A.successjob::integer,
// 			$3 totalrow FROM (		
// 				SELECT
// 				ROW_NUMBER () OVER (ORDER BY d.' || p_order_by || ') rowno,
// 				* FROM 
// 				(
// 					select distinct
// 						p.id partnerid,
// 						p.name partnername,
// 						p.nation,
// 						p.address,
// 						p.picture,
// 						coalesce(rating, 0) rating,
// 						coalesce(follower, 0) follower,
// 						coalesce(successjob, 0) successjob
// 					from hai_user p
// 					inner join partner_package_header pc on pc.partner_id = p.id
// 					left join lateral (
// 					  select avg(prr.rating) rating
// 					  from partner_rating prr
// 					  where prr.partner_id = p.id
// 					) pr on true
// 					left join lateral (
// 						select 
// 							count(user_id) follower 
// 						from  partner_follower r
// 						where r.partner_id = p.id 
// 					) ff on true 
// 					left join lateral (select 
// 						distinct date(event_date) event_date
// 					  from reservation rr
// 					  where rr.partner_id = p.id 
// 					  and rr.transaction_status_code in (''ON_PROCESS'')
// 					) rv on true
// 					left join lateral (
// 					  select count(reservation_no) successjob
// 					  from reservation rvv
// 					  where rvv.partner_id = p.id
// 					  and rvv.transaction_status_code = ''SUCCESS''
// 					) sj on true
// 					where p.type = 2
// 					and ($4 is null or pc.category_id = $4)
// 					and ($5 is null or pc.service_id = $5)
// 					and (($6 is null and $7 is null) or calculate_distance($6, $7, p.latitude, p.longitude, ''K'') <= 2)
// 					and ($8 is null or p.address ilike ''%'' || $8 || ''%'')
// 					and ($9 is null or pr.rating = $9)
// 					and ($10 is null or pc.totalprice >= $10)
// 					and ($11 is null or pc.totalprice <= $11)
// 					and ($12 is null or rv.event_date != $12)	
// 				) d 
// 	)A where rowno > $1
// 	LIMIT $2' using p_start, p_page_size, p_total, p_category_id, p_service_id, p_latitude, p_longitude,
// 	p_address, p_rating, p_min_price, p_max_price, p_available_date;

// END;  

// $BODY$;
