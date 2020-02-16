const Reservation = require('../models/reservation');
const ReservationHistory = require('../models/reservationstatushistory');
const PackageHeader = require('../models/partnerPackageHeader');
const PackageDetail = require('../models/partnerPackageDetail');

module.exports =
  {        
    
    findOrCreateReservation: async (data) => {
      try {
        
        const { userId, packageId, eventDate, eventTime, eventAddress, name, address, phoneNo, waNo, email, socialMedia, otherDescription } = data.body;

        // get services from package partner
        var package = await PackageHeader.findOne({
          where: { id: packageId }
        });

        if(package === null){
          return {
            success: false,
            message: "Package not found"
          };
        }

        //check duplicate reservation user with event date, event time, partner id 
        const params = {
          user_id: userId,
          partner_id: package.partner_id,
          event_date: eventDate,
          event_time: event_time,
          event_address: eventAddress
        };

        const isDuplicate = await Reservation.findOne({ where: params });

        //check available partner with event date, event time, partner id 
        const params2 = {
          partner_id: package.partner_id,
          event_date: eventDate,
          event_time: event_time,
          status_code: "102105"
        };

        const isPartnerIsBooked = await Reservation.findOne({ where: params2 });

        
        if(isPartnerIsBooked){
          return {
            success: false,
            message: "Partner is not available."
          };
        }

        if (!isDuplicate) {
          const { body } = req;
          var currentDate = moment().utcOffset(7).format("YYMMDD");

          const lastReservation = await Reservation.findOne({
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

          var packageDetails = await PackageDetail.findAll({
            where: { package_header_id: packageId }
          });

          if(packageDetails === null){
            return {
              success: false,
              message: "Package details not found"
            };
          }

          var services = [];
          var histories = [];

          packageDetails.forEach(detail => {
            service = {
              service_id: detail.service_id,
              sub_service_id: detail.subservice_id,
              description: detail.description,
              price: detail.price,
              created_at: moment().utcOffset(7),
              created_by: 'system'
            };
            services.push(service);
          });

          histories.push(new {
            status_code: "102101",
            created_at: moment().utcOffset(7),
            created_by: 'system'
          });

          var reservationData = {
              reservation_no: reservationNo,
              reservation_date: moment().utcOffset(7),
              user_id: userId,
              partner_id: partnerId,
              reservation_id: package.reservation_id,
              service_id: package.service_id,
              event_date: eventDate,
              event_time: eventTime,
              event_address: eventAddress,
              total_price: package.totalprice,
              total_discount: 0,
              total_payment: package.totalprice,
              status_code: "102101",
              created_at: moment().utcOffset(7),
              created_by: "system",
              reservation_contact: {
                reservation_no: reservationNo,
                name: name,
                address: address,
                phone_no: phoneNo,
                wa_no: waNo,
                email: email,
                social_media: socialMedia,
                other_description: otherDescription
              },
              reservation_services: services,
              reservation_histories: histories
          };

          const insertReservation = await Reservation.findOrCreate({
            where: params,
            defaults: reservationData
          });

          if (!insertReservation[1]) {
            throw {
              success: false,
              message: "Failed to create reservation",
              data: {}
            };
          } else {
            return {
              success: true,
              message: "Reservation Successfully Created",
              data: insertReservation[0].dataValues
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
    
    findReservation: async (reservationNo) => {
      return await Reservation.findOne({ where: {reservation_no: reservationNo }})
        .then((reservations) => {
          return (!reservations) ? { success: false, message: "Reservation Not Found", data: {} } : { success: true, message: "Reservation Found", data: reservations }
        })
        .catch((err) => { return { success: false, message: "Reservation Not Found", data: err } });
    },
    
    findReservations: async (params, paging) => {
      // const {limit, offset} = paging;

      return await Reservation.findAll({ 
        where: params,
        // limit: limit, 
        // offset: offset,
        order: '"reservation_no" DESC' })
        .then((reservations) => {
          return (!reservations) ? { success: false, message: "Reservation Not Found", data: {} } : { success: true, message: "Reservation Found", data: categories }
        })
        .catch((err) => { return { success: false, message: "Reservation Not Found", data: err } });
    },

    
    updateStatusReservation: async (req) => {
      try {
        const { reservationNo, statusCode, userId } = req.body

        var objReservation = {
          status_code: statusCode, 
          updated_at: moment().utcOffset(7),
          updated_by: userId
        }

        console.log(JSON.stringify(objReservation), "objReservation")

        return Reservation.update(objReservation, {where: {reservation_no: reservationNo}} )
        .then(async (updated) => { 
            const upReserv = await Reservation.findOne({ where: { reservation_no: reservationNo } })
            console.log(JSON.stringify(upReserv), "upReserv")

            const history = {status_code: statusCode, reservation_id: upReserv.id, updatedcreated_at: moment().utcOffset(7), created_by: userId };
            const upHistory = await ReservationHistory.create(history);

            return { success: true, message: "Reservation Successfully Updated", data: upReserv } })
        .catch((err) => { return { success: false, message: "Update Reservation Failed", data: err } });
      } catch (error) {
        throw (error)
      }
    },
  }

