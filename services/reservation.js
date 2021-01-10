const Reservation = require('../models/reservation');
const ReservationStatusHistory = require('../models/reservationstatushistory');
const ReservationContact = require('../models/reservationcontact');
const ReservationService = require('../models/reservationservice');
const PackageHeader = require('../models/partnerPackageHeader');
const PackageDetail = require('../models/partnerPackageDetail');
const moment = require("moment");
const sequelize = require('../config/sequelize');
const Sequelize = require('sequelize');
const wallethistory = require('../services/partnerwallethistory');

module.exports =
  {        
    
    findOrCreateReservation: async (data) => {
      try {
        const { reservationType, reservationDate, partnerId, userId, packageId, eventDate, eventTime, eventAddress, name, address, phoneNo, waNo, email, socialMedia, otherDescription } = data;

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

        if(reservationType == "MANUAL_ORDER"){
          if(package.partner_id != partnerId){
            return {
              success: false,
              message: "Partner tidak bisa menggunakan package yang dipilih.",
              data: {}
            };
          }
        }

        //check duplicate reservation user with event date, event time, partner id 
        const params = {
          user_id: userId,
          partner_id: package.partner_id,
          event_date: eventDate,
          event_time: eventTime,
          event_address: eventAddress,
          reservation_type: reservationType
        };

        const isDuplicate = await Reservation.findOne({ where: params });
        
        if(isDuplicate != null){
          return {
            success: false,
            message: "Sudah ada order dengan user, partner, tanggal event, jam event dan alamat event yang sama",
            data: {}
          };
        }

        //check available partner with event date, event time, partner id 
        const params2 = {
          partner_id: package.partner_id,
          event_date: eventDate,
          event_time: eventTime,
          transaction_status_code: ["ON_PROCESS"]
        };

        const isPartnerIsBooked = await Reservation.findOne({ where: params2 });
        
        if(isPartnerIsBooked){
          return {
            success: false,
            message: "Partner is not available.",
            data: {}
          };
        }

        if (!isDuplicate) {
          var currentDate = moment().utcOffset(0).format("YYMMDD");

          const lastReservation = await Reservation.findOne({
            where: { reservation_no: { [Sequelize.Op.like]: `${currentDate}%` } },
            order: [["reservation_no", "DESC"]]
          });
          
          var reservationNo = "";
          //create new storeid
          if (!lastReservation) {
            reservationNo = currentDate + "00001";
          } else {
            var strNewId = Number(lastReservation.reservation_no.substring(6, 11)) + 1;
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
              service_id: package.service_id,
              sub_service_id: detail.subservice_id,
              description: detail.description,              
              price: detail.price,
              terms: detail.terms,
              additional_services: detail.additional_services,
              created_at: moment().utcOffset(0),
              created_by: 'system'
            };
            services.push(service);
          });

          histories.push({
            status_code: "ORDER_NEW",
            created_at: moment().utcOffset(0),
            created_by: 'system'
          });

          var statusCode = "ORDER_NEW";
          var transactionStatusCode = "NEW";
          var resvDate = moment().utcOffset(0);

          if(reservationType == "MANUAL_ORDER"){
            statusCode = "ORDER_PARTNER_CONFIRM";
            transactionStatusCode = "ON_PROCESS";
            resvDate = reservationDate
          }

          var reservationData = {
              reservation_no: reservationNo,
              reservation_date: resvDate,
              reservation_type: reservationType,
              user_id: userId,
              partner_id: package.partner_id,
              category_id: package.category_id,
              package_id: packageId,
              service_id: package.service_id,
              name: package.name,
              event_date: eventDate,
              event_time: eventTime,
              duration: package.duration,
              event_address: eventAddress,
              total_price: package.totalprice,
              total_discount: 0,
              total_payment: package.totalprice,
              status_code: statusCode,
              transaction_status_code: transactionStatusCode,
              created_at: moment().utcOffset(0),
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
              reservation_status_histories: histories
          };

          const insertparams = {
            reservation_no: reservationNo,
            user_id: userId,
            partner_id: package.partner_id,
            event_date: eventDate,
            event_time: eventTime,
            event_address: eventAddress
          };
          console.log("resv data");
          console.log(reservationData);

          const insertReservation = await Reservation.findOrCreate({
            where: insertparams,
            include: [
              {
                model: ReservationContact,
                as: 'reservation_contact'
              },
              {
                model: ReservationService,
                as: 'reservation_services'
              },
              {
                model: ReservationStatusHistory,
                as: 'reservation_status_histories'
              }
            ],
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
        console.log(error);
        throw error
      }
    },
    
    findReservation: async (reservationNo) => {
      return await Reservation.findOne({ 
        where: { reservation_no: reservationNo },
        include: [
          {
            model: ReservationContact,
            as: 'reservation_contact'
          },
          {
            model: ReservationService,
            as: 'reservation_services'
          },
          {
            model: ReservationStatusHistory,
            as: 'reservation_status_histories'
          }
        ]
      })
        .then((reservations) => {
          return (!reservations) ? { success: false, message: "Reservation Not Found", data: {} } : { success: true, message: "Reservation Found", data: reservations }
        })
        .catch((err) => { return { success: false, message: "Reservation Not Found", data: err } });
    },
    
    findReservations: async (where) => {
      var reservations = await sequelize.query(
        `SELECT 
            rv.id, 
            reservation_no, 
            reservation_date, 
            user_id, 
            usr.name user_name,
            partner_id, 
            prt.name partner_name,
            prt.picture partner_picture,
            rv.category_id, 
            cat.description category,
            service_id, 
            srv.description service,
            rv.name,
            event_date, 
            event_time, 
            event_address, 
            total_price, 
            total_discount, 
            total_payment, 
            status_code, 
            ci.description status,
            duration, 
            reservation_type,
            rt.description reservation_type_desc
          FROM public.reservation rv
          inner join hai_user prt on prt.id = rv.partner_id
          left join hai_user usr on usr.id = rv.user_id
          inner join category cat on cat.id = rv.category_id
          inner join service srv on srv.id = rv.service_id
          left join info_code ci on ci.code = rv.status_code
          left join info_code rt on rt.code = rv.reservation_type
          `+where+`
          order by rv.id desc;`,
        {
            raw: true,
            type: sequelize.QueryTypes.SELECT
        }
    );

    if(reservations.length > 0){
      return (!reservations) ? { success: false, message: "Reservation Not Found", data: {} } : { success: true, message: "Reservation Found", data: reservations }
    } else {      
      return { success: false, message: "Reservation Not Found", data: err } 
    }
      // const {limit, offset} = paging;      
      // return await Reservation.findAll({ 
      //   where: params,
      //   // limit: limit, 
      //   // offset: offset,
      //   order: [["reservation_no", "DESC"]]
      //  })
      //   .then((reservations) => {
      //     return (!reservations) ? { success: false, message: "Reservation Not Found", data: {} } : { success: true, message: "Reservation Found", data: reservations }
      //   })
      //   .catch((err) => { 
      //     console.log(err);
      //     return { success: false, message: "Reservation Not Found", data: err } 
      //   });
    },

    
    updateStatusReservation: async (req) => {
      try {
        const { reservationNo, statusCode, userId } = req;
        
        let transactionStatusCode = "NEW";

        if(statusCode == "ORDER_COMPLETED"){
          transactionStatusCode = "SUCCESS";
        } else if (statusCode == "ORDER_CANCEL_BY_PARTNER"){
          transactionStatusCode = "CANCEL";
        } else if (statusCode == "ORDER_CANCEL_BY_USER"){
          transactionStatusCode = "CANCEL";
        } else if (statusCode == "ORDER_DP_REQUEST"){
          transactionStatusCode = "NEW";
        } else if (statusCode == "ORDER_DP_COMPLETED"){
          transactionStatusCode = "ON_PROCESS";
        } else if (statusCode == "ORDER_PARTNER_CONFIRM"){
          transactionStatusCode = "ON_PROCESS";
        } else if (statusCode == "ORDER_REPAYMENT_REQUEST"){
          transactionStatusCode = "ON_PROCESS";
        } else if (statusCode == "ORDER_PAYMENT_COMPLETED"){
          transactionStatusCode = "ON_PROCESS";
        }

        var objReservation = {
          status_code: statusCode, 
          transaction_status_code: transactionStatusCode,
          updated_at: moment().utcOffset(0),
          updated_by: userId
        }

        console.log(JSON.stringify(objReservation), "objReservation")

        return Reservation.update(objReservation, {where: {reservation_no: reservationNo}} )
        .then(async (updated) => { 
            const upReserv = await Reservation.findOne({ where: { reservation_no: reservationNo } })
            console.log(JSON.stringify(upReserv), "upReserv")

            const history = {status_code: statusCode, reservation_id: upReserv.id, updatedcreated_at: moment().utcOffset(0), created_by: userId };
            const upHistory = await ReservationStatusHistory.create(history);

            if(statusCode == "ORDER_COMPLETED")
            {
              console.log("ini ke wallet");
              //hardcode 3 %
              var walletAmount =  upReserv.total_price - (upReserv.total_price * 0.03);
              
              var objBalance = {
                partner_id: upReserv.partner_id,
                reservation_no: upReserv.reservation_no,
                transaction_type: "C",
                total_amount: walletAmount,
                status: statusCode
              }

              var objParam = {
                reservation_no: upReserv.reservation_no
              }

              const insertWallet = await wallethistory.findOrCreateWallet(objParam, objBalance);
            }

            return { success: true, message: "Reservation Successfully Updated", data: upReserv } })
        .catch((err) => { return { success: false, message: "Update Reservation Failed", data: err } });
      } catch (error) {
        throw (error)
      }
    },

    // getPartnerAgendaItems: async (param) => {
    //   try {
    //       const { partnerId, month, year } = param;
    //       var agenda = {};

    //       var query = `
    //       select 
    //         json_agg(
    //           json_build_object(
    //             to_char(a.event_date, 'YYYY-MM-DD'), items
    //           )
    //         ) items
    //       FROM (select 
    //               distinct date(event_date) event_date, 
    //               partner_id	  
    //             from reservation rr
    //             where rr.partner_id = ` + partnerId + `
    //             and extract(MONTH from rr.event_date) = ` + month + `
    //             and extract(YEAR from rr.event_date) = ` + year + `
    //             and rr.transaction_status_code in ('ON_PROCESS')
    //          )  a
    //       LEFT   JOIN LATERAL (
    //          SELECT json_agg(x) AS items
    //          FROM  (select 
    //             (event_time::text || ' ' || ph.name || ' at ' || r.event_address) as name,
    //             50 height
    //             from reservation r
    //             inner join partner_package_header ph
    //             on r.package_id = ph.id
    //               WHERE date(r.event_date) = date(a.event_date)
    //               and r.partner_id = a.partner_id
    //               and r.transaction_status_code in ('ON_PROCESS')
    //            ) x
    //          ) c ON true`;
    //       return sequelize.query(query,{ type : sequelize.QueryTypes.SELECT}).then(results => {
    //           return results;
    //       });

    //   } catch (error) {
    //     console.log(error);
    //     throw error
    //   }
    // },

    getPartnerCalendarData: async (param) => {
      try {
          const { partnerId, month, year } = param;
          var agenda = {};

          var query = `
        select 
          json_agg(
            json_build_object(
              to_char(a.event_date, 'YYYY-MM-DD'), items
            )
          ) items,
          json_agg(
            json_build_object(
              to_char(a.event_date, 'YYYY-MM-DD'),
              to_json(
                json_build_object(
                  'dots', marked,
                  'selectedDotColor', 'blue'
                )
              )
            ) 
          ) markeddates
        FROM (select 
            distinct date(event_date) event_date, 
            partner_id	  
          from reservation rr
          where rr.partner_id = ` + partnerId + `
          and extract(MONTH from rr.event_date) = ` + month + `
          and extract(YEAR from rr.event_date) = ` + year + `
          and rr.transaction_status_code in ('ON_PROCESS')
         )  a
         LEFT   JOIN LATERAL (
            SELECT json_agg(y) AS items
            FROM  (select 
               (event_time::text || ' ' || ph.name || ' at ' || r.event_address) as name,
               50 height
               from reservation r
               inner join partner_package_header ph
               on r.package_id = ph.id
                 WHERE date(r.event_date) = date(a.event_date)
                 and r.partner_id = a.partner_id
                 and r.transaction_status_code in ('ON_PROCESS')
              ) y
            ) d ON true
        LEFT   JOIN LATERAL (
         SELECT json_agg(x) AS marked
         FROM  (select 
          ph.name as key,
          case ph.id 
            when 1 then '#D2691E'
            when 2 then '#FF7F50'
            when 3 then '#6495ED'
            when 4 then '#20B2AA'
            when 5 then '#32CD32'
            when 6 then '#BA55D3'
            when 7 then '#A9A9A9'
            when 8 then '#BDB76B'
            when 9 then '#D2691E'
            when 10 then '#FF1493'
            when 11 then '#FFDEAD'
            when 12 then '#808000'
            when 13 then '#DDA0DD'
            when 14 then '#87CEEB'
            when 15 then '#FFD700'
            when 16 then '#9ACD32'
          else '#D2691E' end as color,
          'blue' as selectedDotColor
          from reservation r
          inner join category ph
          on r.category_id = ph.id
            WHERE date(r.event_date) = date(a.event_date)
            and r.partner_id = a.partner_id
            and r.transaction_status_code in ('ON_PROCESS')
           ) x
         ) c ON true`;
          return sequelize.query(query,{ type : sequelize.QueryTypes.SELECT}).then(results => {
              if(results === null){
                return new {items:[], markeddates: []};
              }
              else{
                return results[0];
              }
          });

      } catch (error) {
        console.log(error);
        throw error
      }
    },
  }
