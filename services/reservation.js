const HaiUser = require('../models/haiuser');
const Reservation = require('../models/reservation');
const ReservationStatusHistory = require('../models/reservationstatushistory');
const ReservationContact = require('../models/reservationcontact');
const ReservationService = require('../models/reservationservice');
const PackageHeader = require('../models/partnerPackageHeader');
const PackageDetail = require('../models/partnerPackageDetail');
const ShareLink = require('../models/sharelink');
const Payment = require('../models/payment');
const moment = require("moment");
const sequelize = require('../config/sequelize');
const Sequelize = require('sequelize');
const wallethistory = require('../services/partnerwallethistory');
const appSetting = require('../models/applicationsetting');
const pointprocess = require('../services/point');
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

module.exports = {
  findOrCreateReservation: async (data) => {
    try {
          const {
            reservationType,
            reservationDate,
            partnerId,
            userId,
            packageId,
            eventDate,
            eventTime,
            eventAddress,
            name,
            provinsi,
            city,
            address,
            phoneNo,
            waNo,
            email,
            socialMedia,
            otherDescription,
            shareLinkId,
          } = data;
          console.log("data create reservation");
          console.log(data);

          // get services from package partner
          var package = await PackageHeader.findOne({
            where: { id: packageId },
          });

          if (package === null) {
            return {
              success: false,
              message: "Jasa/Produk Tidak Ditemukan",
            };
          }

          if (reservationType == "MANUAL_ORDER") {
            if (package.partner_id != partnerId) {
              return {
                success: false,
                message:
                  "Partner Tidak Bisa Menggunakan Jasa/Produk Yang Dipilih.",
                data: {},
              };
            }
          }

          console.log("package.partner_id");
          console.log(package.partner_id);

          console.log("partnerId");
          console.log(partnerId);

          //check duplicate reservation user with event date, event time, partner id
          const params = {
            user_id: userId,
            partner_id: package.partner_id,
            event_date: eventDate,
            status_code: [
              "ORDER_NEW",
              "ORDER_WAITING_CONFIRM",
              "ORDER_PARTNER_CONFIRM",
              "ORDER_DP_COMPLETED",
              "ORDER_COMPLETED",
              "ORDER_PAYMENT_COMPLETED",
            ],
          };
          console.log("params");
          console.log(params);

          // Format tanggal dari JS (YYYY-MM-DD)
          const eventDateString = new Date(eventDate)
            .toISOString()
            .split("T")[0];

          // Status yang di-check
          const statusCodes = [
            "ORDER_NEW",
            "ORDER_WAITING_CONFIRM",
            "ORDER_PARTNER_CONFIRM",
            "ORDER_DP_COMPLETED",
            "ORDER_COMPLETED",
            "ORDER_PAYMENT_COMPLETED",
          ];

          // Query findOne menggunakan DATE() agar benar-benar dibandingkan tanggal
          const existingEvents = await Reservation.findAll({
            where: {
              partner_id: package.partner_id,
              status_code: { [Op.in]: statusCodes },
              [Op.and]: Sequelize.literal(
                `DATE("event_date") = DATE('${eventDateString}')`
              ),
            },
          });

          console.log("Duplicate check:", existingEvents.length);

          const newStart = new Date(`${eventDate} ${eventTime}`);
          const newEnd = new Date(
            newStart.getTime() + package.duration * 60000
          );
          const duration = package.duration;
          console.log("newStart " + newStart);
          console.log("newEnd " + newEnd);
          console.log("duration " + duration);

          let conflict = false;

          for (const event of existingEvents) {
            // hitung eventStart & eventEnd dari DB
            const [ehour, eminute, esecond] = event.event_time
              .split(":")
              .map(Number);
            const eventStart = new Date(event.event_date);
            eventStart.setHours(ehour, eminute, 0, 0);

            const eventEnd = new Date(
              eventStart.getTime() + event.duration * 60000
            );

            console.log("Existing event:", eventStart, "-", eventEnd);

            // cek overlap
            if (newStart < eventEnd && newEnd > eventStart) {
              conflict = true;
              break; // cukup 1 bentrok
            }
          }

          if (conflict) {
            return {
              success: false,
              message: "Sudah ada reservasi untuk partner dan tanggal ini. Periksa waktu karena berhubungan dengan durasi",
              data: {},
            };
          }

          //check available partner with event date, event time, partner id
          const params2 = {
            partner_id: package.partner_id,
            event_date: new Date(eventDate).toLocaleString(),
            event_time: eventTime,
            transaction_status_code: ["ON_PROCESS"],
          };

          const isPartnerIsBooked = await Reservation.findOne({
            where: params2,
          });

          if (isPartnerIsBooked) {
            return {
              success: false,
              message: "Partner Tidak Tersedia",
              data: {},
            };
          }

          if (!conflict) {
            var currentDate = moment()
              .utcOffset(0)
              .format("YYMMDD");

            const lastReservation = await Reservation.findOne({
              where: {
                reservation_no: { [Sequelize.Op.like]: `${currentDate}%` },
              },
              order: [["reservation_no", "DESC"]],
            });

            var reservationNo = "";
            //create new storeid
            if (!lastReservation) {
              reservationNo = currentDate + "00001";
            } else {
              var strNewId =
                Number(lastReservation.reservation_no.substring(6, 11)) + 1;
              if (strNewId.toString().length < 5) {
                reservationNo =
                  currentDate +
                  "0".repeat(5 - strNewId.toString().length) +
                  strNewId;
              } else {
                reservationNo = currentDate + strNewId;
              }
            }

            var packageDetails = await PackageDetail.findAll({
              where: { package_header_id: packageId },
            });

            if (packageDetails === null) {
              return {
                success: false,
                message: "Detail Jasa/Produk Tidak Ditemukan",
              };
            }

            var services = [];
            var histories = [];

            packageDetails.forEach((detail) => {
              var service = {
                service_id: package.service_id,
                // sub_service_id: detail.subservice_id,
                sub_service_title: detail.sub_service_title,
                description: detail.description,
                price: detail.price,
                duration: detail.duration,
                additional_services: detail.additional_services,
                terms: detail.terms,
                created_at: moment().utcOffset(0),
                created_by: "system",
              };
              services.push(service);
            });

            histories.push({
              status_code: "ORDER_NEW",
              created_at: moment().utcOffset(0),
              created_by: "system",
            });

            var statusCode = "ORDER_NEW";
            var transactionStatusCode = "NEW";
            var resvDate = moment().utcOffset(0);

            if (reservationType == "MANUAL_ORDER") {
              statusCode = "ORDER_PARTNER_CONFIRM";
              transactionStatusCode = "ON_PROCESS";
              resvDate = reservationDate;
            }

            // count discount base on referral or not
            const userData = await HaiUser.findOne({ where: { id: userId } });
            let discountPercent = 0;
            let serviceFee = 0;

            console.log("userData?.code_referral " + userData?.code_referral);
            if (userData?.code_referral) {
              const discountSetting = await appSetting.findOne({
                where: { setting_name: "CUSTOMER_DISCOUNT_REFERRAL" },
              });
              discountPercent = parseFloat(discountSetting?.setting_value || 0);
            } else {
              const discountSetting = await appSetting.findOne({
                where: { setting_name: "CUSTOMER_DISCOUNT" },
              });
              discountPercent = parseFloat(discountSetting?.setting_value || 0);

              if (reservationType == "MANUAL_ORDER") {
                const serviceSetting = await appSetting.findOne({
                  where: { setting_name: "SERVICE_FEE_PARTNER" },
                });
                serviceFee = parseFloat(serviceSetting?.setting_value || 0);
              } else {
                const serviceSetting = await appSetting.findOne({
                  where: { setting_name: "SERVICE_FEE" },
                });
                serviceFee = parseFloat(serviceSetting?.setting_value || 0);
              }
            }
            const totalDiscount = Math.round(
              package.totalprice * (discountPercent / 100)
            );

            var reservationData = {
              reservation_no: reservationNo,
              reservation_date: resvDate,
              reservation_type: reservationType,
              user_id: userId,
              partner_id: package.partner_id,
              category_id: package.category_id,
              package_id: packageId,
              service_id: package.service_id,
              name: name,
              package_name: package.name,
              description: package.description,
              event_date: eventDate,
              event_time: eventTime,
              duration: package.duration,
              event_address: eventAddress,
              total_price: package.totalprice,
              total_discount: totalDiscount,
              total_down_payment: 0,
              total_payment: package.totalprice - totalDiscount + serviceFee,
              status_code: statusCode,
              transaction_status_code: transactionStatusCode,
              share_link_id: shareLinkId,
              created_at: moment().utcOffset(0),
              created_by: "system",
              reservation_contact: {
                reservation_no: reservationNo,
                name: name,
                provinsi: provinsi,
                city: city,
                address: address,
                phone_no: phoneNo,
                wa_no: waNo,
                email: email,
                social_media: socialMedia,
                other_description: otherDescription,
              },
              reservation_services: services,
              reservation_status_histories: histories,
            };

            const insertparams = {
              reservation_no: reservationNo,
              user_id: userId,
              partner_id: package.partner_id,
              event_date: eventDate,
              event_time: eventTime,
              event_address: eventAddress,
            };
            console.log("resv data");
            console.log(reservationData);

            const insertReservation = await Reservation.findOrCreate({
              where: insertparams,
              include: [
                {
                  model: ReservationContact,
                  as: "reservation_contact",
                },
                {
                  model: ReservationService,
                  as: "reservation_services",
                },
                {
                  model: ReservationStatusHistory,
                  as: "reservation_status_histories",
                },
              ],
              defaults: reservationData,
            });

            if (!insertReservation[1]) {
              throw {
                success: false,
                message: "Reservasi Gagal Dibuat",
                data: {},
              };
            } else {
              return {
                success: true,
                message: "Reservasi Berhasil Dibuat",
                data: insertReservation[0].dataValues,
              };
            }
          } else {
            return {
              success: false,
              message: "Reservasi Sudah Ada",
              data: {},
            };
          }
        } catch (error) {
      console.log(error);
      throw error;
    }
  },

  findReservation: async (params) => {
    console.log("params get detail reservation");
    console.log(params);

    const { reservationNo, type } = params;

    return await Reservation.findOne({
      where: { reservation_no: reservationNo },
      include: [
        {
          model: ReservationContact,
          as: "reservation_contact",
        },
        {
          model: ReservationService,
          as: "reservation_services",
        },
        {
          model: PackageDetail,
          as: "partner_package_details",
        },
        {
          model: ReservationStatusHistory,
          as: "reservation_status_histories",
        },
      ],
    })
      .then(async (reservation) => {
        // console.log(reservation);
        if (!reservation) {
          return {
            success: false,
            message: "Reservasi Tidak Ditemukan!",
            data: null,
          };
        }

        let serviceFee = 0;
        // buat kondisi partner dan user bedakan fee service
        if (type === 2) {
          const [serviceSetting] = await Promise.all([
            appSetting.findOne({ where: { setting_name: "SERVICE_FEE_PARTNER" } }),
          ]);
          serviceFee = parseFloat(serviceSetting?.setting_value || 0);
        } else {
          const [serviceSetting] = await Promise.all([
            appSetting.findOne({ where: { setting_name: "SERVICE_FEE" } }),
          ]);
          serviceFee = parseFloat(serviceSetting?.setting_value || 0);
        };
        console.log("serviceFee " + serviceFee);

        // Hitung total dari reservation_services
        const totalServicePrice = parseFloat(reservation.total_price);
        console.log("totalServicePrice " + totalServicePrice);

        // Hitung total dari partner_package_details
        const totalPackagePrice =
          reservation.partner_package_details?.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            return sum + price;
          }, 0) || 0;
        console.log("totalPackagePrice " + totalPackagePrice);

        // Ambil ppn dan diskon dari reservation
        const totalPpn = parseFloat(reservation.total_ppn) || 0;
        const totalDiscount = parseFloat(reservation.total_discount) || 0;
        const totalDp = parseFloat(reservation.total_down_payment) || 0;

        // Hitung total harga akhir
        const total_price_payment =
          (totalServicePrice +
          totalPackagePrice +
          totalPpn) +
          (serviceFee -
          totalDiscount
        );
        console.log("total_price_payment " + total_price_payment);

        // Tambahkan ke objek reservation untuk total_price_payment
        const reservationJSON = reservation.toJSON();
        reservationJSON.total_detail_payment = totalServicePrice + totalPackagePrice;
        reservationJSON.total_price_payment = total_price_payment;

        console.log("status code reservatioh " + reservation.status_code);
        if (reservation.status_code === "ORDER_PAYMENT_COMPLETED" || reservation.status_code === "ORDER_COMPLETED") {
          reservationJSON.total_remaining_payment = 0;
        } else {
          reservationJSON.total_remaining_payment = total_price_payment - totalDp;
        }

        // let referralCode = null;

        // // find user has code_referral
        // const userData = await HaiUser.findOne({
        //   where: { id: reservation.partner_id },
        // });

        // // check if user have code referral from others user
        // if (userData && userData.code_referral) {
        //   referralCode = userData.code_referral;
        // }

        // if (!referralCode) {
        //   // Tanpa referral → ambil setting untuk user biasa
        //   console.log("Tanpa referral");
        //   const [serviceSetting, appFeeSetting] = await Promise.all([
        //     appSetting.findOne({ where: { setting_name: "SERVICE_FEE" } }),
        //     appSetting.findOne({ where: { setting_name: "ORDER_FEE" } }),
        //   ]);
        //   const serviceFee = parseFloat(serviceSetting?.setting_value || 0);
        //   const appFeeNormal = parseFloat(appFeeSetting?.setting_value || 0);

        //   // Hitung total fee normal
        //   const total_fee_normal =
        //     (totalServicePrice + totalPackagePrice + serviceFee) *
        //     (appFeeNormal / 100);
        //   // Tambahkan ke objek reservation untuk total fee normal
        //   reservationJSON.total_fee_normal = total_fee_normal;
        // } else {
        //   console.log("Dengan referral");
        //   const [serviceSetting, appFeeReferralSetting] = await Promise.all([
        //     appSetting.findOne({ where: { setting_name: "SERVICE_FEE" } }),
        //     appSetting.findOne({
        //       where: { setting_name: "ORDER_FEE_REFFERAL" },
        //     }),
        //   ]);
        //   const serviceFee = parseFloat(serviceSetting?.setting_value || 0);
        //   const appFeeReferral = parseFloat(
        //     appFeeReferralSetting?.setting_value || 0
        //   );

        //   // Hitung total fee referral
        //   const total_fee_referral =
        //     (totalServicePrice + totalPackagePrice + serviceFee) *
        //     (appFeeReferral / 100);
        //   // Tambahkan ke objek reservation untuk total fee normal
        //   reservationJSON.total_fee_referral = total_fee_referral;
        // }

        return {
          success: true,
          message: "Reservation Found",
          data: reservationJSON,
        };
      })
      .catch((err) => {
        console.error("🔥 Server error:", err);
        return {
          success: false,
          message: "Terjadi kesalahan pada server.",
          data: null,
          error: err.message || err,
        };
      });
  },

  findReservations: async (where) => {
    var reservations = await sequelize.query(
      `SELECT 
            rv.id, 
            reservation_no, 
            reservation_date, 
            user_id, 
            usr.name user_name,
            usr.picture user_picture,
            partner_id, 
            prt.name partner_name,
            prt.picture partner_picture,
            prt.type partner_type,
            rv.category_id, 
            cat.description category,
            service_id, 
            srv.description service,
            rv.name,
            rc.email,
            rc.address,
            rc.other_description,
            rv.package_id,
            rv.package_name,
            rv.description,
            event_date, 
            event_time, 
            event_address, 
            total_price, 
            total_discount, 
            total_payment, 
            total_down_payment,
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
          left join reservation_contact rc on rc.reservation_id = rv.id
          ` +
        where +
        `
          order by event_date desc;`,
      {
        raw: true,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (reservations.length > 0) {
      return !reservations
        ? { success: false, message: "Reservasi Tidak Ditemukan", data: {} }
        : { success: true, message: "Reservasi Ditemukan", data: reservations };
    } else {
      return { success: false, message: "Reservasi Tidak Ditemukan", data: {} };
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

    // SELECT
    //       rv.id,
    //       reservation_no,
    //       reservation_date,
    //       usr.name user_name,
    //       usr.picture user_picture,
    //       partner_id,
    //       prt.name partner_name,
    //       prt.picture partner_picture,
    //       rv.category_id,
    //       cat.description category,
    //       service_id,
    //       srv.description service,
    //       rv.name,
    //       rc.email,
    //       rc.address,
    //       rc.other_description,
    //       rv.package_id,
    //       rv.package_name,
    //       rv.description,
    //       event_date,
    //       event_time,
    //       event_address,
    //       total_price,
    //       total_discount,
    //       total_payment,
    //       total_down_payment,
    //       status_code,
    //       ci.description status,
    //       duration,
    //       reservation_type,
    //       rt.description reservation_type_desc,
    //       rvl.user_id cart_length
    //     FROM public.reservation rv
    //     inner join hai_user prt on prt.id = rv.partner_id
    //     left join hai_user usr on usr.id = rv.user_id
    //     inner join category cat on cat.id = rv.category_id
    //     inner join service srv on srv.id = rv.service_id
    //     left join info_code ci on ci.code = rv.status_code
    //     left join info_code rt on rt.code = rv.reservation_type
    //     left join reservation_contact rc on rc.reservation_id = rv.id
    //     left join lateral (
    //       select user_id, count(reservation_no) reservation_length
    //       FROM reservation rv
    //       where rv.status_code = 'ORDER_NEW'
    //       or rv.status_code = 'ORDER_PARTNER_CONFIRM'
    //       group by user_id
    //       order by count(reservation_no) desc
    //     ) rvl on true
    //     where rv.user_id = 12
    //     group by rv.id, usr.name, usr.picture, prt.name, prt.picture, cat.description, srv.description, rc.email, rc.address,
    //     rc.other_description, rv.package_id, rv.package_name, rv.description, ci.description, rt.description, rvl.user_id
    //     order by event_date desc;
  },

  findSuccessReservations: async (where, limitItem, page) => {
    // Pastikan page valid
    let currentPage = parseInt(page) || 1;
    let limit = parseInt(limitItem) || 10;
    let offset = (currentPage - 1) * limit;

    // Hitung total data dulu (tanpa limit)
    const totalResult = await sequelize.query(
      `SELECT COUNT(DISTINCT rv.id) AS total
         FROM public.reservation rv
         INNER JOIN hai_user prt ON prt.id = rv.partner_id
         LEFT JOIN hai_user usr ON usr.id = rv.user_id
         INNER JOIN category cat ON cat.id = rv.category_id
         INNER JOIN service srv ON srv.id = rv.service_id
         LEFT JOIN info_code ci ON ci.code = rv.status_code
         LEFT JOIN info_code rt ON rt.code = rv.reservation_type
         LEFT JOIN reservation_contact rc ON rc.reservation_id = rv.id
         LEFT JOIN partner_package_detail ppd ON ppd.reservation_no = rv.reservation_no
         LEFT JOIN reservation_service rs ON rs.reservation_id = rv.id
         ${where}`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const totalData = parseInt(totalResult[0]?.total || 0);
    const pageCount = Math.ceil(totalData / limit);

    // Jika page lebih dari max pageCount, return kosong
    if (currentPage > pageCount && pageCount !== 0) {
      return {
        success: false,
        message: "Reservasi Tidak Ditemukan.",
        data: [],
        page: currentPage,
        pageCount: pageCount,
      };
    }

    // Ambil data yang dibatasi
    const reservations = await sequelize.query(
      `SELECT 
            rv.id, rv.reservation_no, rv.reservation_date, rv.user_id, 
            usr.name AS user_name, usr.picture AS user_picture,
            rv.partner_id, prt.name AS partner_name, prt.picture AS partner_picture,
            prt.type AS partner_type, rv.category_id, cat.description AS category,
            rv.service_id, srv.description AS service, rv.name, rc.email, rc.address,
            rc.other_description, rv.package_id, rv.package_name,
            rv.description AS reservation_description, rv.event_date, rv.event_time,
            rv.event_address, rv.total_price, rv.total_discount, rv.total_payment, 
            rv.total_ppn, rv.total_down_payment, rv.status_code, ci.description AS status,
            rv.duration, rv.reservation_type, rt.description AS reservation_type_desc,
            rv.confirmation_payment,
            COALESCE(
              json_agg(
                DISTINCT jsonb_build_object(
                  'id', ppd.id,
                  'reservation_no', ppd.reservation_no,
                  'package_header_id', ppd.package_header_id,
                  'sub_service_title', ppd.sub_service_title,
                  'description', ppd.description,
                  'duration', ppd.duration,
                  'price', ppd.price::text,
                  'additional_services', ppd.additional_services,
                  'terms', ppd.terms
                )
              ) FILTER (WHERE ppd.id IS NOT NULL), '[]'
            ) AS partner_package_details,

            CAST((
              COALESCE(rv.total_price, 0) +
              (SELECT COALESCE(SUM(price), 0)
               FROM partner_package_detail ppd2
               WHERE ppd2.reservation_no = rv.reservation_no) +
              COALESCE(rv.total_ppn, 0)) AS INTEGER) AS total_price_payment,

            -- get last data from reservation_status_history
            (
              SELECT pph2.status_code
              FROM reservation_status_history pph2
              WHERE pph2.reservation_id = rv.id
              ORDER BY pph2.created_at DESC
              LIMIT 1
            ) AS reservation_status_histories,

            -- get last payment status_code
            (
              SELECT pmt.status_code
              FROM payment pmt
              WHERE pmt.reservation_no = rv.reservation_no
              ORDER BY pmt.created_at DESC
              LIMIT 1
            ) AS status_code_payment
    
         FROM public.reservation rv
         INNER JOIN hai_user prt ON prt.id = rv.partner_id
         LEFT JOIN hai_user usr ON usr.id = rv.user_id
         INNER JOIN category cat ON cat.id = rv.category_id
         INNER JOIN service srv ON srv.id = rv.service_id
         LEFT JOIN info_code ci ON ci.code = rv.status_code
         LEFT JOIN info_code rt ON rt.code = rv.reservation_type
         LEFT JOIN reservation_contact rc ON rc.reservation_id = rv.id
         LEFT JOIN partner_package_detail ppd ON ppd.reservation_no = rv.reservation_no
         LEFT JOIN reservation_service rs ON rs.reservation_id = rv.id
         ${where}
         GROUP BY 
            rv.id, rv.reservation_no, rv.reservation_date, rv.user_id,
            rv.partner_id, rv.category_id, rv.service_id, rv.name,
            rv.package_id, rv.package_name, rv.description,
            rv.event_date, rv.event_time, rv.event_address,
            rv.total_price, rv.total_discount, rv.total_payment, rv.total_down_payment,
            rv.status_code, rv.duration, rv.reservation_type,
            usr.id, usr.name, usr.picture,
            prt.id, prt.name, prt.picture, prt.type,
            cat.id, cat.description,
            srv.id, srv.description,
            ci.code, ci.description,
            rt.code, rt.description,
            rc.id, rc.email, rc.address, rc.other_description
         ORDER BY rv.event_date DESC
         OFFSET ${offset} LIMIT ${limit};`,
      {
        raw: true,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      success: true,
      message: "Reservasi ditemukan",
      data: reservations,
      page: currentPage,
      pageCount: pageCount,
    };
  },

  findSuccessUserReservations: async (where, limitItem, page) => {
    var reservations = await sequelize.query(
      `SELECT 
            rv.id, 
            rv.reservation_no, 
            rv.reservation_date, 
            rv.user_id, 
            usr.name AS user_name,
            usr.picture AS user_picture,
            rv.partner_id, 
            prt.name AS partner_name,
            prt.picture AS partner_picture,
            prt.type AS partner_type,
            rv.category_id,
            cat.description AS category,
            rv.service_id, 
            srv.description AS service,
            rv.name,
            rc.email,
            rc.address,
            rc.other_description,
            rv.package_id,
            rv.package_name,
            rv.description AS reservation_description,
            rv.event_date, 
            rv.event_time, 
            rv.event_address, 
            rv.total_price, 
            rv.total_discount, 
            rv.total_payment, 
            rv.total_ppn,
            rv.total_down_payment,
            rv.status_code, 
            ci.description AS status,
            rv.duration, 
            rv.reservation_type,
            rt.description AS reservation_type_desc,
            rv.confirmation_payment,

            -- Partner Package Details (nested JSON array)
            COALESCE(
              json_agg(
                DISTINCT jsonb_build_object(
                  'id', ppd.id,
                  'reservation_no', ppd.reservation_no,
                  'package_header_id', ppd.package_header_id,
                  'sub_service_title', ppd.sub_service_title,
                  'description', ppd.description,
                  'duration', ppd.duration,
                  'price', ppd.price,
                  'additional_services', ppd.additional_services,
                  'terms', ppd.terms
                )
              ) FILTER (WHERE ppd.id IS NOT NULL), '[]'
            ) AS partner_package_details,

           -- Kalkulasi total_price_payment
          CAST((
            COALESCE(rv.total_price, 0) +
            (
              SELECT COALESCE(SUM(price), 0)
              FROM partner_package_detail ppd2
              WHERE ppd2.reservation_no = rv.reservation_no
            ) +
            COALESCE(rv.total_ppn, 0)
          ) - COALESCE(rv.total_discount, 0) AS INTEGER) AS total_price_payment

          FROM public.reservation rv
          INNER JOIN hai_user prt ON prt.id = rv.partner_id
          LEFT JOIN hai_user usr ON usr.id = rv.user_id
          INNER JOIN category cat ON cat.id = rv.category_id
          INNER JOIN service srv ON srv.id = rv.service_id
          LEFT JOIN info_code ci ON ci.code = rv.status_code
          LEFT JOIN info_code rt ON rt.code = rv.reservation_type
          LEFT JOIN reservation_contact rc ON rc.reservation_id = rv.id
          LEFT JOIN partner_package_detail ppd ON ppd.reservation_no = rv.reservation_no
          LEFT JOIN reservation_service rs ON rs.reservation_id = rv.id
          ${where}
          GROUP BY 
            rv.id, rv.reservation_no, rv.reservation_date, rv.user_id,
            rv.partner_id, rv.category_id, rv.service_id, rv.name,
            rv.package_id, rv.package_name, rv.description,
            rv.event_date, rv.event_time, rv.event_address,
            rv.total_price, rv.total_discount, rv.total_payment, rv.total_down_payment,
            rv.status_code, rv.duration, rv.reservation_type,
            
            usr.id, usr.name, usr.picture,
            prt.id, prt.name, prt.picture, prt.type,
            cat.id, cat.description,
            srv.id, srv.description,
            ci.code, ci.description,
            rt.code, rt.description,
            rc.id, rc.email, rc.address, rc.other_description

          ORDER BY rv.event_date DESC;`,
      {
        raw: true,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const pageCount = Math.ceil(reservations.length / limitItem);
    let pages = parseInt(page);
    if (!pages) {
      pages;
    }
    if (pages > pageCount) {
      pages = pageCount;
    }

    console.log("reservations cart");
    console.log(reservations.length);

    if (reservations.length > 0) {
      return !reservations
        ? {
            success: false,
            message: "Reservasi Tidak Ditemukan",
            data: {},
            page: pages,
            pageCount: pageCount,
          }
        : {
            success: true,
            message: "Reservasi Ditemukan",
            data: reservations.slice(
              pages * limitItem - limitItem,
              pages * limitItem
            ),
            page: pages,
            pageCount: pageCount,
          };
    } else {
      return {
        success: false,
        message: "Reservasi Tidak Ada",
        data: {},
        page: pages,
        pageCount: pageCount,
      };
    }
  },

  updateStatusReservation: async (req) => {
    try {
      const { reservationNo, statusCode, totalDp, userId } = req;

      let transactionStatusCode = "NEW";

      if (statusCode == "ORDER_COMPLETED") {
        transactionStatusCode = "SUCCESS";
      } else if (statusCode == "ORDER_CANCEL_BY_PARTNER") {
        transactionStatusCode = "CANCEL";
      } else if (statusCode == "ORDER_CANCEL_BY_USER") {
        transactionStatusCode = "CANCEL";
      } else if (statusCode == "ORDER_DP_REQUEST") {
        transactionStatusCode = "NEW";
      } else if (statusCode == "ORDER_DP_COMPLETED") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_PARTNER_CONFIRM") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_REPAYMENT_REQUEST") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_PAYMENT_COMPLETED") {
        transactionStatusCode = "ON_PROCESS";
      }

      // total dp blum dieksekusi
      var objReservation = {
        status_code: statusCode,
        // total_down_payment: totalDp,
        transaction_status_code: transactionStatusCode,
        updated_at: moment().utcOffset(0),
        updated_by: userId,
      };

      if (totalDp) {
        objReservation.total_down_payment = totalDp;
      }

      console.log(JSON.stringify(objReservation), "objReservation");

      return Reservation.update(objReservation, {
        where: { reservation_no: reservationNo },
      })
        .then(async (updated) => {
          const upReserv = await Reservation.findOne({
            where: { reservation_no: reservationNo },
          });
          console.log(JSON.stringify(upReserv), "upReserv");

          const history = {
            status_code: statusCode,
            reservation_id: upReserv.id,
            updatedcreated_at: moment().utcOffset(0),
            created_by: userId,
          };
          const upHistory = await ReservationStatusHistory.create(history);

          if (statusCode == "ORDER_COMPLETED") {
            console.log("ini ke wallet");
            //fee order set 3 %
            const feeSetting = await appSetting.findOne({
              where: { setting_name: "ORDER_FEE" },
            });

            const ppn =
              upReserv.total_ppn == null
                ? parseInt(0)
                : parseInt(upReserv.total_ppn);
            console.log("upReserv.total_price " + upReserv.total_price);
            console.log("upReserv.total_discount " + upReserv.total_discount);
            console.log("upReserv.total_ppn " + ppn);
            var countTotal =
              upReserv.total_price - upReserv.total_discount + ppn;
            console.log("countTotal " + countTotal);

            var walletAmount =
              countTotal -
              countTotal * (parseInt(feeSetting.setting_value) / 100);
            console.log(walletAmount);

            var objBalance = {
              partner_id: upReserv.partner_id,
              reservation_no: upReserv.reservation_no,
              transaction_type: "C",
              total_amount: walletAmount,
              status: statusCode,
            };

            var objParam = {
              reservation_no: upReserv.reservation_no,
            };

            const insertWallet = await wallethistory.findOrCreateWallet(
              objParam,
              objBalance
            );

            var objParamPoint = {
              user_id: upReserv.partner_id,
              reservation_no: upReserv.reservation_no,
              reservation_date: upReserv.reservation_date,
              total_price: upReserv.total_price,
            };
            const pointinput = await pointprocess.setPoint(objParamPoint);
          }

          return {
            success: true,
            message: "Reservasi Berhasil Diubah",
            data: upReserv,
          };
        })
        .catch((err) => {
          return {
            success: false,
            message: "Reservasi Gagal Diubah",
            data: err,
          };
        });
    } catch (error) {
      throw error;
    }
  },

  updateStatusReservationManual: async (req) => {
    try {
      const {
        reservationNo,
        reservationType,
        statusCode,
        totalDp,
        totalDiscount,
        totalPpn,
        userId,
      } = req;

      let transactionStatusCode = "NEW";

      if (statusCode == "ORDER_COMPLETED") {
        transactionStatusCode = "SUCCESS";
      } else if (statusCode == "ORDER_CANCEL_BY_PARTNER") {
        transactionStatusCode = "CANCEL";
      } else if (statusCode == "ORDER_CANCEL_BY_USER") {
        transactionStatusCode = "CANCEL";
      } else if (statusCode == "ORDER_DP_REQUEST") {
        transactionStatusCode = "NEW";
      } else if (statusCode == "ORDER_DP_COMPLETED") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_PARTNER_CONFIRM") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_REPAYMENT_REQUEST") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_PAYMENT_COMPLETED") {
        transactionStatusCode = "ON_PROCESS";
      }

      // total dp blum dieksekusi
      var objReservation = {
        status_code: statusCode,
        // total_down_payment: totalDp,
        transaction_status_code: transactionStatusCode,
        updated_at: moment().utcOffset(0),
        updated_by: userId,
      };

      if (totalDp) {
        objReservation.total_down_payment = totalDp;
      }

      if (totalDiscount) {
        objReservation.total_discount = totalDiscount;
      }

      if (totalPpn) {
        objReservation.total_ppn = totalPpn;
      }

      console.log("objReservation");
      console.log(objReservation);

      // Mulai transaksi
      const t = await sequelize.transaction();
      try {
        // 1️⃣ Update reservation
        const [updated] = await Reservation.update(objReservation, {
          where: { partner_id: userId, reservation_no: reservationNo },
          transaction: t,
        });

        if (updated === 0) {
          return {
            success: false,
            message: "Invoice gagal diubah. Kamu tidak punya izin!",
            data: {},
          };
        }

        const upReserv = await Reservation.findOne({
          where: { reservation_no: reservationNo },
          include: [
            {
              model: PackageDetail,
              as: "partner_package_details",
            },
          ],
          transaction: t,
        });

        console.log("Updated reservation:", upReserv?.dataValues);

        // 2️⃣ Insert reservation status history
        const history = {
          status_code: statusCode,
          reservation_id: upReserv.id,
          updatedcreated_at: moment().utcOffset(0),
          created_by: userId,
        };

        await ReservationStatusHistory.create(history, { transaction: t });

        // 3️⃣ Jika order sudah selesai, lakukan perhitungan wallet
        if (statusCode === "ORDER_COMPLETED") {
          if (upReserv.reservation_type === "MANUAL_ORDER") {
            console.log("Tambahkan saldo ke wallet manual order");

            const feeSetting = await appSetting.findOne({
              where: { setting_name: "ADMIN_FEE" },
              transaction: t,
            });

            const ppn = parseInt(upReserv.total_ppn || 0);
            const fixedFee = parseInt(feeSetting?.setting_value || 0);
            const countTotal =
              upReserv.total_price - upReserv.total_discount + ppn;

            const walletAmount = countTotal - fixedFee;

            const objBalance = {
              partner_id: upReserv.partner_id,
              event_date: upReserv.event_date,
              reservation_no: upReserv.reservation_no,
              reservation_type: "MANUAL_ORDER",
              transaction_type: "C",
              total_amount: walletAmount,
              status: statusCode,
            };

            await wallethistory.findOrCreateWallet(
              { reservation_no: upReserv.reservation_no },
              objBalance,
              { transaction: t }
            );

            const objParamPoint = {
              user_id: upReserv.partner_id,
              reservation_no: upReserv.reservation_no,
              reservation_date: upReserv.reservation_date,
              total_price: upReserv.total_price,
            };
            await pointprocess.setPoint(objParamPoint);
          } else {
            console.log("Tambahkan saldo ke wallet user order");

            // ---- Hitung nilai dasar ----
            const totalprice = upReserv.total_price || 0;
            const ppn = parseInt(upReserv.total_ppn || 0);
            const countTotal = Number(totalprice) + Number(ppn);

            // ---- Ambil settingan fee ----
            const userData = await HaiUser.findOne({
              where: { id: upReserv.user_id },
              transaction: t,
            });

            let referralCode = userData?.code_referral || null;
            let userDiscountPercent = 0;
            let appFeePercent = 0;
            let partnerRewardPercent = 0;
            let userSharePercent = 0;

            if (!referralCode) {
              const settingUserDiscount = await appSetting.findOne({
                where: { setting_name: "CUSTOMER_DISCOUNT" },
                transaction: t,
              });
              const settingOrderFee = await appSetting.findOne({
                where: { setting_name: "ORDER_FEE" },
                transaction: t,
              });
              const settingUserShareFee = await appSetting.findOne({
                where: { setting_name: "SHARE_FEE" },
                transaction: t,
              });

              userDiscountPercent = parseFloat(settingUserDiscount?.setting_value || 0);
              appFeePercent = parseFloat(settingOrderFee?.setting_value || 0);
              userSharePercent = parseFloat(settingUserShareFee?.setting_value || 0);
            } else {
              const settingPartnerFee = await appSetting.findOne({
                where: { setting_name: "REFERRAL_FEE" },
                transaction: t,
              });
              const settingUserDiscount = await appSetting.findOne({
                where: { setting_name: "CUSTOMER_DISCOUNT_REFERRAL" },
                transaction: t,
              });
              const settingOrderFeeReferral = await appSetting.findOne({
                where: { setting_name: "ORDER_FEE_REFFERAL" },
                transaction: t,
              });
              const settingUserShareFee = await appSetting.findOne({
                where: { setting_name: "SHARE_FEE" },
                transaction: t,
              });

              partnerRewardPercent = parseFloat(
                settingPartnerFee?.setting_value || 0
              );
              userDiscountPercent = parseFloat(
                settingUserDiscount?.setting_value || 0
              );
              appFeePercent = parseFloat(
                settingOrderFeeReferral?.setting_value || 0
              );
              userSharePercent = parseFloat(
                settingUserShareFee?.setting_value || 0
              );
            }

            // ---- Hitung Package details ----
            const packageDetails = upReserv.partner_package_details || [];
            const totalPackagePrice = packageDetails.reduce((sum, item) => {
              const price = parseFloat(item.price) || 0;
              return sum + price;
            }, 0);
            console.log("totalPackagePrice : " + totalPackagePrice);
            const newCountTotal = countTotal + totalPackagePrice;

            // ---- Reward untuk partner referral ----
            const partnerReward = newCountTotal * (partnerRewardPercent / 100);
            if (referralCode && partnerRewardPercent > 0) {
              console.log("Ada referral, reward ke partner");
              const referralOwner = await HaiUser.findOne({
                where: { referral_own: referralCode },
                transaction: t,
              });

              if (referralOwner) {
                const rewardToPartner = {
                  partner_id: referralOwner.id,
                  event_date: upReserv.event_date,
                  reservation_no: upReserv.reservation_no,
                  reservation_type: "USER_ORDER",
                  transaction_type: "C",
                  total_amount: partnerReward,
                  status: "REWARD_REFERRAL",
                };
                console.log(rewardToPartner);

                const respWallet = await wallethistory.findOrCreateWallet(
                  { reservation_no: upReserv.reservation_no },
                  rewardToPartner,
                  { transaction: t }
                );

                console.log("respWallet referral reward");
                console.log(respWallet);
                if (respWallet.success !== true) {
                  console.log("Gagal insert ke wallet referral reward");
                  return { success: respWallet.success, message: "Data exist referral reward", data: respWallet.data };
                }
              }
            }

            // ---- Reward untuk user yang share ----
            let userShareReward = 0;
            console.log("upReserv.share_link_id : " + upReserv.share_link_id);
            if (upReserv.share_link_id) {
              console.log("Ada share link, reward ke user yang share");
              userShareReward = newCountTotal * (userSharePercent / 100);
              
              const shareUser = await ShareLink.findOne({
                where: { id: upReserv.share_link_id },
                transaction: t,
              });

              if (shareUser) {
                const rewardToUserShare = {
                  partner_id: shareUser.share_by_id,
                  event_date: upReserv.event_date,
                  reservation_no: upReserv.reservation_no,
                  reservation_type: "USER_ORDER",
                  transaction_type: "C",
                  total_amount: userShareReward,
                  status: "REWARD_SHARE",
                };
                console.log(rewardToUserShare);

                const respWallet = await wallethistory.findOrCreateWallet(
                  { reservation_no: upReserv.reservation_no },
                  rewardToUserShare,
                  { transaction: t }
                );

                console.log("respWallet share link");
                console.log(respWallet);
                if (respWallet.success !== true) {
                  console.log("Gagal insert ke wallet share link");
                  return { success: respWallet.success, message: "Data exist share link", data: respWallet.data };
                }
              }
            }

            // ---- Reward untuk user discount ----
            const userDiscountReward = newCountTotal * (userDiscountPercent / 100);
            console.log("userDiscountPercent: " + userDiscountPercent);
            if (userDiscountPercent > 0) {
              console.log("Ada discount, tambahkan discount ke user");
              const rewardToUserShare = {
                partner_id: upReserv.partner_id,
                event_date: upReserv.event_date,
                reservation_no: upReserv.reservation_no,
                reservation_type: "USER_ORDER",
                transaction_type: "D",
                total_amount: userDiscountReward,
                status: "REWARD_DISCOUNT",
              };
              console.log(rewardToUserShare);

              const respWallet = await wallethistory.findOrCreateWallet(
                { reservation_no: upReserv.reservation_no },
                rewardToUserShare,
                { transaction: t }
              );

              console.log("respWallet user discount");
              console.log(respWallet);
              if (respWallet.success !== true) {
                console.log("Gagal insert ke wallet user discount");
                return { success: respWallet.success, message: "Data exist add discount ke user", data: respWallet.data };
              }
            }

            // ---- Admin order fee ----
            const appFeeReward = newCountTotal * (appFeePercent / 100);
            console.log("appFeePercent: " + appFeePercent);
            if (appFeePercent > 0) {
              console.log("Ada admin order fee, tambahkan discount ke user");
              const otherFee = {
                partner_id: upReserv.partner_id,
                event_date: upReserv.event_date,
                reservation_no: upReserv.reservation_no,
                reservation_type: "USER_ORDER",
                transaction_type: "D",
                total_amount: appFeeReward,
                status: "OTHERS_FEE",
              };
              console.log(otherFee);

              const respWallet = await wallethistory.findOrCreateWallet(
                { reservation_no: upReserv.reservation_no },
                otherFee,
                { transaction: t }
              );

              console.log("respWallet admin order fee");
              console.log(respWallet);
              if (respWallet.success !== true) {
                console.log("Gagal insert ke wallet admin order fee");
                return { success: respWallet.success, message: "Data exist admin order fee", data: respWallet.data };
              }
            }

            // ---- Hitung saldo akhir partner ----
            console.log("Hitung saldo akhir partner");
            const userDiscount = newCountTotal * (userDiscountPercent / 100);
            const appFee = newCountTotal * (appFeePercent / 100);
            console.log("userDiscount: " + userDiscount);
            console.log("partnerReward: " + partnerReward);
            console.log("userShareReward : " + userShareReward);
            console.log("appFee : " + appFee);

            const walletAmount = newCountTotal - (userDiscount + partnerReward + userShareReward + appFee);
            const objBalance = {
              partner_id: upReserv.partner_id,
              event_date: upReserv.event_date,
              reservation_no: upReserv.reservation_no,
              reservation_type: "USER_ORDER",
              transaction_type: "C",
              total_amount: walletAmount,
              status: statusCode,
            };
            console.log("Obj balance");
            console.log(objBalance);

            const respWallet = await wallethistory.findOrCreateWallet(
              { reservation_no: upReserv.reservation_no },
              objBalance,
              { transaction: t }
            );

            console.log("respWallet hitung saldo akhir partner");
            console.log(respWallet);
            if (respWallet.success !== true) {
              console.log("Gagal insert ke wallet hitung saldo akhir partner");
              return { success: respWallet.success, message: "Data exist hitung saldo akhir partner", data: respWallet.data };
            }

            const objParamPoint = {
              user_id: upReserv.partner_id,
              reservation_no: upReserv.reservation_no,
              reservation_date: upReserv.reservation_date,
              total_price: upReserv.total_price,
            };
            
            await pointprocess.setPoint(objParamPoint, { transaction: t });
          }

          // 4️⃣ Commit semua perubahan
          await t.commit();
          console.log("Transaction has been committed by walley history");

          let message = `Reservasi ${reservationNo} sudah selesai.`;
          return { success: true, message, data: upReserv };
        }

        // Jika bukan selesai, langsung commit
        await t.commit();
        console.log("Transaction has been committed by update");

        let message = "Invoice berhasil diubah.";
        if (
          statusCode === "ORDER_CANCEL_BY_PARTNER" ||
          statusCode === "ORDER_CANCEL_BY_USER"
        ) {
          message = `Reservasi ${reservationNo} dibatalkan.`;
        }
        return { success: true, message, data: upReserv };
      } catch (err) {
        // Rollback jika ada error
        await t.rollback();
        console.error("Transaction failed:", err);
        return {
          success: false,
          message: "Gagal memproses invoice",
          data: err.message,
        };
      }
    } catch (error) {
      console.error("Transaction failed:", err);
      throw error;
    }
  },

  updateStatusReservationGlobal: async (req) => {
    try {
      const {
        reservationNo,
        reservationType,
        statusCode,
        totalDp,
        totalDiscount,
        totalPpn,
        userId,
      } = req;

      let transactionStatusCode = "NEW";

      if (statusCode == "ORDER_COMPLETED") {
        transactionStatusCode = "SUCCESS";
      } else if (statusCode == "ORDER_CANCEL_BY_PARTNER") {
        transactionStatusCode = "CANCEL";
      } else if (statusCode == "ORDER_CANCEL_BY_USER") {
        transactionStatusCode = "CANCEL";
      } else if (statusCode == "ORDER_DP_REQUEST") {
        transactionStatusCode = "NEW";
      } else if (statusCode == "ORDER_DP_COMPLETED") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_PARTNER_CONFIRM") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_REPAYMENT_REQUEST") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_PAYMENT_COMPLETED") {
        transactionStatusCode = "ON_PROCESS";
      }

      // total dp blum dieksekusi
      var objReservation = {
        status_code: statusCode,
        // total_down_payment: totalDp,
        transaction_status_code: transactionStatusCode,
        updated_at: moment().utcOffset(0),
        updated_by: userId,
      };

      if (totalDp) {
        objReservation.total_down_payment = totalDp;
      }

      if (totalDiscount) {
        objReservation.total_discount = totalDiscount;
      }

      if (totalPpn) {
        objReservation.total_ppn = totalPpn;
      }

      console.log(JSON.stringify(objReservation), "objReservation");
      console.log(userId);
      console.log(reservationNo);

      return Reservation.update(objReservation, {
        where: { user_id: userId, reservation_no: reservationNo },
      })
        .then(async ([updated]) => {
          console.log("updated reservation global: " + updated);

          if (updated === 0) {
            return { success: false, message: "Invoice gagal diubah. Kamu tidak punya izin!", data: {} };
          }

          const upReserv = await Reservation.findOne({
            where: { reservation_no: reservationNo },
          });
          console.log(JSON.stringify(upReserv), "upReserv");

          const history = {
            status_code: statusCode,
            reservation_id: upReserv.id,
            updatedcreated_at: moment().utcOffset(0),
            created_by: userId,
          };
          const upHistory = await ReservationStatusHistory.create(history);

          console.log("ini ke wallet");
          console.log("ini reservation_type " + upReserv.reservation_type);

          // if(statusCode == "ORDER_DP_COMPLETED" || "ORDER_PAYMENT_COMPLETED")
          // {
          //   // create payment function into db payment

          // }

          if (statusCode == "ORDER_COMPLETED") {
            if (upReserv.reservation_type == "MANUAL_ORDER") {
              console.log("tambahkan saldo ke wallet. ini manual tipe");
              //fee order set 2 %
              const feeSetting = await appSetting.findOne({
                where: { setting_name: "ORDER_FEE" },
              });

              const ppn =
                upReserv.total_ppn == null
                  ? parseInt(0)
                  : parseInt(upReserv.total_ppn);
              console.log("upReserv.total_price " + upReserv.total_price);
              console.log("upReserv.total_discount " + upReserv.total_discount);
              console.log("upReserv.total_ppn " + ppn);
              var countTotal =
                upReserv.total_price - upReserv.total_discount + ppn;
              console.log("countTotal " + countTotal);

              var walletAmount = countTotal - countTotal * (parseInt(0) / 100);
              console.log("walletAmount ", +walletAmount);

              var objBalance = {
                partner_id: upReserv.partner_id,
                event_date: upReserv.event_date,
                reservation_no: upReserv.reservation_no,
                reservation_type: upReserv.reservation_type,
                transaction_type: "C",
                total_amount: walletAmount,
                status: statusCode,
              };

              var objParam = {
                reservation_no: upReserv.reservation_no,
              };

              const insertWallet = await wallethistory.findOrCreateWallet(
                objParam,
                objBalance
              );
              console.log("insertWallet " + JSON.stringify(insertWallet));

              var objParamPoint = {
                user_id: upReserv.partner_id,
                reservation_no: upReserv.reservation_no,
                reservation_date: upReserv.reservation_date,
                total_price: upReserv.total_price,
              };
              const pointinput = await pointprocess.setPoint(objParamPoint);
            } else {
              console.log("tambahkan saldo ke wallet. ini user tipe");
              //fee order set 2 %
              const feeSetting = await appSetting.findOne({
                where: { setting_name: "ORDER_FEE" },
              });

              const ppn =
                upReserv.total_ppn == null
                  ? parseInt(0)
                  : parseInt(upReserv.total_ppn);
              console.log("upReserv.total_price " + upReserv.total_price);
              console.log("upReserv.total_discount " + upReserv.total_discount);
              console.log("upReserv.total_ppn " + ppn);
              var countTotal =
                upReserv.total_price - upReserv.total_discount + ppn;
              console.log("countTotal " + countTotal);

              var walletAmount =
                countTotal -
                countTotal * (parseInt(feeSetting.setting_value) / 100);
              console.log("walletAmount ", +walletAmount);

              var objBalance = {
                partner_id: upReserv.partner_id,
                event_date: upReserv.event_date,
                reservation_no: upReserv.reservation_no,
                reservation_type: upReserv.reservation_type,
                transaction_type: "C",
                total_amount: walletAmount,
                status: statusCode,
              };

              var objParam = {
                reservation_no: upReserv.reservation_no,
              };

              const insertWallet = await wallethistory.findOrCreateWallet(
                objParam,
                objBalance
              );
              console.log("insertWallet " + JSON.stringify(insertWallet));

              var objParamPoint = {
                user_id: upReserv.partner_id,
                reservation_no: upReserv.reservation_no,
                reservation_date: upReserv.reservation_date,
                total_price: upReserv.total_price,
              };
              const pointinput = await pointprocess.setPoint(objParamPoint);
            }
          }

          if (
            statusCode == "ORDER_CANCEL_BY_PARTNER" ||
            statusCode == "ORDER_CANCEL_BY_USER"
          ) {
            return {
              success: true,
              message: "Reservasi " + reservationNo + " Dibatalkan",
              data: upReserv,
            };
          }

          if (statusCode == "ORDER_COMPLETED") {
            return {
              success: true,
              message: "Reservasi " + reservationNo + " Sudah Selesai",
              data: upReserv,
            };
          }

          // return { success: true, message: "Invoice " +reservationNo+ " Berhasil Dikirim Ke Email", data: upReserv } })
          return {
            success: true,
            message:
              "Invoice " + reservationNo + " Berhasil Ubah Status Booking",
            data: upReserv,
          };
        })
        .catch((err) => {
          return { success: false, message: "Invoice Gagal diubah", data: err };
        });
    } catch (error) {
      throw error;
    }
  },

  updateStatusReservationGlobalAdmin: async (req) => {
    try {
      const {
        reservationNo,
        reservationType,
        statusCode,
        totalDp,
        totalDiscount,
        totalPpn,
        userId,
      } = req;

      let transactionStatusCode = "NEW";

      if (statusCode == "ORDER_COMPLETED") {
        transactionStatusCode = "SUCCESS";
      } else if (statusCode == "ORDER_CANCEL_BY_PARTNER") {
        transactionStatusCode = "CANCEL";
      } else if (statusCode == "ORDER_CANCEL_BY_USER") {
        transactionStatusCode = "CANCEL";
      } else if (statusCode == "ORDER_DP_REQUEST") {
        transactionStatusCode = "NEW";
      } else if (statusCode == "ORDER_DP_COMPLETED") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_PARTNER_CONFIRM") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_REPAYMENT_REQUEST") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_PAYMENT_COMPLETED") {
        transactionStatusCode = "ON_PROCESS";
      }

      // total dp blum dieksekusi
      var objReservation = {
        status_code: statusCode,
        // total_down_payment: totalDp,
        transaction_status_code: transactionStatusCode,
        updated_at: moment().utcOffset(0),
        updated_by: userId,
      };

      if (totalDp) {
        objReservation.total_down_payment = totalDp;
      }

      if (totalDiscount) {
        objReservation.total_discount = totalDiscount;
      }

      if (totalPpn) {
        objReservation.total_ppn = totalPpn;
      }

      console.log(JSON.stringify(objReservation), "objReservation");

      return Reservation.update(objReservation, {
        where: { reservation_no: reservationNo },
      })
        .then(async ([updated]) => {
          console.log("updated reservation global: " + updated);

          // if (updated === 0) {
          //   return { success: false, message: "Invoice gagal diubah. Kamu tidak punya izin!", data: {} };
          // }

          const upReserv = await Reservation.findOne({
            where: { reservation_no: reservationNo },
          });
          console.log(JSON.stringify(upReserv), "upReserv");

          const history = {
            status_code: statusCode,
            reservation_id: upReserv.id,
            updatedcreated_at: moment().utcOffset(0),
            created_by: userId,
          };
          const upHistory = await ReservationStatusHistory.create(history);

          console.log("ini ke wallet");
          console.log("ini reservation_type " + upReserv.reservation_type);

          // if(statusCode == "ORDER_DP_COMPLETED" || "ORDER_PAYMENT_COMPLETED")
          // {
          //   // create payment function into db payment

          // }

          if (statusCode == "ORDER_COMPLETED") {
            if (upReserv.reservation_type == "MANUAL_ORDER") {
              console.log("tambahkan saldo ke wallet. ini manual tipe");
              //fee order set 2 %
              const feeSetting = await appSetting.findOne({
                where: { setting_name: "ORDER_FEE" },
              });

              const ppn =
                upReserv.total_ppn == null
                  ? parseInt(0)
                  : parseInt(upReserv.total_ppn);
              console.log("upReserv.total_price " + upReserv.total_price);
              console.log("upReserv.total_discount " + upReserv.total_discount);
              console.log("upReserv.total_ppn " + ppn);
              var countTotal =
                upReserv.total_price - upReserv.total_discount + ppn;
              console.log("countTotal " + countTotal);

              var walletAmount = countTotal - countTotal * (parseInt(0) / 100);
              console.log("walletAmount ", +walletAmount);

              var objBalance = {
                partner_id: upReserv.partner_id,
                event_date: upReserv.event_date,
                reservation_no: upReserv.reservation_no,
                reservation_type: upReserv.reservation_type,
                transaction_type: "C",
                total_amount: walletAmount,
                status: statusCode,
              };

              var objParam = {
                reservation_no: upReserv.reservation_no,
              };

              const insertWallet = await wallethistory.findOrCreateWallet(
                objParam,
                objBalance
              );
              console.log("insertWallet " + JSON.stringify(insertWallet));

              var objParamPoint = {
                user_id: upReserv.partner_id,
                reservation_no: upReserv.reservation_no,
                reservation_date: upReserv.reservation_date,
                total_price: upReserv.total_price,
              };
              const pointinput = await pointprocess.setPoint(objParamPoint);
            } else {
              console.log("tambahkan saldo ke wallet. ini user tipe");
              //fee order set 2 %
              const feeSetting = await appSetting.findOne({
                where: { setting_name: "ORDER_FEE" },
              });

              const ppn =
                upReserv.total_ppn == null
                  ? parseInt(0)
                  : parseInt(upReserv.total_ppn);
              console.log("upReserv.total_price " + upReserv.total_price);
              console.log("upReserv.total_discount " + upReserv.total_discount);
              console.log("upReserv.total_ppn " + ppn);
              var countTotal =
                upReserv.total_price - upReserv.total_discount + ppn;
              console.log("countTotal " + countTotal);

              var walletAmount =
                countTotal -
                countTotal * (parseInt(feeSetting.setting_value) / 100);
              console.log("walletAmount ", +walletAmount);

              var objBalance = {
                partner_id: upReserv.partner_id,
                event_date: upReserv.event_date,
                reservation_no: upReserv.reservation_no,
                reservation_type: upReserv.reservation_type,
                transaction_type: "C",
                total_amount: walletAmount,
                status: statusCode,
              };

              var objParam = {
                reservation_no: upReserv.reservation_no,
              };

              const insertWallet = await wallethistory.findOrCreateWallet(
                objParam,
                objBalance
              );
              console.log("insertWallet " + JSON.stringify(insertWallet));

              var objParamPoint = {
                user_id: upReserv.partner_id,
                reservation_no: upReserv.reservation_no,
                reservation_date: upReserv.reservation_date,
                total_price: upReserv.total_price,
              };
              const pointinput = await pointprocess.setPoint(objParamPoint);
            }
          }

          if (
            statusCode == "ORDER_CANCEL_BY_PARTNER" ||
            statusCode == "ORDER_CANCEL_BY_USER"
          ) {
            return {
              success: true,
              message: "Reservasi " + reservationNo + " Dibatalkan",
              data: upReserv,
            };
          }

          if (statusCode == "ORDER_COMPLETED") {
            return {
              success: true,
              message: "Reservasi " + reservationNo + " Sudah Selesai",
              data: upReserv,
            };
          }

          // return { success: true, message: "Invoice " +reservationNo+ " Berhasil Dikirim Ke Email", data: upReserv } })
          return {
            success: true,
            message:
              "Invoice " + reservationNo + " Berhasil Ubah Status Booking",
            data: upReserv,
          };
        })
        .catch((err) => {
          return { success: false, message: "Invoice Gagal diubah", data: err };
        });
    } catch (error) {
      throw error;
    }
  },

  sendEmailReservationManual: async (req) => {
    try {
      const {
        reservationNo,
        reservationType,
        statusCode,
        totalDp,
        totalDiscount,
        totalPpn,
        userId,
      } = req;

      let transactionStatusCode = "NEW";

      if (statusCode == "ORDER_COMPLETED") {
        transactionStatusCode = "SUCCESS";
      } else if (statusCode == "ORDER_CANCEL_BY_PARTNER") {
        transactionStatusCode = "CANCEL";
      } else if (statusCode == "ORDER_CANCEL_BY_USER") {
        transactionStatusCode = "CANCEL";
      } else if (statusCode == "ORDER_DP_REQUEST") {
        transactionStatusCode = "NEW";
      } else if (statusCode == "ORDER_DP_COMPLETED") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_PARTNER_CONFIRM") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_REPAYMENT_REQUEST") {
        transactionStatusCode = "ON_PROCESS";
      } else if (statusCode == "ORDER_PAYMENT_COMPLETED") {
        transactionStatusCode = "ON_PROCESS";
      }

      // total dp blum dieksekusi
      var objReservation = {
        status_code: statusCode,
        // total_down_payment: totalDp,
        transaction_status_code: transactionStatusCode,
        updated_at: moment().utcOffset(0),
        updated_by: userId,
      };

      if (totalDp) {
        objReservation.total_down_payment = totalDp;
      }

      if (totalDiscount) {
        objReservation.total_discount = totalDiscount;
      }

      if (totalPpn) {
        objReservation.total_ppn = totalPpn;
      }

      console.log(JSON.stringify(objReservation), "objReservation");

      return Reservation.update(objReservation, {
        where: { reservation_no: reservationNo },
      })
        .then(async (updated) => {
          const upReserv = await Reservation.findOne({
            where: { reservation_no: reservationNo },
          });
          console.log(JSON.stringify(upReserv), "upReserv");

          // const history = {status_code: statusCode, reservation_id: upReserv.id, updatedcreated_at: moment().utcOffset(0), created_by: userId };
          // const upHistory = await ReservationStatusHistory.create(history);

          // console.log("ini ke wallet");
          // console.log("ini reservation_type " + upReserv.reservation_type);

          // if(statusCode == "ORDER_COMPLETED")
          // {
          //   if (reservationType == "MANUAL_ORDER") {
          //     console.log("tambahkan saldo ke wallet");
          //     //fee order set 0 %
          //     const feeSetting = await appSetting.findOne({
          //       where: { setting_name: "ORDER_FEE" }
          //     });

          //     var countTotal = (upReserv.total_price - upReserv.total_discount) + parseInt(upReserv.total_ppn);
          //     console.log("countTotal " + countTotal);

          //     var walletAmount = countTotal - (countTotal * (parseInt(0) / 100));
          //     console.log("walletAmount ", + walletAmount);

          //     var objBalance = {
          //       partner_id: upReserv.partner_id,
          //       event_date: upReserv.event_date,
          //       reservation_no: upReserv.reservation_no,
          //       reservation_type: upReserv.reservation_type,
          //       transaction_type: "C",
          //       total_amount: walletAmount,
          //       status: statusCode
          //     }

          //     var objParam = {
          //       reservation_no: upReserv.reservation_no
          //     }

          //     const insertWallet = await wallethistory.findOrCreateWallet(objParam, objBalance);
          //     console.log("insertWallet "  + JSON.stringify(insertWallet));
          //   }
          // }

          if (
            statusCode == "ORDER_CANCEL_BY_PARTNER" ||
            statusCode == "ORDER_CANCEL_BY_USER"
          ) {
            return {
              success: false,
              message:
                "Reservasi " +
                reservationNo +
                " Sudah dibatalkan. Tidak bisa kirim email",
              data: upReserv,
            };
          }

          // if (statusCode == "ORDER_COMPLETED") {
          //   return { success: true, message: "Reservasi " +reservationNo+ " Sudah Selesai", data: upReserv }
          // }

          // return { success: true, message: "Invoice " +reservationNo+ " Berhasil Dikirim Ke Email", data: upReserv } })
          return {
            success: true,
            message: "Invoice " + reservationNo + " Berhasil dikirim via email",
            data: upReserv,
          };
        })
        .catch((err) => {
          return {
            success: false,
            message: "Invoice Gagal dikirim",
            data: err,
          };
        });
    } catch (error) {
      throw error;
    }
  },

  updateTotalInvoiceManual: async (req) => {
    try {
      const {
        reservationNo,
        reservationType,
        totalDp,
        totalDiscount,
        totalPpn,
        userId,
      } = req;

      // total dp blum dieksekusi
      var objReservation = {
        updated_at: moment().utcOffset(0),
        updated_by: userId,
      };

      const upReserv = await Reservation.findOne({
        where: { reservation_no: reservationNo },
      });
      console.log(JSON.stringify(upReserv), "upReserv");

      if (totalDiscount) {
        objReservation.total_discount = parseInt(
          totalDiscount.replace(/[^0-9,-]/g, "")
        );
      }

      if (totalPpn) {
        objReservation.total_ppn = parseInt(totalPpn.replace(/[^0-9,-]/g, ""));
      }

      if (totalDp) {
        objReservation.total_down_payment = parseInt(
          totalDp.replace(/[^0-9,-]/g, "")
        );
      }

      console.log("objReservation");
      console.log(objReservation);

      return Reservation.update(objReservation, {
        where: { reservation_no: reservationNo },
      })
        .then(async (updated) => {
          if (reservationType == "MANUAL_ORDER") {
            return {
              success: true,
              message: "Berhasil Ubah Invoice",
              data: upReserv,
            };
          }
        })
        .catch((err) => {
          return {
            success: false,
            message: "Total Invoice Gagal Diubah",
            data: err,
          };
        });
    } catch (error) {
      throw error;
    }
  },

  updateReservation: async (data) => {
    try {
      const {
        id,
        reservationType,
        reservationNo,
        reservationDate,
        partnerId,
        userId,
        packageId,
        eventDate,
        eventTime,
        eventAddress,
        name,
        provinsi,
        city,
        address,
        phoneNo,
        waNo,
        email,
        socialMedia,
        otherDescription,
      } = data;

      // get services from package partner
      var package = await PackageHeader.findOne({
        where: { id: packageId },
      });

      if (package === null) {
        return {
          success: false,
          message: "Jasa/Produk Tidak Ditemukan",
        };
      }

      if (reservationType == "MANUAL_ORDER") {
        if (package.partner_id != partnerId) {
          return {
            success: false,
            message: "Partner Tidak Bisa Menggunakan Jasa/Produk Yang Dipilih.",
            data: {},
          };
        }
      }

      console.log("package.partner_id");
      console.log(package.partner_id);

      console.log("partnerId");
      console.log(partnerId);

      var packageDetails = await PackageDetail.findAll({
        where: { package_header_id: packageId },
      });

      if (packageDetails === null) {
        return {
          success: false,
          message: "Detail Jasa/Produk Tidak Ditemukan",
        };
      }

      var reservationData = {
        reservation_no: reservationNo,
        reservation_date: reservationDate,
        reservation_type: reservationType,
        user_id: userId,
        partner_id: package.partner_id,
        category_id: package.category_id,
        package_id: packageId,
        service_id: package.service_id,
        name: name,
        package_name: package.name,
        description: package.description,
        event_date: eventDate,
        event_time: eventTime,
        duration: package.duration,
        event_address: eventAddress,
        total_price: package.totalprice,
        total_payment: package.totalprice,
      };
      console.log("resv data");
      console.log(reservationData);

      return Reservation.update(reservationData, {
        where: { reservation_no: reservationNo },
        defaults: reservationData,
      }).then(async (updated) => {
        var resvContact = {
          reservation_no: reservationNo,
          name: name,
          provinsi: provinsi,
          city: city,
          address: address,
          phone_no: phoneNo,
          wa_no: waNo,
          email: email,
          social_media: socialMedia,
          other_description: otherDescription,
        };

        console.log("resv contact");
        console.log(resvContact);

        await ReservationContact.update(resvContact, {
          where: { reservation_id: id },
        });

        const upReserv = await Reservation.findOne({
          where: { reservation_no: reservationNo },
          include: [
            {
              model: ReservationContact,
              as: "reservation_contact",
            },
          ],
        });
        console.log(JSON.stringify(upReserv), "upReserv");

        return {
          success: true,
          message: "Data Reservasi " + reservationNo + " Berhasil Diubah",
          data: upReserv,
        };
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  delete: async (data) => {
    try {
      const { partner_id, id } = data;

      return Reservation.destroy({
        where: {
          id: id,
          partner_id: partner_id,
        },
      })
        .then(async (deleted) => {
          console.log("deleted");
          console.log(deleted);
          if (deleted == 0) {
            return {
              success: true,
              message: "Reservasi Ini Tidak Ditemukan",
              data: [],
            };
          } else {
            return {
              success: true,
              message: "Reservasi Berhasil Dihapus",
              data: [],
            };
          }
        })
        .catch((err) => {
          console.log(err);
          return {
            success: false,
            message: "Reservasi Gagal Dihapus",
            data: err,
          };
        });
    } catch (error) {
      console.log(error);
      throw error;
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
      const { partnerId, date, month, year } = param;
      console.log(param);
      var agenda = {};

      const dateCondition = date
          ? `AND date(rr.event_date) = date('${date}')`
          : `
      AND extract(MONTH from rr.event_date) = ${month}
      AND extract(YEAR from rr.event_date) = ${year}
      `;

      var query =
        `
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
          where rr.partner_id = ${partnerId}
          ${dateCondition}
          and rr.transaction_status_code in ('CANCEL', 'NEW', 'ON_PROCESS', 'SUCCESS')
         )  a
         LEFT   JOIN LATERAL (
            SELECT json_agg(y) AS items
            FROM  (select 
               (ph.name || ' at ' || r.event_address) as name,
               event_time::text event_time,
               ph.name package_name,
               r.name,
               r.reservation_no,
               r.event_date,
               r.event_address,
               r.duration,   

               (
                 r.event_time 
                 + (r.duration || ' minutes')::interval
               ) as event_time_end,

               (date(r.event_date) + r.event_time) as event_date_start,
               (
                  date(r.event_date) + r.event_time
                  + (r.duration || ' minutes')::interval
               ) as event_date_end,
              
               r.description,    
               r.total_price,
               r.total_payment,
               r.total_discount,
               r.total_down_payment,
               r.status_code,
               r.transaction_status_code,
               50 height,
               r_details.det details
               from reservation r
               inner join partner_package_header ph
               on r.package_id = ph.id
               inner join lateral
                 (
                    SELECT json_agg(json_build_object(
                      'sub_service_title', sub_service_title,
                      'description', description,
                      'price', price,
                      'duration', duration,
                      'additional_services', additional_services,
                      'terms', terms
                        )
                    ) det
                    FROM reservation_service td 
                    WHERE td.reservation_id = r.id
                 ) r_details on true
                WHERE date(r.event_date) = date(a.event_date)
                and r.partner_id = a.partner_id
                and r.transaction_status_code in ('CANCEL', 'NEW', 'ON_PROCESS', 'SUCCESS')
                order by r.event_time desc
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
            and r.transaction_status_code in ('CANCEL', 'NEW', 'ON_PROCESS', 'SUCCESS')
           ) x
         ) c ON true`;
      return sequelize
        .query(query, { type: sequelize.QueryTypes.SELECT })
        .then((results) => {
          if (results === null) {
            return new { items: [], markeddates: [], message: 'No data this month' }();
          } else {
            return results[0];
          }
        });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  findReservationsGroupByCategory: async (where) => {
    var reservations = await sequelize.query(
      `		select 
        json_agg(
          json_build_object(
            category, items
          )
        ) d
      FROM (select 
             id category_id,
       rr.description category
            from category rr
        )  a
      LEFT JOIN LATERAL (
        SELECT json_agg(x) AS items
        FROM  (select 
        rv.id, 
        reservation_no, 
        reservation_date, 
        user_id, 
        usr.name user_name,
        usr.picture user_picture,
        partner_id, 
        prt.name partner_name,
        prt.picture partner_picture,
        rv.category_id, 
        cat.description category,
        service_id, 
        srv.description service,
        rv.name,
        rv.package_name,
        event_date, 
        event_time, 
        event_address, 
        total_price, 
        total_discount, 
        total_payment, 
        total_down_payment, 
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
        WHERE cat.description = a.category 
        ` +
        where +
        `
          order by event_date desc
          ) x
        ) c ON true;`,
      {
        raw: true,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (reservations.length > 0) {
      return !reservations
        ? { success: false, message: "Reservasi Tidak Ditemukan!", data: {} }
        : {
            success: true,
            message: "Reservasi Berhasil Ditemukan",
            data: reservations[0].d,
          };
    } else {
      return {
        success: false,
        message: "Reservasi Tidak Ditemukan, Ada Kesalahan Server!",
        data: err,
      };
    }
  },

  findReservationsGroupByCategories: async (where, limitItem, page) => {
    var reservations = await sequelize.query(
      `		select 
        json_agg(
          json_build_object(
            category, items
          )
        ) d
      FROM (select 
             id category_id,
       rr.description category
            from category rr
        )  a
      LEFT JOIN LATERAL (
        SELECT json_agg(x) AS items
        FROM  (select 
        rv.id, 
        reservation_no, 
        reservation_date, 
        user_id, 
        usr.name user_name,
        usr.picture user_picture,
        partner_id, 
        prt.name partner_name,
        prt.picture partner_picture,
        rv.category_id, 
        cat.description category,
        service_id, 
        srv.description service,
        rv.name,
        rv.package_name,
        event_date, 
        event_time, 
        event_address, 
        total_price, 
        total_discount, 
        total_payment, 
        total_down_payment, 
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
        WHERE cat.description = a.category 
        ` +
        where +
        `
          order by event_date desc
          ) x
        ) c ON true;`,
      {
        raw: true,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const pageCount = Math.ceil(reservations.length / limitItem);
    let pages = parseInt(page);
    if (!pages) {
      pages;
    }
    if (pages > pageCount) {
      pages = pageCount;
    }

    if (reservations.length > 0) {
      // let data = [{ "data 1": [{ id: 1, name: "John" }, { id: 2, name: "James" }, { id: 3, name: "James" }] }, { "data 2": [{ id: 1, name: "May" }, { id: 2, name: "Joe" }, { id: 3, name: "Din" }] },]
      let limitList = reservations[0].d.map((v) => {
        let obj = {};
        for (let [k, arr] of Object.entries(v))
          obj[k] =
            arr != null
              ? arr.slice(pages * limitItem - limitItem, pages * limitItem)
              : null;

        return obj;
      });

      return !reservations
        ? {
            success: false,
            message: "Reservasi Tidak Ditemukan!",
            data: {},
            page: pages,
            pageCount: pageCount,
          }
        : {
            success: true,
            message: "Reservasi Berhasil Ditemukan",
            data: limitList,
            page: pages,
            pageCount: pageCount,
          };
    } else {
      return {
        success: false,
        message: "Reservasi Tidak Ditemukan, Ada Kesalahan Server!",
        data: err,
      };
    }
  },

  findReservationSummary: async (partnerId) => {
    var reservations = await sequelize.query(
      `SELECT
                coalesce(all_order, 0) "ALL_ORDER",
                coalesce(order_waiting_confirm, 0) "ORDER_NEW",
                coalesce(order_partner_confirm, 0) "ORDER_PARTNER_CONFIRM",
                coalesce(order_waiting_confirm, 0) + coalesce(order_partner_confirm, 0) + coalesce(payment_request, 0) "ORDER_NEED_PAYMENT",
                coalesce(order_dp_completed, 0) "ORDER_DP_COMPLETED",
                coalesce(order_payment_completed, 0) "ORDER_PAYMENT_COMPLETED",
                coalesce(order_dp_completed, 0) + coalesce(order_payment_completed, 0) "ORDER_PROCESS",
                coalesce(order_completed, 0) "ORDER_COMPLETED"
                FROM hai_user part
                left join lateral (
                  SELECT 
                    count(reservation_no) all_order
                  from reservation oal
                  where oal.partner_id = part.id
                ) sum0 on true
                left join lateral (
                  SELECT 
                    count(reservation_no) order_waiting_confirm
                  from reservation orn
                  where orn.partner_id = part.id
                  and orn.status_code = 'ORDER_WAITING_CONFIRM'
                ) sum1 on true
                left join lateral (
                  SELECT count(reservation_no) order_partner_confirm
                  from reservation opc
                  where opc.partner_id = part.id
                  and opc.status_code = 'ORDER_PARTNER_CONFIRM'
                ) sum2 on true
                left join lateral (
                  SELECT count(reservation_no) order_dp_completed
                  from reservation odc
                  where odc.partner_id = part.id
                  and odc.status_code = 'ORDER_DP_COMPLETED'
                ) sum3 on true
                left join lateral (
                  SELECT count(reservation_no) order_payment_completed
                  from reservation oyc
                  where oyc.partner_id = part.id
                  and oyc.status_code = 'ORDER_PAYMENT_COMPLETED'
                ) sum4 on true
                left join lateral (
                  SELECT count(reservation_no) order_completed
                  from reservation oc
                  where oc.partner_id = part.id
                  and oc.status_code = 'ORDER_COMPLETED'
                ) sum5 on true
                left join lateral (
                  SELECT count(reservation_no) payment_request
                  from reservation oc
                  where oc.partner_id = part.id
                  and oc.status_code = 'PAYMENT_REQUEST'
                ) sum6 on true
              WHERE part.type = 2
              and part.id = ` +
        partnerId +
        `;`,
      {
        raw: true,
        type: sequelize.QueryTypes.SELECT,
      }
    );
    // console.log(reservations);
    if (reservations.length > 0) {
      return !reservations
        ? {
            success: false,
            message: "Statistik Reservasi Tidak Ditemukan!",
            data: {},
          }
        : {
            success: true,
            message: "Statistik Reservasi Berhasil Ditemukan",
            data: reservations[0],
          };
    } else {
      return {
        success: false,
        message: "Statistik Reservasi Tidak Ditemukan, Ada Kesalahan Server!",
        data: err,
      };
    }
  },

  findReservationSummaryAdmin: async (partnerId) => {
    var reservations = await sequelize.query(
      `SELECT
              count(*) FILTER (WHERE status_code IS NOT NULL) AS "ALL_ORDER",
              count(*) FILTER (WHERE status_code = 'ORDER_WAITING_CONFIRM') AS "ORDER_NEW",
              count(*) FILTER (WHERE status_code = 'ORDER_PARTNER_CONFIRM') AS "ORDER_PARTNER_CONFIRM",
              (count(*) FILTER (WHERE status_code = 'ORDER_WAITING_CONFIRM')
              + count(*) FILTER (WHERE status_code = 'ORDER_PARTNER_CONFIRM')) AS "ORDER_NEED_PAYMENT",
              count(*) FILTER (WHERE status_code = 'ORDER_DP_COMPLETED') AS "ORDER_DP_COMPLETED",
              count(*) FILTER (WHERE status_code = 'ORDER_PAYMENT_COMPLETED') AS "ORDER_PAYMENT_COMPLETED",
              (count(*) FILTER (WHERE status_code = 'ORDER_DP_COMPLETED')
              + count(*) FILTER (WHERE status_code = 'ORDER_PAYMENT_COMPLETED')) AS "ORDER_PROCESS",
              count(*) FILTER (WHERE status_code = 'ORDER_COMPLETED') AS "ORDER_COMPLETED"
          FROM reservation r
          WHERE r.reservation_type = 'USER_ORDER';
          `,
      {
        raw: true,
        type: sequelize.QueryTypes.SELECT,
      }
    );
    // console.log(reservations);
    if (reservations.length > 0) {
      return !reservations
        ? {
            success: false,
            message: "Statistik Reservasi Tidak Ditemukan!",
            data: {},
          }
        : {
            success: true,
            message: "Statistik Reservasi Berhasil Ditemukan",
            data: reservations[0],
          };
    } else {
      return {
        success: false,
        message: "Statistik Reservasi Tidak Ditemukan, Ada Kesalahan Server!",
        data: err,
      };
    }
  },

  findReservationUserSummary: async (userId) => {
    var reservations = await sequelize.query(
      `SELECT
              coalesce(all_order, 0) "ALL_ORDER",
              coalesce(order_waiting_confirm, 0) "ORDER_NEW",
              coalesce(order_partner_confirm, 0) "ORDER_PARTNER_CONFIRM",
              coalesce(order_waiting_confirm, 0) + coalesce(order_partner_confirm, 0) "ORDER_NEED_PAYMENT",
              coalesce(order_dp_completed, 0) "ORDER_DP_COMPLETED",
              coalesce(order_payment_completed, 0) "ORDER_PAYMENT_COMPLETED",
              coalesce(order_dp_completed, 0) + coalesce(order_payment_completed, 0) "ORDER_PROCESS",
              coalesce(order_completed, 0) "ORDER_COMPLETED"
              FROM hai_user part
              left join lateral (
                SELECT 
                  count(reservation_no) all_order
                from reservation oal
                where oal.user_id = part.id
              ) sum0 on true
              left join lateral (
                SELECT 
                  count(reservation_no) order_waiting_confirm
                from reservation orn
                where orn.user_id = part.id
                and orn.status_code = 'ORDER_WAITING_CONFIRM'
              ) sum1 on true
              left join lateral (
                SELECT count(reservation_no) order_partner_confirm
                from reservation opc
                where opc.user_id = part.id
                and opc.status_code = 'ORDER_PARTNER_CONFIRM'
              ) sum2 on true
              left join lateral (
                SELECT count(reservation_no) order_dp_completed
                from reservation odc
                where odc.user_id = part.id
                and odc.status_code = 'ORDER_DP_COMPLETED'
              ) sum3 on true
              left join lateral (
                SELECT count(reservation_no) order_payment_completed
                from reservation oyc
                where oyc.user_id = part.id
                and oyc.status_code = 'ORDER_PAYMENT_COMPLETED'
              ) sum4 on true
              left join lateral (
                SELECT count(reservation_no) order_completed
                from reservation oc
                where oc.user_id = part.id
                and oc.status_code = 'ORDER_COMPLETED'
              ) sum5 on true
            WHERE part.type = 1
            and part.id = ` +
        userId +
        `;`,
      {
        raw: true,
        type: sequelize.QueryTypes.SELECT,
      }
    );
    // console.log(reservations);
    if (reservations.length > 0) {
      return !reservations
        ? {
            success: false,
            message: "Statistik Reservasi Tidak Ditemukan!",
            data: {},
          }
        : {
            success: true,
            message: "Statistik Reservasi Berhasil Ditemukan",
            data: reservations[0],
          };
    } else {
      return {
        success: false,
        message: "Statistik Reservasi Tidak Ditemukan, Ada Kesalahan Server!",
        data: err,
      };
    }
  },

  findReminder: async (where) => {
    var reservations = await sequelize.query(
      `SELECT 
              rv.id, 
              reservation_no, 
              reservation_date, 
              user_id, 
              usr.name user_name,
              usr.picture user_picture,
              partner_id, 
              prt.name partner_name,
              prt.picture partner_picture,
              rv.category_id, 
              cat.description category,
              service_id, 
              srv.description service,
              rv.name,
              rc.email,
              rc.address,
              rv.package_name,
              rv.description,
              event_date, 
              event_time, 
              event_address, 
              total_price, 
              total_discount, 
              total_payment, 
              total_down_payment,
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
            left join reservation_contact rc on rc.reservation_id = rv.id
            ` +
        where +
        `
            order by event_time asc;`,
      {
        raw: true,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (reservations.length > 0) {
      return !reservations
        ? { success: false, message: "Reminder Tidak Ditemukan!", data: {} }
        : {
            success: true,
            message: "Reminder Berhasil Ditemukan",
            data: reservations,
          };
    } else {
      return { success: false, message: "Reminder Tidak Ditemukan!", data: {} };
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

  findReminderMore: async (where) => {
    console.log(where);
    try {
      var reservations = await sequelize.query(
        `SELECT 
                rv.id, 
                reservation_no, 
                reservation_date, 
                user_id, 
                usr.name user_name,
                usr.picture user_picture,
                partner_id, 
                prt.name partner_name,
                prt.picture partner_picture,
                rv.category_id, 
                cat.description category,
                service_id, 
                srv.description service,
                rv.name,
                rc.email,
                rc.address,
                rv.package_name,
                rv.description,
                event_date, 
                event_time, 
                event_address, 
                total_price, 
                total_discount, 
                total_payment, 
                total_down_payment,
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
              left join reservation_contact rc on rc.reservation_id = rv.id
              ` +
          where +
          `
              order by event_date asc, event_time asc;`,
        {
          raw: true,
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (reservations.length > 0) {
        return !reservations
          ? { success: true, message: "Reminder Tidak Ditemukan!", data: {} }
          : {
              success: true,
              message: "Reminder Berhasil Ditemukan",
              data: reservations,
            };
      } else {
        return {
          success: true,
          message: "Reminder Tidak Ditemukan!",
          data: {},
        };
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
    } catch (error) {
      throw error;
    }
  },

  updateConfirmationPaymentImage: async (req) => {
    try {
      const {
        reservationNo,
        reservationType,
        confirmationPayment,
        userId,
        statusCode
      } = req;

      // total dp blum dieksekusi
      var objReservationConfirmationPayment = {
        confirmation_payment: confirmationPayment,
        status_code: "PAYMENT_REQUEST",
        updated_at: moment().utcOffset(0),
        updated_by: userId,
      };

      console.log("objReservationConfirmationPayment");
      console.log(objReservationConfirmationPayment);

      const transaction = await sequelize.transaction();
      try {
        // Update reservation
        const [
          updated,
        ] = await Reservation.update(objReservationConfirmationPayment, {
          where: { reservation_no: reservationNo },
          transaction: transaction,
        });

        if (updated === 0) {
          return {
            success: false,
            message: "Reservation not found or update failed",
            data: {},
          };
        }

        let upReserv;
        if (reservationType === "USER_ORDER") {
          upReserv = await Reservation.findOne({
            where: { reservation_no: reservationNo },
            transaction: transaction,
          });

          console.log(JSON.stringify(upReserv), "upReserv");

          // data untuk Payment
          const data = {
            userId: upReserv.user_id,
            reservation_no: upReserv.reservation_no,
            total_price: upReserv.total_price,
            total_discount: upReserv.total_discount,
            total_payment: upReserv.total_payment,
            status_code:
              statusCode === "PAYMENT_COMPLETED"
                ? "PAYMENT_COMPLETED"
                : "PAYMENT_DP_REQUEST",
            // payment_channel_code: 0,
            // payment_time_limit: new Date(Date.now() + 24 * 60 * 60 * 1000), // timer 24 jam
          };

          // Buat payment (hanya kalau belum ada)
          const [payment, created] = await Payment.findOrCreate({
            where: { reservation_no: reservationNo },
            defaults: data,
            transaction: transaction,
          });

          if (!created) {
            console.log("Payment sudah ada:", payment.id);
            await payment.update(data, { transaction: transaction });
          } else {
            console.log("Payment baru dibuat:", payment.id);
          }
        }

        // kalau semua berhasil → commit
        await transaction.commit();
        return {
          success: true,
          message: "Success Update Confirmation Payment",
          data: upReserv,
        };
      } catch (err) {
        console.log(err);
        // kalau ada error → rollback
        await transaction.rollback();
        return {
          success: false,
          message: "Confirmation Payment Failed To Update",
          data: err.message,
        };
      }
    } catch (error) {
      throw error;
    }
  },

  createShareLinkService: async (params) => {
    try {
      const { userId, packageId, createdBy } = params;
      console.log("params share link", params);

      if (!userId || !packageId) {
        return {
          success: false,
          message: "userId and packageId required",
          data: {},
        };
      }

      // generate unique code
      const generateShareCode = "sha_" + uuidv4().slice(0, 8);
      console.log("generateShareCode", generateShareCode);

      const data = {
        user_id: userId,
        package_header_id: packageId,
        share_code: generateShareCode,
        created_by: createdBy
      };
      console.log("data create share link", data);

      // insert ke DB pakai Sequelize
      const [shareLink, created] = await ShareLink.findOrCreate({
        where: { share_by_id: userId, package_header_id: packageId },
        defaults: { share_code: generateShareCode, created_by: createdBy }
      });
      console.log("shareLink", shareLink.dataValues.share_code);
      console.log("created", created);
      if (!created) {
        return {
          success: true,
          message: "Code Share Link Sudah Ada",
          data: {
            share_code: shareLink.dataValues.share_code
          },
        };
      }

      return {
        success: true,
        message: "Success Create Share Link",
        data: {
          share_code: shareLink.dataValues.share_code
        },
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "Internal Server Error",
        data: {},
      };
    }
  },

  createResolveLinkService: async (params) => {
    try {
      const { shareCode } = params;
      console.log("params resolve link", params);

      if (!shareCode) {
        return {
          success: false,
          message: "shareCode required",
          data: {},
        };
      }

      // cari di DB pakai Sequelize
      const shareLink = await ShareLink.findOne({
        where: { share_code: shareCode },
        // include: [
        //   {
        //     model: PackageHeader,
        //     attributes: ['id', 'name', 'partner_id', 'totalprice', 'public' ],
        //     include: [
        //       {
        //         model: PackageDetail,
        //       },
        //       {
        //         model: HaiUser,
        //         attributes: ['id', 'name', 'email', 'type']
        //       },
        //     ],
        //   },
        // ],
      });

      if (!shareLink) {
        return {
          success: false,
          message: "Share Link Tidak Ditemukan",
          data: {},
        };
      }

      return {
        success: true,
        message: "Success Resolve Share Link",
        data: shareLink,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "Internal Server Error",
        data: {},
      };
    }
  }
};
