const tiersetting = require('../models/tiersetting');
const tierhistory = require('../models/tierhistory');
const pointHistory = require('../models/pointhistory');
const moment = require("moment");
const sequelize = require('../config/sequelize');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const appSetting = require('../models/applicationsetting');

module.exports =
  {  
    setPoint: async (data) => {
      try {
        const { user_id, reservation_no, reservation_date, total_price } = data;
        console.log(user_id);
        console.log(reservation_no);
        console.log(reservation_date);
        console.log(total_price);

        const convertSetting = await appSetting.findOne({
          where: { setting_name: "POINT_CONVERTION" }
        });

        let point = Math.ceil(total_price / parseInt(convertSetting.setting_value));

        var params = {
          user_id: user_id,
          reservation_no: reservation_no
        }

        var objHist = {
          user_id: user_id,
          reservation_no: reservation_no,
          point: point,
          reservation_date: reservation_date,
        }

        const hist = await pointHistory.findOrCreate({ where: params, defaults: objHist });
        
        // const totalPoint = pointHistory.sum('point', { where: { user_id: user_id } });

        // var totalPoint = pointHistory.findOne({
        //   where: { user_id: user_id },
        //   attributes: [[sequelize.fn('sum', sequelize.col('point')), 'point']],
        //   raw: true,
        // });

        var totalPoint = await sequelize.query(`SELECT coalesce(sum(point), 0) AS point FROM point_history AS point_history WHERE point_history.user_id = ` + user_id,
          {
              raw: true,
              type: sequelize.QueryTypes.SELECT
          });

        var paramTier = {
          user_id: user_id,
          start_date:  { [Op.gte]:moment().utcOffset(0).format("YYYY-MM-DD")},
          end_date:  { [Op.lte]:moment().utcOffset(0).format("YYYY-MM-DD")}
        }

        const currTier = await tierhistory.findOne({ where: paramTier });

        var settTier = {
          minimum_point: { [Op.lte]:totalPoint[0].point }
        }
        const currSettingTier = await tiersetting.findOne({ where: settTier, order: [['minimum_point', 'DESC']]});
        
        if(!currTier){
          var insertTierHist = {
            user_id: user_id,
            tier_id: currSettingTier.id,
            tier_name: currSettingTier.tier_name,
            start_date: moment().utcOffset(0).format("YYYY-MM-DD"),
            end_date: "9999-12-31"
          };

          const newTier = await tierhistory.findOrCreate({ where: {user_id:user_id}, defaults: insertTierHist });
        } else {
          
          if(currTier.tier_id != currSettingTier.id)
          {
            var paramUpdate = {
              // user_id: user_id,
              // tier_id: currTier.id,
              // tier_name: currTier.tier_name,
              end_date: moment().utcOffset(0).format("YYYY-MM-DD")
            };
            
            tierhistory.update(paramUpdate, {where: {id: currTier.id}} );

            var insertTierHist = {
              user_id: user_id,
              tier_id: currSettingTier.id,
              tier_name: currSettingTier.tier_name,
              start_date: moment().utcOffset(0).format("YYYY-MM-DD"),
              end_date: "9999-12-31"
            };
  
            const newTier = await tierhistory.findOrCreate({ where: {user_id:user_id}, defaults: insertTierHist });
          }
          // else{            
          //   var paramUpdate = {
          //     user_id: user_id,
          //     tier_id: currTier.id,
          //     tier_name: currTier.tier_name
          //   };
            
          //   tierhistory.update(paramUpdate, {where: {id: currTier.id}} );
          // }
        }

        
        return { success: true, message: "Partner Tiering Successfully Created", data: hist[0].dataValues }
      } catch (error) {
        
        console.log(error);
        throw (error)
      }
    },
}
  