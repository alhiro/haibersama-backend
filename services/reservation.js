const Reservation = require('../models/reservation');

module.exports =
  {        
    findOrCreateReservation: async (userId) => {
      try {

        const isExist = await Reservation.findOne({ where: params });
        if (!isExist) {
          const { body } = req;
          var currentDate = moment().utcOffset(7).format("YYMMDD");

          const lastReservation = await User.findOne({
            where: { reservation_no: { $like: `${currentDate}%` } },
            order: [["reservation_no", "DESC"]]
          });

          var reservationNo = "";
          //create new storeid
          if (!lastReservation) {
            reservationNo = currentDate + "00001";
          } else {
            var strNewId = Number(lastReservationNo.dataValues.reservation_no.substring(6, 11)) + 1;
            if (strNewId.toString().length < 5) {
              reservationNo = currentDate + "0".repeat(5 - strNewId.toString().length) + strNewId;
            } else {
              reservationNo = currentDate + strNewId;
            }
          }
            
          var reservationData = {
              ReservationNo: reservationNo
          };

          const insertReservation = await Reservation.findOrCreate({
            where: params,
            defaults: reservationData
          });

          if (!insertReservation[1]) {
            throw {
              success: false,
              message: "That Phone Number already exists",
              data: {}
            };
          } else {
            delete insertUser[0].dataValues.password;
            return {
              success: true,
              message: "Reservation Successfully Created",
              data: insertUser[0].dataValues
            };
          }
        } else {
          return {
            success: false,
            message: "Reservation is already exist",
            data: {}
          };
        }
      } catch (error) {
        throw error
      }
    },
    
    getAllByUserID: async (userId) => {
      try {
        return await Reservation.findAll({  
          where:{
          user_id : userId
          },
          order:[
              ["reservation_no", "DESC"]
          ],
          limit: 10
        })
          .then((reservations) => {
            //delete reservations.password
            return (!reservations) ? { success: false, message: "Reservation Not Found", data: {} } : { success: true, message: "Reservation Found", data: reservations }
          })
          .catch((err) => { return { success: false, message: "Reservation Not Found", data: err } });
      } catch (error) {
        throw error
      }
    },

    findReservation: async (params) => {
      return await Reservation.findOne({ where: params })
        .then((reservations) => {
          //delete reservations.password
          return (!reservations) ? { success: false, message: "Reservation Not Found", data: {} } : { success: true, message: "Reservation Found", data: reservations }
        })
        .catch((err) => { return { success: false, message: "Reservation Not Found", data: err } });
    },
  }
