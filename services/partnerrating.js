const Rating = require('../models/partnerRating');
const Reservation = require('../models/reservation');
const moment = require("moment");
const PartnerRating = require('../models/partnerRating');

module.exports =
  {  
    getList: async (params) => {        
      return await Rating.findAll({ 
        where: params,
        order: [["created_at", "DESC"]]
       })
        .then((rating) => {
          return (!rating) ? { success: false, message: "Partner Rating Not Found", data: {} } : { success: true, message: "Partner Rating Found", data: rating }
        })
        .catch((err) => { 
          console.log(err);
          return { success: false, message: "Partner Rating Not Found", data: err } 
        });
      },

    findOrCreateRating: async (params, data) => {
      try {
        const { userId, reservationId, rating, review } = data;

        // get reservation info
        var order = await Reservation.findOne({
          where: { id: reservationId }
        });

        if(!order){          
          return { success: false, message: "Reservation Not Found", data: {} } 
        } else {
          if(order.user_id != userId){ 
            return { success: false, message: "User not match", data: {} } 
          }
        }

        var objData = {
          user_id: userId,
          partner_id: order.partner_id,
          reservation_id: reservationId,
          rating: rating,
          review: review,
          review_date: moment().utcOffset(0),
          created_at: moment().utcOffset(0),
          created_by: 'system'
        };
        
        const result = await Rating.findOrCreate({ where: params, defaults: objData })
  
        // check name already registered or not
        if (!result[1]) {
          throw ({ success: false, message: "Partner rating already exists", data: {} })
        }
        
        return { success: true, message: "Partner Rating Successfully Created", data: result[0].dataValues }
      } catch (error) {
        console.log(error)
        throw (error)
      }
    },

    replyReview: async (data) => {
      try {
        const { reviewReply, id, partnerId } = data

        var objData = {
          review_reply: reviewReply,
          review_reply_date: moment().utcOffset(0),
          updated_at: moment().utcOffset(0),
          updated_by: 'system'
        }; 
        
        
        // get reservation info
        var order = await PartnerRating.findOne({
          where: { id: id }
        });

        // if(order == null){          
        //   return { success: false, message: "Review Not Found", data: {} } 
        // }else{
        //   if(order.partner_id != partnerId){
        //     return { success: false, message: "Partner not match", data: {} } 
        //   }
        // }

        return Rating.update(objData, { where: { id:id }})
        .then(async (updated) => { 
            const result = await Rating.findOne({ where: { id: id } })
            
            return { success: true, message: "Reply Rating Successfully", data: result } })
        .catch((err) => { return { success: false, message: "Reply Rating Failed", data: err } });
      } catch (error) {
        console.log(error)
        throw (error)
      }
    },
}
  