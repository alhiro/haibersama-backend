const resv = require("../services/reservation");
const bank = require("../services/partnerbankaccount");
const term = require("../services/partnerpackage");
const partnerResv = require("../services/partner");
const emailcounter = require("../services/emailcounter");
const getFcmTokens = require("../lib/utils");
const admin = require("firebase-admin");
const transporter = require("../config/email");

const HaiUser = require('../models/haiuser');

const utilility = require("../lib/utils");

const sequelizeTransaction = require("../config/sequelizeTransaction");
const { VERIFY_URL, EMAIL_PASSWORD, EMAIL_USERNAME } = process.env;
const moment = require("moment");
moment.locale('id'); 
const nodemailer = require("nodemailer");
const Hogan = require("hogan.js");
const fs = require("fs");

const path = require('path');
const utils = require('util');
const puppeteer = require('puppeteer');
const hb = require('handlebars');
const readFile = utils.promisify(fs.readFile);
var pdf = require('html-pdf');

exports.createReservation = async function(params, req, res, next) {
    try {
      console.log("response params");
      console.log(params);

      if (params.reservationType === "MANUAL_ORDER") {
        if (params.reservationDate === null) {
          return res.status(400).send({
            code: 400,
            success: false,
            message: "Silahkan Masukkan Tanggal Reservasi",
            data: {},
          });
        }
      }

      if (!params.packageId || params.packageId == 0) {
        return res.status(400).send({
          code: 400,
          success: false,
          message: "Silahkan Pilih Paket Jasa/Produk",
          data: {},
        });
      } else if (!params.eventDate) {
        return res.status(400).send({
          code: 400,
          success: false,
          message: "Tanggal Acara Tidak Ada",
          data: {},
        });
      } else if (!params.eventTime) {
        return res.status(400).send({
          code: 400,
          success: false,
          message: "Waktu Acara Tidak Ada",
          data: {},
        });
      } else if (!params.eventAddress) {
        return res.status(400).send({
          code: 400,
          success: false,
          message: "Alamat Lokasi Acara Tidak Ada / Kosong",
          data: {},
        });
      } else if (!params.name) {
        return res.status(400).send({
          code: 400,
          success: false,
          message: "Nama Tidak Ada / Kosong",
          data: {},
        });
      } else if (!params.phoneNo || !params.waNo) {
        return res.status(400).send({
          code: 400,
          success: false,
          message: "Nomor Telphon / Nomor Whatsapp Tidak Ada / Kosong",
          data: {},
        });
      } else if (!params.email) {
        return res.status(400).send({
          code: 400,
          success: false,
          message: "Email Tidak Ada / Kosong",
          data: {},
        });
      }

      let response = await resv.findOrCreateReservation(params);
      var reservation = response.data;
      console.log("response reservasi create");
      console.log(reservation);
      console.log(reservation.id);
      console.log(reservation.package_id);

      response.code = response.success ? 200 : 500;

      if (response.code == 200) {
        // 🔴 SOCKET.IO
        const io = req.app.get("io");
        console.log("run io in create booking");
        if (io) {
          if (reservation.reservation_type === "USER_ORDER") {
            console.log("emit to user and partner createReservation User");
             // emit ke user
            io.to(reservation.user_id.toString()).emit("createReservation", {
              packageId: reservation.package_id,
              name: reservation.name,
              eventAddress: reservation.event_address,
            });
          }

          // emit ke partner
          io.to(reservation.partner_id.toString()).emit("createReservation", {
            packageId: reservation.package_id,
            name: reservation.name,
            eventAddress: reservation.event_address,
          });

          console.log("Socket emit sent to user and partner createReservation");
        }

        // 🔔 Kirim Notifikasi FCM ke user dan partner
        // Ambil token user dan partner
        const userToken = await utilility.getFcmTokens(reservation.user_id, HaiUser);
        const partnerToken = await utilility.getFcmTokens(reservation.partner_id, HaiUser);

        const formattedDate = moment(reservation.event_date).format('dddd, DD/MM/YYYY');
        const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

        // Notifikasi untuk Partner
        try {
          if (partnerToken) {
            const partnerPayload = {
              notification: {
                title: "Reservasi Baru",
                body: `${reservation.name} telah membuat reservasi baru ${reservation.package_name} untuk tanggal ${capitalizedDate} ${reservation.event_time}, di ${reservation.event_address}. Periksa dan proses segera`,
              },
              android: {
                notification: {
                  icon: 'ic_notification', // harus cocok dengan nama ikon di drawable
                  color: '#1B84FF', // opsional
                },
              },
              apns: {
                headers: {
                  "apns-priority": "10",
                },
                payload: {
                  aps: {
                    alert: {
                      title: "Reservasi Baru",
                      body: `${reservation.name} telah membuat reservasi baru ${reservation.package_name} untuk tanggal ${capitalizedDate} ${reservation.event_time}, di ${reservation.event_address}. Periksa dan proses segera`,
                    },
                    sound: "default",
                    badge: 1,
                  },
                },
              },
              data: {
                type: "createReservation",
                reservationId: reservation.id.toString(),
                packageId: reservation.package_id.toString(),
              },
              token: partnerToken,
            };
            const partnerRes = await admin.messaging().send(partnerPayload);
            console.log("✅ Notifikasi ke partner sent:", partnerRes);
          } else {
            console.log("⚠️ No token for partner messaging");
          }
        } catch (err) {
          console.error("❌ Error FCM partner:", err);
        }

        // Notifikasi untuk User
        try {
          if (userToken) {
            const userPayload = {
              notification: {
                title: "Reservasi Diterima",
                body: `Partner sedang memproses reservasi Anda. Mohon tunggu konfirmasi.`,
              },
              android: {
                notification: {
                  icon: 'ic_notification', // harus cocok dengan nama ikon di drawable
                  color: '#1B84FF', // opsional
                },
              },
              apns: {
                headers: {
                  "apns-priority": "10",
                },
                payload: {
                  aps: {
                    alert: {
                      title: "Reservasi Baru",
                      body: `Partner sedang memproses reservasi Anda. Mohon tunggu konfirmasi.`,
                    },
                    sound: "default",
                    badge: 1,
                  },
                },
              },
              data: {
                type: "reservationProcessing",
                reservationId: reservation.id.toString(),
                packageId: reservation.package_id.toString(),
              },
              token: userToken,
            };
            const userRes = await admin.messaging().send(userPayload);
            console.log("✅ Notifikasi ke user sent:", userRes);
          } else {
            console.log("⚠️ No token for user messaging");
          }
        } catch (err) {
          console.error("❌ Error FCM user:", err);
        }
      }

      return res.status(200).send(response);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ code: 500, success: false, message: err.message, data: {} });
    }  
};

exports.updateStatus = async function(req, res, next) {
    try {            
        let data = await resv.updateStatusReservation(req);
        
        if (data.success) {
          var reservation = data.data;

          if(reservation.status_code == "ORDER_NEW" || reservation.status_code == "ORDER_DP_COMPLETED" || reservation.status_code == "ORDER_PAYMENT_COMPLETED")
          {
            let getData = await resv.findReservation(reservation.reservation_no);   
            let dataUser = await partnerResv.getDetail(reservation.partner_id);  
            //console.log(dataUser);     
  
            var statusPayment = "";
            if (reservation.status_code == "ORDER_NEW") {
              statusPayment = "Belum Dibayar";
            } else if (reservation.status_code == "ORDER_DP_COMPLETED") {
              statusPayment = "Sudah DP";
            } else if (reservation.status_code == "ORDER_PAYMENT_COMPLETED") {
              statusPayment = "Sudah Lunas";
            }

            var templateInvoice = fs.readFileSync('./views/invoice.html', 'utf-8');
            var compileInvoice = Hogan.compile(templateInvoice);

            var zero = 0;
            var totalPrice = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            var totalDiscount = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            var totalPayment = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            var totalDownPayment = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

            if(reservation.total_price){
              totalPrice = reservation.total_price.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            }

            if(reservation.total_discount){
              totalDiscount = reservation.total_discount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            }

            if(reservation.total_down_payment){
              totalDownPayment = reservation.total_down_payment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            }

            if(reservation.total_payment){
              totalPayment = reservation.total_payment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            }            
           
            var detailUser = getData.data.reservation_contact;
  
            // var services = new Array();            
            // getData.data.reservation_services.forEach(
            //   element => { 
            //     var price = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

            //     if(element.price){
            //       price = element.price.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            //     }

            //     services.push({ 
            //       serviceTitle: element.sub_service_title,
            //       description: element.description,
            //       price: price
            //      }); 
            //   }
            // );

            let mailoptions = {
              from: '"Hai Info" notify@haibersama.com',
              to: req.email,
              subject: "Invoice",
              html: compileInvoice.render({
                partnerName: dataUser.data.partnername,
                partnerAddress: dataUser.data.address,
                packageName: reservation.package_name,
                eventDate:  moment(reservation.event_date).utcOffset(0).format("DD-MM-YYYY"),
                eventTime: reservation.event_time,
                codeInvoice: reservation.reservation_no,
                invoiceDate: moment(reservation.reservation_date).utcOffset(0).format("DD-MM-YYYY"),
                customerName: detailUser.name,
                customerAddress: detailUser.address,
                completePayment: statusPayment,
                totalPrice: totalPrice,
                totalDiscount: totalDiscount,
                totalPayment: totalPayment,
                totalDownPayment: totalDownPayment,
                description: reservation.description,
                //services: services
              })
            };
            // console.log("mailoptions :" + JSON.stringify(mailoptions));

            transporter.transporterSmtp.sendMail(mailoptions, function(error, res) {
              if (error) {
                console.log(error);
              } else {
                console.log("Message sent: " + res.response);
              }
              //smtpTransport.close();
            });
          }
        } 

        return res.status(200).send(data);
      } catch (err) {
        console.log(err);
        return res.status(500).send({ data: err });
      }    
};

exports.updateStatusManual = async function(req, res, next) {
  try {            
      const { reservationNo, statusCode, userId } = req;

      var paramBank = { partner_id: userId };

      let data = await resv.updateStatusReservationManual(req);
      let bankPartner = await bank.getList(paramBank);
      
      if (data.success) {
        var reservation = data.data;
        var detailBank = bankPartner.data[0];
        var termPartner = await term.getPackage(reservation.package_id);

        // console.log('list banks');
        // console.log(detailBank);

        if(reservation.status_code == "ORDER_NEW" || reservation.status_code == "ORDER_PARTNER_CONFIRM" || reservation.status_code == "ORDER_DP_COMPLETED" || reservation.status_code == "ORDER_PAYMENT_COMPLETED")
        {
          let getData = await resv.findReservation(reservation.reservation_no);
          let dataUser = await partnerResv.getDetail(reservation.partner_id);  
          //console.log(dataUser);

          var statusPayment = "";
          if (reservation.status_code == "ORDER_NEW" || reservation.status_code == "ORDER_PARTNER_CONFIRM") {
            statusPayment = "Belum Dibayar";
          } else if (reservation.status_code == "ORDER_DP_COMPLETED") {
            statusPayment = "Sudah DP";
          } else if (reservation.status_code == "ORDER_PAYMENT_COMPLETED") {
            statusPayment = "Sudah Lunas";
          }

          var templateInvoice = fs.readFileSync('./views/invoice_manual.html', 'utf-8');
          var compileInvoice = Hogan.compile(templateInvoice);

          var zero = 0;
          var totalPrice = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          var totalDiscount = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          var totalPayment = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          var totalDownPayment = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          var remainingPayment = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

          if(reservation.total_price){
            totalPrice = reservation.total_price.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }

          if(reservation.total_discount){
            totalDiscount = reservation.total_discount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }          

          if(reservation.total_down_payment){
            totalDownPayment = reservation.total_down_payment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }

          if(reservation.total_payment){
            totalPayment = reservation.total_payment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }

          var detailUser = getData.data.reservation_contact;

          remainingPayment = parseInt(totalPayment.replace(/[$,]/g, '')) - (parseInt(totalDiscount.replace(/[$,]/g, '')) + parseInt(totalDownPayment.replace(/[$,]/g, '')));

          if (getData.data.status_code == "ORDER_PAYMENT_COMPLETED") {
            remainingPayment = 0;
          }

          if (totalDownPayment == 0 || totalDownPayment == null) {
            totalDownPayment = parseFloat(totalDownPayment).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }

          // var services = new Array();
          // getData.data.reservation_services.forEach(
          //   element => { 
          //     var price = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

          //     if(element.price){
          //       price = element.price.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          //     }

          //     services.push({ 
          //       serviceTitle: element.sub_service_title,
          //       description: element.description,
          //       price: price
          //      }); 
          //   }
          // );

          // get template invoice html
          async function getTemplateHtml() {
            console.log("Loading template file in memory")
            try {
              const invoicePath = path.resolve("./views/invoice_manual_pdf.html");
              return await readFile(invoicePath, 'utf8');
            } catch (err) {
              return Promise.reject("Could not load html template");
            }
          }

          // generate template invoice html into pdf
          async function generatePdf() {
            let data = {
              partnerName: dataUser.data.partnername,
              partnerAddress: dataUser.data.address,
              packageName: reservation.package_name,
              eventDate: moment(reservation.event_date).utcOffset(0).format("DD-MM-YYYY"),
              eventTime: reservation.event_time,
              eventAddress: reservation.event_address,
              codeInvoice: reservation.reservation_no,
              invoiceDate: moment(reservation.reservation_date).utcOffset(0).format("DD-MM-YYYY"),
              customerName: detailUser.name,
              customerAddress: detailUser.address,
              completePayment: statusPayment,
              totalPrice: totalPrice,
              totalDiscount: totalDiscount,
              totalPayment: totalPayment,
              totalDownPayment: totalDownPayment,
              remainingPayment: remainingPayment.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              description: reservation.description,
              bankName: detailBank == undefined ? "-" : detailBank.bank_name,
              accountBank: detailBank == undefined ? "-" : detailBank.account_name,
              rekBank: detailBank == undefined ? "-" : detailBank.account_no,
              terms: termPartner.data.terms
            }
            
            getTemplateHtml().then(async (res) => {
              // Now we have the html code of our template in res object
              // you can check by logging it on console
              // console.log(res)
              console.log("Compiling the template with handlebars")
              const template = hb.compile(res, { strict: true });
              // we have compile our code with handlebars
              const result = template(data);
              // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
              const html = result;

              // puppeteer only support vps cloud
              // we are using headless mode
              // const browser = await puppeteer.launch({headless: true});
              // const page = await browser.newPage()
              // // We set the page content as the generated html by handlebars
              // await page.setContent(html)
              // // We use pdf function to generate the pdf in the same folder as this file.
              // await page.pdf({ 
              //   path: './views/invoice_manual.pdf', 
              //   format: 'A4',
              //   printBackground: true,
              //   displayHeaderFooter: true,
              //   footerTemplate: `<div style="font-size: 9px; padding-top: 8px; text-align: center; width: 100%;color: #444444">
              //   <span>HaiO Invoice</span> - <span class="pageNumber"></span>/<span class="totalPages"></span>
              //   </div>
              //   `,
              //   margin: {top: '50px', right: '10px', bottom: '50px', left: '10px', }
              // })
              // await browser.close();
              // console.log("PDF Generated");

              // render file html
              // fs.writeFile("./views/test.html", result, function(err) {
              //   if(err) {
              //       return console.log(err);
              //   }
              // });

              var datenow = moment(new Date).format("DD MMM YYYY H:mm:ss");

              var options = { 
                format: 'A4',
                orientation: "portrait",
                header: {
                  height: "20mm",
                  contents: {
                    first: `<div style="font-size: 11px; padding-top: 8px; text-align: center; width: 100%;color: #444">
                      <span style="color: #444;">${datenow}</span>
                    </div>`
                  }
                },
                footer: {
                  height: "30mm",
                  contents: {
                    default: `<div style="font-size: 11px; padding-top: 8px; text-align: center; width: 100%;color: #444">
                    <span>HaiO Invoice</span> - <span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>
                    </div>`, // fallback value
                  }
                },
              };

              pdf.create(html, options).toFile('./views/invoice_manual.pdf', function(err, res) {
                console.log('This is a toFile:', res);
              });             

            }).catch(err => {
              console.error(err);
            });
          }

          // result generate pdf
          generatePdf().then(async (res) => {
            setTimeout(() => {
              let mailoptions = {
                from: '"Haio Invoice" notify@haibersama.com',
                to: getData.data.reservation_contact.email,
                subject: `Invoice #${reservation.reservation_no} dari partner ${dataUser.data.partnername}`,
                html: compileInvoice.render({
                  partnerName: dataUser.data.partnername,
                  partnerAddress: dataUser.data.address,
                  packageName: reservation.package_name,
                  eventDate: moment(reservation.event_date).utcOffset(0).format("DD-MM-YYYY"),
                  eventTime: reservation.event_time,
                  eventAddress: reservation.event_address,
                  codeInvoice: reservation.reservation_no,
                  invoiceDate: moment(reservation.reservation_date).utcOffset(0).format("DD-MM-YYYY"),
                  customerName: detailUser.name,
                  customerAddress: detailUser.address,
                  completePayment: statusPayment,
                  totalPrice: totalPrice,
                  totalDiscount: totalDiscount,
                  totalPayment: totalPayment,
                  totalDownPayment: totalDownPayment,
                  remainingPayment: remainingPayment.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                  description: reservation.description,
                  bankName: detailBank == undefined ? "-" : detailBank.bank_name,
                  accountBank: detailBank == undefined ? "-" : detailBank.account_name,
                  rekBank: detailBank == undefined ? "-" : detailBank.account_no,
                  terms: termPartner.data.terms
                  // services: services
                }),
                attachments: {
                  filename: `${reservation.package_name}` + '_' + `${detailUser.name}` + '_' + `${moment(reservation.event_date).utcOffset(0).format("DD-MM-YYYY")}` + '.pdf',
                  contentType: 'application/pdf',
                  path: './views/invoice_manual.pdf'
                }
              };
              console.log("mailoptions :" + JSON.stringify(mailoptions));

              transporter.transporterSmtp.sendMail(mailoptions, function (error, res) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Message sent: " + res.response);
                }
                //smtpTransport.close();
              });
            }, 5000);
          });
         
        }
      } 

      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.updateStatusBookingManual = async function(params, req, res, next) {
  try {            
      let data = await resv.updateStatusReservationManual(params);

      if (data.success) {
        console.log("data update status booking manual");
        var reservation = data.data;
        console.log(reservation.dataValues);
      
        // 🔴 SOCKET.IO
        const io = req.app.get("io");
        console.log("run io in list booking");
        if (io) {
          // emit ke user
          io.to(reservation.user_id.toString()).emit("statusUpdated", {
            reservationNo: reservation.reservation_no,
            statusCode: reservation.status_code,
            updatedAt: reservation.updated_at
          });
      
          // emit ke partner
          io.to(reservation.partner_id.toString()).emit("statusUpdated", {
            reservationNo: reservation.reservation_no,
            statusCode: reservation.status_code,
            updatedAt: reservation.updated_at
          });
      
          console.log('Socket emit sent to user and partner');
        }

        // 🔔 Kirim Notifikasi FCM ke user dan partner
        // Ambil token user dan partner
        const userToken = await utilility.getFcmTokens(reservation.user_id, HaiUser);
        const partnerToken = await utilility.getFcmTokens(reservation.partner_id, HaiUser);

        const formattedDate = moment(reservation.event_date).format('dddd, DD/MM/YYYY');
        const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

        let bodyMessage = "";
        let transactionStatusCode = "";

        if (reservation.status_code == "ORDER_COMPLETED") {
          transactionStatusCode = "Reservasi Selesai";
        } else if (reservation.status_code == "ORDER_CANCEL_BY_PARTNER") {
          transactionStatusCode = "Reservasi Dibatalkan Partner";
        } else if (reservation.status_code == "ORDER_CANCEL_BY_USER") {
          transactionStatusCode = "Reservasi Dibatalkan Kustomer";
        } else if (reservation.status_code == "ORDER_DP_REQUEST") {
          transactionStatusCode = "Permintaan DP";
        } else if (reservation.status_code == "ORDER_DP_COMPLETED") {
          transactionStatusCode = "Sudah DP";
        } else if (reservation.status_code == "ORDER_PARTNER_CONFIRM") {
          transactionStatusCode = "Sudah Dikonfirmasi Partner";
        } else if (reservation.status_code == "ORDER_REPAYMENT_REQUEST") {
          transactionStatusCode = "Permintaan Ulang Pembayaran";
        } else if (reservation.status_code == "ORDER_PAYMENT_COMPLETED") {
          transactionStatusCode = "Pembayaran Lunas";
        }

        if (reservation.status_code === "ORDER_COMPLETED") {
          bodyMessage = `Reservasi atas nama ${reservation.name} sudah selesai untuk transaksi ${reservation.package_name}, tanggal ${capitalizedDate} ${reservation.event_time}, di ${reservation.event_address}.`;
        } else if (reservation.status_code === "ORDER_CANCEL_BY_PARTNER") {
          bodyMessage = `Partner udah membatalkan reservasi ${reservation.name} untuk transaksi ${reservation.package_name}, tanggal ${capitalizedDate} ${reservation.event_time},  di ${reservation.event_address}.`;
        } else if (reservation.status_code === "ORDER_CANCEL_BY_USER") {
          bodyMessage = `${reservation.name} telah membatalkan reservasi untuk transaksi ${reservation.package_name}, tanggal ${capitalizedDate} ${reservation.event_time}, di ${reservation.event_address}.`;
        } else if (reservation.status_code === "ORDER_DP_REQUEST") {
          bodyMessage = `Permintaan pembayaran DP untuk reservasi ${reservation.name} – ${reservation.package_name}, tanggal ${capitalizedDate} ${reservation.event_time} di ${reservation.event_address}.`;
        } else if (reservation.status_code === "ORDER_DP_COMPLETED") {
          bodyMessage = `${reservation.name} telah membayar DP reservasi untuk transaksi ${reservation.package_name}, tanggal ${capitalizedDate} ${reservation.event_time} di ${reservation.event_address}.`;
        } else if (reservation.status_code === "ORDER_PARTNER_CONFIRM") {
          bodyMessage = `Reservasi ${reservation.name} untuk transaksi ${reservation.package_name}, tanggal ${capitalizedDate} ${reservation.event_time} telah dikonfirmasi oleh partner.`;
        } else if (reservation.status_code === "ORDER_REPAYMENT_REQUEST") {
          bodyMessage = `Permintaan pelunasan pembayaran reservasi untuk transaksi ${reservation.name} – ${reservation.package_name}, tanggal ${capitalizedDate} di ${reservation.event_address}.`;
        } else if (reservation.status_code === "ORDER_PAYMENT_COMPLETED") {
          bodyMessage = `Reservasi ${reservation.name} telah dilunasi untuk transaksi ${reservation.package_name}, tanggal ${capitalizedDate} ${reservation.event_time}, di ${reservation.event_address}.`;
        }

        // Notifikasi untuk Partner
        if (partnerToken) {
          const partnerPayload = {
            notification: {
              title: `${transactionStatusCode}`,
              body: `${bodyMessage}`,
            },
            android: {
              notification: {
                icon: 'ic_notification', // harus cocok dengan nama ikon di drawable
                color: '#1B84FF', // opsional
              },
            },
            data: {
              type: "updateReservation",
              reservationId: reservation.id.toString(),
              packageId: reservation.package_id.toString(),
            },
            token: partnerToken,
          };

          admin
            .messaging()
            .send(partnerPayload)
            .then((res) => console.log("✅ Notifikasi ke partner sent:", res))
            .catch((err) => console.error("❌ Error FCM partner:", err));
        } else {
          console.log("No token for send messaging");
        }

        // Notifikasi untuk User
        if (userToken) {
          const userPayload = {
            notification: {
              title: `${transactionStatusCode}`,
              body: `${bodyMessage}`,
            },
            android: {
              notification: {
                icon: 'ic_notification', // harus cocok dengan nama ikon di drawable
                color: '#1B84FF', // opsional
              },
            },
            data: {
              type: "updateReservation",
              reservationId: reservation.id.toString(),
              packageId: reservation.package_id.toString(),
            },
            token: userToken,
          };

          admin
            .messaging()
            .send(userPayload)
            .then((res) => console.log("✅ Notifikasi ke user sent:", res))
            .catch((err) => console.error("❌ Error FCM user:", err));
        } else {
          console.log("No token for send messaging");
        }
      }
      
      if (data.success) {
        return res.status(200).send(data);
      } 
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.updateStatusBooking = async function(req, res, next) {
  try {            
      let data = await resv.updateStatusReservationGlobal(req);
      
      if (data.success) {
        return res.status(200).send(data);
      } 
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.getReservationDetail = async function(req, res, next) {
  try {            
      let data = await resv.updateReservation(req);
      
      if (data.success) {
        return res.status(200).send(data);
      } else {
        return res.status(500).send(data);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.deleteReservation = async function(req, res, next) {
  try {
    var result = await resv.delete(req);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};

exports.getReservation = async function(req, res, next) {
    try {
        const { reservationNo } = req.body;
        let data = await resv.findReservation(reservationNo);
        return res.status(200).send(data);
      } catch (err) {
        return res.status(500).send({ data: err });
      }    
};

exports.getReservations = async function(req, res, next) {
    try {
        const { statusCode, categoryId, userId, type } = req;
        
        //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

        const params = { };
        var where = " WHERE 1=1 "

        if(type == 2){
            params.partner_id = userId;
            where += " AND rv.partner_id = " + userId;
        }else{
            params.user_id = userId;
            where += " AND rv.user_id = " + userId;
        }        

        if(statusCode != ""){
          params.status_code = statusCode;
          where += " AND (rv.status_code = '" + statusCode + "' OR rv.transaction_status_code = '" + statusCode + "') ";
        }
        
        if(categoryId > 0){
          params.category_id = categoryId;
          where += " AND rv.category_id = " + categoryId + " ";
        }
            
        console.log(where);
        let data = await resv.findReservations(where);
        data.code = data.success ? 200 : 500;
        return res.status(200).send(data);
    
      } catch (err) {
        console.log(err);
        return res.status(500).send({ data: err });
      }    
};

exports.getCountCart = async function(req, res, next) {
  try {
      const { userId, type } = req;
      
      const params = { };
      var where = " WHERE 1=1 "

      if(type == 2){
          params.partner_id = userId;
          where += " AND rv.partner_id = " + userId;
      }else{
          params.user_id = userId;
          where += " AND rv.user_id = " + userId;
      }        

      where += " AND (rv.status_code = '" + "ORDER_NEW" + "' OR rv.status_code = '" + "ORDER_PARTNER_CONFIRM" + "' OR rv.transaction_status_code = '" + "ORDER_NEW" + "'OR rv.transaction_status_code = '" + "ORDER_PARTNER_CONFIRM" + "') ";
          
      console.log(where);
      let data = await resv.findReservations(where);
      data.code = data.success ? 200 : 500;
      return res.status(200).send(data);
  
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

// exports.getAgendaItems = async function(req, res, next) {
//   try {            
//       let data = await resv.getPartnerAgendaItems(req);
//       return res.status(200).send(data);
//     } catch (err) {
//       console.log(err);
//       return res.status(500).send({ data: err });
//     }    
// };

exports.getCalendarData = async function(req, res, next) {
  try {            
      let data = await resv.getPartnerCalendarData(req);
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.getReservationsGroupByCategory = async function(req, res, next) {
  try {
      const { statusCode, categoryId, userId, type } = req;
      
      //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

      const params = { };
      var where = " ";

      if(type == 2){
          params.partner_id = userId;
          where += " AND rv.partner_id = " + userId;
      }else{
          params.user_id = userId;
          where += " AND rv.user_id = " + userId;
      }        

      if(statusCode != ""){
        params.status_code = statusCode;
        where += " AND (rv.status_code = '" + statusCode + "' OR rv.transaction_status_code = '" + statusCode + "') ";
      }
      
      if(categoryId > 0){
        params.category_id = categoryId;
        where += " AND rv.category_id = " + categoryId + " ";
      }
          
      console.log('where ' + where);
      let data = await resv.findReservationsGroupByCategory(where);
      data.code = data.success ? 200 : 500;
      return res.status(200).send(data);
  
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.getReservationsGroupByCategories = async function(req, res, next) {
  try {
      const { statusCode, categoryId, limitItem, page, userId, type } = req;
      
      //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

      const params = { };
      var where = " ";

      if(type == 2){
          params.partner_id = userId;
          where += " AND rv.partner_id = " + userId;
      }else{
          params.user_id = userId;
          where += " AND rv.user_id = " + userId;
      }        

      if(statusCode != ""){
        params.status_code = statusCode;
        where += " AND (rv.status_code = '" + statusCode + "' OR rv.transaction_status_code = '" + statusCode + "') ";
      }
      
      if(categoryId > 0){
        params.category_id = categoryId;
        where += " AND rv.category_id = " + categoryId + " ";
      }
          
      console.log('where ' + where);
      let data = await resv.findReservationsGroupByCategories(where, limitItem, page);
      data.code = data.success ? 200 : 500;
      return res.status(200).send(data);
  
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.getReservationsGroupByDynamic = async function(req, res, next) {
  try {
      const { statusCode, categoryId, eventFrom, eventTo, limitItem, page, userId, type, search } = req;
      //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

      const params = { };
      var where = " WHERE 1=1 "

      // params.partner_id = userId;
      // where += " AND rv.partner_id = " + userId; 

      if (type == 2) {
        params.partner_id = userId;
        where += " AND rv.partner_id = " + userId;
      } else {
        params.user_id = userId;
        where += " AND rv.user_id = " + userId;
      }    

      // where += " AND rv.transaction_status_code = 'SUCCESS' ";
      
      if(eventFrom != null){
        where += " AND date(rv.event_date) >= date('" + eventFrom + "') ";
      }
      
      if(eventTo != null){
        where += " AND date(rv.event_date) <= date('" + eventTo + "') ";
      }

      if (Array.isArray(statusCode) && statusCode.length > 0) {
        const statusConditions = statusCode
          .map(code => `(rv.status_code = '${code}' OR rv.transaction_status_code = '${code}')`)
          .join(' OR ');
      
        where += ` AND (${statusConditions}) `;
      }
      
      if(categoryId > 0){
        params.category_id = categoryId;
        where += " AND rv.category_id = " + categoryId + " ";
      }

      if (search.trim().length >= 4) {
        const keyword = search.trim();
        where += ` AND (rv.reservation_no ILIKE '%${keyword}%' OR rv.name ILIKE '%${keyword}%')`;
      }
      
      console.log('where ' + where);
      let data = await resv.findSuccessReservations(where, limitItem, page);
      data.code = data.success ? 200 : 500;
      return res.status(200).send(data);
  
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.getSuccessReservationDate = async function(req, res, next) {
  try {
      const { eventFrom, eventTo,  userId, type } = req;
      
      //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

      const params = { };
      var where = " WHERE 1=1 "

      // params.partner_id = userId;
      // where += " AND rv.partner_id = " + userId; 

      if (type == 2) {
        params.partner_id = userId;
        where += " AND rv.partner_id = " + userId;
      } else {
        params.user_id = userId;
        where += " AND rv.user_id = " + userId;
      }   

      // where += " AND rv.transaction_status_code = 'SUCCESS' ";
      
      if(eventFrom != null){
        where += " AND date(rv.event_date) >= date('" + eventFrom + "') ";
      }
      
      if(eventTo != null){
        where += " AND date(rv.event_date) <= date('" + eventTo + "') ";
      }
          
      let data = await resv.findReservations(where);
      data.code = data.success ? 200 : 500;
      return res.status(200).send(data);
  
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.getSuccessReservations = async function(req, res, next) {
  try {
      const { statusCode, categoryId, eventFrom, eventTo, limitItem, page, userId, type } = req;
      
      //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

      const params = { };
      var where = " WHERE 1=1 "

      // params.partner_id = userId;
      // where += " AND rv.partner_id = " + userId; 

      if (type == 2) {
        params.partner_id = userId;
        where += " AND rv.partner_id = " + userId;
      } else {
        params.user_id = userId;
        where += " AND rv.user_id = " + userId;
      }    

      // where += " AND rv.transaction_status_code = 'SUCCESS' ";
      
      if(eventFrom != null){
        where += " AND date(rv.event_date) >= date('" + eventFrom + "') ";
      }
      
      if(eventTo != null){
        where += " AND date(rv.event_date) <= date('" + eventTo + "') ";
      }

      if(statusCode != ""){
        params.status_code = statusCode;
        where += " AND (rv.status_code = '" + statusCode + "' OR rv.transaction_status_code = '" + statusCode + "') ";
      }
      
      if(categoryId > 0){
        params.category_id = categoryId;
        where += " AND rv.category_id = " + categoryId + " ";
      }
          
      let data = await resv.findSuccessReservations(where, limitItem, page);
      data.code = data.success ? 200 : 500;
      return res.status(200).send(data);
  
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.getSuccessReservationsCart = async function(req, res, next) {
  try {
      const { statusCode, categoryId, eventFrom, eventTo, limitItem, page, userId, type } = req;
      
      //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

      const params = { };
      var where = " WHERE 1=1 "

      // params.partner_id = userId;
      // where += " AND rv.partner_id = " + userId; 

      if (type == 2) {
        params.partner_id = userId;
        where += " AND rv.partner_id = " + userId;
      } else {
        params.user_id = userId;
        where += " AND rv.user_id = " + userId;
      }    

      // where += " AND rv.transaction_status_code = 'SUCCESS' ";
     
      where += " AND (rv.status_code = '" + "ORDER_NEW" + "' OR rv.status_code = '" + "ORDER_PARTNER_CONFIRM" + "' OR rv.transaction_status_code = '" + "ORDER_NEW" + "'OR rv.transaction_status_code = '" + "ORDER_PARTNER_CONFIRM" + "') ";
      
      if(categoryId > 0){
        params.category_id = categoryId;
        where += " AND rv.category_id = " + categoryId + " ";
      }
          
      let data = await resv.findSuccessReservations(where, limitItem, page);
      data.code = data.success ? 200 : 500;
      return res.status(200).send(data);
  
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.getSuccessReservationsTransaction = async function(req, res, next) {
  try {
      const { statusCode, categoryId, eventFrom, eventTo, limitItem, page, userId, type } = req;
      
      //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

      const params = { };
      var where = " WHERE 1=1 "

      // params.partner_id = userId;
      // where += " AND rv.partner_id = " + userId; 

      if (type == 2) {
        params.partner_id = userId;
        where += " AND rv.partner_id = " + userId;
      } else {
        params.user_id = userId;
        where += " AND rv.user_id = " + userId;
      }    

      // where += " AND rv.transaction_status_code = 'SUCCESS' ";
     
      where += " AND (rv.status_code = '" + "ORDER_DP_COMPLETED" + "' OR rv.status_code = '" + "ORDER_PAYMENT_COMPLETED" + "' OR rv.status_code = '" + "ORDER_COMPLETED" + "' OR rv.transaction_status_code = '" + "ORDER_DP_COMPLETED" + "' OR rv.transaction_status_code = '" + "ORDER_PAYMENT_COMPLETED" + "' OR rv.transaction_status_code = '" + "ORDER_COMPLETED" + "') "; 
      
      if(categoryId > 0){
        params.category_id = categoryId;
        where += " AND rv.category_id = " + categoryId + " ";
      }
          
      let data = await resv.findSuccessReservations(where, limitItem, page);
      data.code = data.success ? 200 : 500;
      return res.status(200).send(data);
  
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.getSuccessReservationsList = async function(req, res, next) {
  try {
      const { statusCode, categoryId, eventFrom, eventTo, limitItem, page, userId, type } = req;
      
      //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

      const params = { };
      var where = " WHERE 1=1 "

      // params.partner_id = userId;
      // where += " AND rv.partner_id = " + userId; 

      if (type == 2) {
        params.partner_id = userId;
        where += " AND rv.partner_id = " + userId;
      } else {
        params.user_id = userId;
        where += " AND rv.user_id = " + userId;
      }    

      // where += " AND rv.transaction_status_code = 'SUCCESS' ";

      if(eventFrom != null){
        where += " AND date(rv.event_date) >= date('" + eventFrom + "') ";
      }
      
      if(eventTo != null){
        where += " AND date(rv.event_date) <= date('" + eventTo + "') ";
      }
     
      if(statusCode != ""){
        params.status_code = statusCode;
        where += " AND (rv.status_code = '" + statusCode + "' OR rv.transaction_status_code = '" + statusCode + "') ";
      }
      
      if(categoryId > 0){
        params.category_id = categoryId;
        where += " AND rv.category_id = " + categoryId + " ";
      }
          
      let data = await resv.findSuccessReservations(where, limitItem, page);
      data.code = data.success ? 200 : 500;
      return res.status(200).send(data);
  
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.getSuccessReservationsAllList = async function(req, res, next) {
  try {
      const { statusCode, categoryId, eventFrom, eventTo, limitItem, page, userId, type } = req;
      console.log("getSuccessReservationsAllList " + JSON.stringify(req));
      
      //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

      const params = { };
      var where = " WHERE 1=1 "

      // params.partner_id = userId;
      // where += " AND rv.partner_id = " + userId; 

      if (type == 2) {
        params.partner_id = userId;
        where += " AND rv.partner_id = " + userId;
      } else {
        params.user_id = userId;
        where += " AND rv.user_id = " + userId;
      }    

      // where += " AND rv.transaction_status_code = 'SUCCESS' ";
     
      if(statusCode != ""){
        params.status_code = statusCode;
        where += " AND (rv.status_code = '" + statusCode + "' OR rv.transaction_status_code = '" + statusCode + "') ";
      }
      
      if(categoryId > 0){
        params.category_id = categoryId;
        where += " AND rv.category_id = " + categoryId + " ";
      }
          
      let data = await resv.findSuccessReservations(where, limitItem, page);
      data.code = data.success ? 200 : 500;
      return res.status(200).send(data);
  
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};

exports.getSuccessReservationsEmail = async function(req, res, next) {
 try { 
    const { eventFrom, eventTo,  userId, email } = req;
        
    //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

    const params = { };
    var where = " WHERE 1=1 "

    params.partner_id = userId;
    
    if(type == 2){
      where += " AND rv.partner_id = " + userId;
    }else{
        where += " AND rv.user_id = " + userId;
    }        

    where += " AND rv.transaction_status_code = 'SUCCESS' ";
    
    if(eventFrom != null){
      where += " AND date(rv.event_date) >= date('" + eventFrom + "') ";
    }
    
    if(eventTo != null){
      where += " AND date(rv.event_date) <= date('" + eventTo + "') ";
    }
        
    let reservation = await resv.findReservations(where);

    if (reservation.success) {
      console.log(reservation);
      //create user by email n password
      //hash email

      var emailBody = 
      "<h4><b>Invoice</b></h4>" +
      "<p>This is your invoice list:</p>";

      emailBody += "<table>"; 
      emailBody += "<th><td>Category</td><td>Reservation No</td><td>Reservation Date</td><td>Event Date</td><td>Total Price</td></th>";
      reservation.data.forEach(reservation => {        
        emailBody += "<tr><td>" + reservation.category + "</td><td>" + reservation.reservation_no + "</td><td>" + reservation.reservation_date + "</td><td>" + reservation.event_date + "</td><td>" + reservation.total_price + "</td></tr>";
      });
      
      emailBody += "</table>" +
      "<br><br>" +
      "<p>--Team</p>";

      // console.log(emailBody);

      let mailoptions = {
        from: '"<notify>" notify@haibersama.com',
        to: email,
        subject: "Invoice",
        html: emailBody
      };
      console.log("mailoptions :" + JSON.stringify(mailoptions));

      transporter.transporterSmtp.sendMail(mailoptions, function(error, res) {
        if (error) {
          console.log(error);
        } else {
          console.log("Message sent: " + res.response);
        }
        //smtpTransport.close();
      });

      return res.status(200).send({
        code: 200,
        success: true,
        message: "Berhasil Mengirimkan Email",
        data: {}
      });
    } else {
      return res.status(401).send({
        code: 401,
        success: false,
        message: "Gagal Mengirimkan Email",
        data: {}
      });
    }

  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: {} });
  }
};

exports.getSuccessReservationEmail = async function(req, res, next) {
  try { 
     const { reservationNo,  userId, email } = req;
         
     //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};
 
     const params = { };
     var where = " WHERE 1=1 "
 
     params.partner_id = userId;
     where += " AND rv.reservation_no = '" + reservationNo + "' "; 
          
     let reservation = await resv.findReservations(where);
     let getData = await resv.findReservation(reservationNo);   
     var detailUser = getData.data.reservation_contact;
     
     let dataUser = await partnerResv.getDetail(userId); 

     if (reservation.success) {
       console.log(reservation);
       //create user by email n password
       //hash email

       //console.log('reservation[0] ' + JSON.stringify(getData.data.reservation_no));
 
       var statusPayment = "";
       if (getData.data.status_code == "ORDER_NEW" || getData.data.status_code == "ORDER_PARTNER_CONFIRM") {
         statusPayment = "Belum Dibayar";
       } else if (getData.data.status_code == "ORDER_DP_COMPLETED") {
         statusPayment = "Sudah DP";
       } else if (getData.data.status_code == "ORDER_PAYMENT_COMPLETED") {
         statusPayment = "Sudah Lunas";
       }

       var templateInvoice = fs.readFileSync('./views/invoice_manual.html', 'utf-8');
       var compileInvoice = Hogan.compile(templateInvoice);

       var zero = 0;
       var totalPrice = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
       var totalDiscount = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
       var totalPayment = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
       var totalDownPayment = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
       var remainingPayment = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

       if (getData.data.total_price) {
         totalPrice = getData.data.total_price.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
       }

       if (getData.data.total_discount) {
         totalDiscount = getData.data.total_discount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
       }

       if (getData.data.total_down_payment) {
         totalDownPayment = getData.data.total_down_payment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
       }

       if (getData.data.total_payment) {
         totalPayment = getData.data.total_payment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
       }

       console.log('totalDownPayment ' + totalDownPayment);
       if (totalDownPayment == 0 || totalDownPayment == null) {
         remainingPayment = parseInt(totalPrice.replace(/[$,]/g, '')) - parseInt(totalPayment.replace(/[$,]/g, ''));
       } else {
         remainingPayment = parseInt(totalDownPayment.replace(/[$,]/g, '')) - parseInt(totalPrice.replace(/[$,]/g, ''));
       }

       let mailoptions = {
         from: '"Haio Invoice" notify@haibersama.com',
         to: getData.data.reservation_contact.email,
         subject: `Invoice #${getData.data.reservation_no} dari partner ${dataUser.data.partnername}`,
         html: compileInvoice.render({
           partnerName: dataUser.data.partnername,
           partnerAddress: dataUser.data.address,
           packageName: getData.data.package_name,
           eventDate: moment(getData.data.event_date).utcOffset(0).format("DD-MM-YYYY"),
           eventTime: getData.data.event_time,
           codeInvoice: getData.data.reservation_no,
           invoiceDate: moment(getData.data.reservation_date).utcOffset(0).format("DD-MM-YYYY"),
           customerName: detailUser.name,
           customerAddress: detailUser.address,
           completePayment: statusPayment,
           totalPrice: totalPrice,
           totalDiscount: totalDiscount,
           totalPayment: totalPayment,
           totalDownPayment: totalDownPayment,
           remainingPayment: remainingPayment.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
           description: getData.data.description,
           // services: services
         })
       };
       console.log("mailoptions :" + JSON.stringify(mailoptions));
 
       transporter.transporterSmtp.sendMail(mailoptions, function(error, res) {
         if (error) {
           console.log(error);
         } else {
           console.log("Message sent: " + res.response);
         }
         //smtpTransport.close();
       });
 
       return res.status(200).send({
         code: 200,
         success: true,
         message: "Berhasil Mengirimkan Email",
         data: {}
       });
     } else {
       return res.status(401).send({
         code: 401,
         success: false,
         message: "Gagal Mengirimkan Email",
         data: {}
       });
     }
 
   } catch (err) {
     return res
       .status(500)
       .send({ code: 500, success: false, message: err.message, data: {} });
   }
 }; 
 
exports.sendEmailToCustomer = async function (req, res, next) {
  try {
    const { reservationNo, statusCode, userId } = req;

    var counterParams = {
      reservation_no: reservationNo,
      status_code: statusCode
    };
    console.log(counterParams);

    var counter = await emailcounter.findCounter(counterParams);
    if (counter.success) {
      var dataCounter = counter.data;
      if (dataCounter.counter >= 11) {
        return res.status(500).send({ code: 500, success: false, message: "Kirim email untuk invoice " + reservationNo + " sudah dibatasi. Silahkan hubungi admin untuk bantuan.", data: {} });
      } else {
        dataCounter.counter = dataCounter.counter + 1;

        var updateCounter = await emailcounter.updateCounter(dataCounter);
      }
    } else {
      var dataCounter = counter.data;

      const params = {
        reservation_no: req.reservationNo,
        status_code: req.statusCode,
        counter: req.counter
      };

      var createCounter = await emailcounter.findOrCreateCounter(params, dataCounter);
    }

    const params = { };
     var where = " WHERE 1=1 "
 
     params.partner_id = userId;
     where += " AND rv.reservation_no = '" + reservationNo + "' "; 

     var paramBank = { partner_id: userId };
          
     //  let reservation = await resv.findReservations(where);
     let data = await resv.updateStatusReservationManual(req);
     let bankPartner = await bank.getList(paramBank);  

     if (data.success) {
       var reservation = data.data;
       var detailBank = bankPartner.data[0];
       var termPartner = await term.getPackage(reservation.package_id);
      
        if (reservation.status_code == "ORDER_NEW" || reservation.status_code == "ORDER_PARTNER_CONFIRM" || reservation.status_code == "ORDER_DP_COMPLETED" || reservation.status_code == "ORDER_PAYMENT_COMPLETED")
        {
          let getData = await resv.findReservation(reservationNo);   
          let dataUser = await partnerResv.getDetail(userId); 
          
          console.log(reservation);
          //create user by email n password
          //hash email

          //console.log('reservation[0] ' + JSON.stringify(getData.data.reservation_no));
    
          var statusPayment = "";
          if (reservation.status_code == "ORDER_NEW" || reservation.status_code == "ORDER_PARTNER_CONFIRM") {
            statusPayment = "Belum Dibayar";
          } else if (reservation.status_code == "ORDER_DP_COMPLETED") {
            statusPayment = "Sudah DP";
          } else if (reservation.status_code == "ORDER_PAYMENT_COMPLETED") {
            statusPayment = "Sudah Lunas";
          }

          var templateInvoice = fs.readFileSync('./views/invoice_manual.html', 'utf-8');
          var compileInvoice = Hogan.compile(templateInvoice);

          var zero = 0;
          var totalPrice = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          var totalDiscount = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          var totalPayment = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          var totalDownPayment = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          var totalPpn = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          var remainingPayment = zero.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

          if(reservation.total_price){
            totalPrice = reservation.total_price.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }

          if(reservation.total_discount){
            totalDiscount = reservation.total_discount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }          

          if(reservation.total_down_payment){
            totalDownPayment = reservation.total_down_payment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }

          if(reservation.total_payment){
            totalPayment = reservation.total_payment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }

          if(reservation.total_ppn){
            totalPpn = reservation.total_ppn.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }

          var detailUser = getData.data.reservation_contact;

          remainingPayment = parseInt(totalPayment.replace(/[$,]/g, '')) - (parseInt(totalDiscount.replace(/[$,]/g, '')) + parseInt(totalDownPayment.replace(/[$,]/g, '')));

          if (getData.data.status_code == "ORDER_PAYMENT_COMPLETED") {
            remainingPayment = 0;
          }

          if (totalDownPayment == 0 || totalDownPayment == null) {
            totalDownPayment = parseFloat(totalDownPayment).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }

          if (totalPpn == 0 || totalPpn == null) {
            totalPpn = parseFloat(totalPpn).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }
          
          // get template invoice html
          async function getTemplateHtml() {
            console.log("Loading template file in memory")
            try {
              const invoicePath = path.resolve("./views/invoice_manual_pdf.html");
              return await readFile(invoicePath, 'utf8');
            } catch (err) {
              return Promise.reject("Could not load html template");
            }
          }

          // generate template invoice html into pdf
          async function generatePdf() {
            let data = {
              partnerName: dataUser.data.partnername,
              partnerAddress: dataUser.data.address,
              packageName: reservation.package_name,
              eventDate: moment(reservation.event_date).utcOffset(0).format("DD-MM-YYYY"),
              eventTime: reservation.event_time,
              eventAddress: reservation.event_address,
              codeInvoice: reservation.reservation_no,
              invoiceDate: moment(reservation.reservation_date).utcOffset(0).format("DD-MM-YYYY"),
              customerName: detailUser.name,
              customerAddress: detailUser.address,
              completePayment: statusPayment,
              totalPrice: totalPrice,
              totalDiscount: totalDiscount,
              totalPayment: totalPayment,
              totalDownPayment: totalDownPayment,
              totalPpn: totalPpn,
              remainingPayment: remainingPayment.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              description: reservation.description,
              bankName: detailBank == undefined ? "-" : detailBank.bank_name,
              accountBank: detailBank == undefined ? "-" : detailBank.account_name,
              rekBank: detailBank == undefined ? "-" : detailBank.account_no,
              terms: termPartner.data.terms
            }

            getTemplateHtml().then(async (res) => {
              // Now we have the html code of our template in res object
              // you can check by logging it on console
              // console.log(res)
              console.log("Compiling the template with handlebars")
              const template = hb.compile(res, { strict: true });
              // we have compile our code with handlebars
              const result = template(data);
              // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
              const html = result;

              // puppeteer only support vps cloud
              // we are using headless mode
              // const browser = await puppeteer.launch({headless: true});
              // const page = await browser.newPage()
              // // We set the page content as the generated html by handlebars
              // await page.setContent(html)
              // // We use pdf function to generate the pdf in the same folder as this file.
              // await page.pdf({ 
              //   path: './views/invoice_manual.pdf', 
              //   format: 'A4',
              //   printBackground: true,
              //   displayHeaderFooter: true,
              //   footerTemplate: `<div style="font-size: 9px; padding-top: 8px; text-align: center; width: 100%;color: #444444">
              //   <span>HaiO Invoice</span> - <span class="pageNumber"></span>/<span class="totalPages"></span>
              //   </div>
              //   `,
              //   margin: {top: '50px', right: '10px', bottom: '50px', left: '10px', }
              // })
              // await browser.close();
              // console.log("PDF Generated");

              // render file html
              // fs.writeFile("./views/test.html", result, function(err) {
              //   if(err) {
              //       return console.log(err);
              //   }
              // });

              var datenow = moment(new Date).format("DD MMM YYYY H:mm:ss");

              var options = { 
                format: 'A4',
                orientation: "portrait",
                header: {
                  height: "20mm",
                  contents: {
                    first: `<div style="font-size: 11px; padding-top: 8px; text-align: center; width: 100%;color: #444">
                      <span style="color: #444;">${datenow}</span>
                    </div>`
                  }
                },
                footer: {
                  height: "30mm",
                  contents: {
                    default: `<div style="font-size: 11px; padding-top: 8px; text-align: center; width: 100%;color: #444">
                    <span>HaiO Invoice</span> - <span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>
                    </div>`, // fallback value
                  }
                },
              };

              pdf.create(html, options).toFile('./views/invoice_manual.pdf', function(err, res) {
                console.log('This is a toFile:', res);
              });              

            }).catch(err => {
              console.error(err);
            });
          }

          generatePdf().then(async (res) => {
            setTimeout(() => {
              let mailoptions = {
                from: '"Haio Invoice" notify@haibersama.com',
                to: getData.data.reservation_contact.email,
                subject: `Invoice #${reservation.reservation_no} dari partner ${dataUser.data.partnername}`,
                html: compileInvoice.render({
                  partnerName: dataUser.data.partnername,
                  partnerAddress: dataUser.data.address,
                  packageName: reservation.package_name,
                  eventDate: moment(reservation.event_date).utcOffset(0).format("DD-MM-YYYY"),
                  eventTime: reservation.event_time,
                  eventAddress: reservation.event_address,
                  codeInvoice: reservation.reservation_no,
                  invoiceDate: moment(reservation.reservation_date).utcOffset(0).format("DD-MM-YYYY"),
                  customerName: detailUser.name,
                  customerAddress: detailUser.address,
                  completePayment: statusPayment,
                  totalPrice: totalPrice,
                  totalDiscount: totalDiscount,
                  totalPayment: totalPayment,
                  totalDownPayment: totalDownPayment,
                  totalPpn: totalPpn,
                  remainingPayment: remainingPayment.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                  description: reservation.description,
                  bankName: detailBank == undefined ? "-" : detailBank.bank_name,
                  accountBank: detailBank == undefined ? "-" : detailBank.account_name,
                  rekBank: detailBank == undefined ? "-" : detailBank.account_no,
                  terms: termPartner.data.terms
                  // services: services
                }),
                attachments: {
                  filename: `${reservation.package_name}` + '_' + `${detailUser.name}` + '_' + `${moment(reservation.event_date).utcOffset(0).format("DD-MM-YYYY")}` + '.pdf',
                  contentType: 'application/pdf',
                  path: './views/invoice_manual.pdf'
                }
              };
              console.log("mailoptions :" + JSON.stringify(mailoptions));

              transporter.transporterSmtp.sendMail(mailoptions, function (error, res) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Message sent: " + res.response);
                }
                //smtpTransport.close();
              });

            }, 5000);
          })
        }
     }

    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};

exports.sendEmailToCustomerManual = async function (req, res, next) {
  try {
    const { reservationNo, statusCode, userId } = req;

    var counterParams = {
      reservation_no: reservationNo,
      status_code: statusCode
    };
    console.log(counterParams);

    var counter = await emailcounter.findCounter(counterParams);
    if (counter.success) {
      var dataCounter = counter.data;
      if (dataCounter.counter >= 11) {
        return res.status(500).send({ code: 500, success: false, message: "Kirim email untuk invoice " + reservationNo + " sudah dibatasi. Silahkan hubungi admin untuk bantuan.", data: {} });
      } else {
        dataCounter.counter = dataCounter.counter + 1;

        var updateCounter = await emailcounter.updateCounter(dataCounter);
      }
    } else {
      var dataCounter = counter.data;

      const params = {
        reservation_no: req.reservationNo,
        status_code: req.statusCode,
        counter: req.counter
      };

      var createCounter = await emailcounter.findOrCreateCounter(params, dataCounter);
    }

    const params = { };
     var where = " WHERE 1=1 "
 
     params.partner_id = userId;
     where += " AND rv.reservation_no = '" + reservationNo + "' "; 

     var paramPartner = { partner_id: userId };
          
     //  let reservation = await resv.findReservations(where);
     let data = await resv.sendEmailReservationManual(req);
     let bankPartner = await bank.getList(paramPartner);  

     if (data.success) {
       var reservation = data.data;
       var detailBank = bankPartner.data[0];
       var termPartner = await term.getPackage(reservation.package_id);

        if (reservation.status_code == "ORDER_NEW" || reservation.status_code == "ORDER_PARTNER_CONFIRM" || reservation.status_code == "ORDER_DP_COMPLETED" || reservation.status_code == "ORDER_PAYMENT_COMPLETED" || reservation.status_code == "ORDER_COMPLETED")
        {
          let getData = await resv.findReservation(reservationNo);   
          let dataUser = await partnerResv.getDetail(userId); 
          let packages = await term.getList(paramPartner);
      
          console.log(reservation);
          //create user by email n password
          //hash email
  
          //console.log('reservation[0] ' + JSON.stringify(getData.data.reservation_no));
    
          var statusPayment = "";
          if (reservation.status_code == "ORDER_NEW" || reservation.status_code == "ORDER_PARTNER_CONFIRM") {
            statusPayment = "Belum Dibayar";
          } else if (reservation.status_code == "ORDER_DP_COMPLETED") {
            statusPayment = "Sudah DP";
          } else if (reservation.status_code == "ORDER_PAYMENT_COMPLETED") {
            statusPayment = "Sudah Lunas";
          } else if (reservation.status_code == "ORDER_COMPLETED") {
            statusPayment = "Sudah Selesai";
          }

          var templateInvoice = fs.readFileSync('./views/invoice_manual.html', 'utf-8');
          var compileInvoice = Hogan.compile(templateInvoice);

          var zero = 0;
          var totalPrice = zero;
          var totalDiscount = zero;
          var totalPayment = zero;
          var totalDownPayment = zero;
          var totalPpn = zero;
          var remainingPayment = zero;

          if(reservation.total_price){
            totalPrice = parseInt(reservation.total_price);
          }

          if(reservation.total_discount){
            totalDiscount = parseInt(reservation.total_discount);
          }       
          
          // if(reservation.total_payment){
          //   totalPayment = reservation.total_payment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          // }

          if(reservation.total_down_payment){
            totalDownPayment = parseInt(reservation.total_down_payment);
          }

          if(reservation.total_ppn){
            totalPpn = parseInt(reservation.total_ppn);
          }

          var detailUser = getData.data.reservation_contact;

          // if (totalDiscount == 0 || totalDiscount == null) {
          //   totalDiscount = parseFloat(totalDiscount).toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          // }

          // if (totalDownPayment == 0 || totalDownPayment == null) {
          //   totalDownPayment = parseFloat(totalDownPayment).toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          // }

          // if (totalPpn == 0 || totalPpn == null) {
          //   totalPpn = parseFloat(totalPpn).toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          // }

          // if (totalPayment == 0 || totalPayment == null) {
          //   totalPayment = parseFloat(totalPayment).toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          // }
          
          // get template invoice html
          async function getTemplateHtml() {
            console.log("Loading template file in memory")
            try {
              const invoicePath = path.resolve("./views/invoice_manual_pdf.html");
              return await readFile(invoicePath, 'utf8');
            } catch (err) {
              return Promise.reject("Could not load html template");
            }
          }

          let arrObjPackages = JSON.parse(JSON.stringify(packages));
          // console.log("arrObjPackages");
          // console.log(arrObjPackages[0]);
          let arrPackagesMulti = arrObjPackages.map(data => data.partner_package_details.filter(val => val.reservation_no == reservation.reservation_no));
          console.log("arrPackagesMulti");
          console.log(arrPackagesMulti[0]);

          var allPricePackage = arrPackagesMulti[0].map((e) => e.price);
          console.log("allPricePackage");
          console.log(allPricePackage);
          var sumPricePackage = allPricePackage.reduce((a, b) => a + parseInt(b), 0);
          var getSumPackage = sumPricePackage ? (sumPricePackage + totalPrice) : totalPrice;
          console.log("getSumPackage");
          console.log(getSumPackage);

          var subTotal = getSumPackage - totalDiscount;
          var sumPayment = subTotal + totalPpn;

          console.log("subTotal");
          console.log(subTotal);
          console.log("totalPpn");
          console.log(totalPpn);

          var remainingPayment = sumPayment - totalDownPayment;
          console.log("remainingPayment");
          console.log(remainingPayment);

          if (getData.data.status_code == "ORDER_PAYMENT_COMPLETED" || getData.data.status_code == "ORDER_COMPLETED") {
            remainingPayment = 0;
            totalPayment = totalDownPayment + remainingPayment;
          } else {
            totalPayment = totalDownPayment
          }
          console.log("totalPayment");
          console.log(totalPayment);

          let formatCurrencyPrice = [];
          arrPackagesMulti[0].map(data => {
            var format = {
              id: data.id,
              package_header_id: data.package_header_id,
              reservation_no: data.reservation_no,
              sub_service_title: data.sub_service_title,
              price: data.price.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              description: data.description,
              duration: data.duration,
              additional_services: data.additional_services,
              terms: data.term,
              created_by: data.created_by,
              updated_by: data.updated_by,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            };
            formatCurrencyPrice.push(format);
          });
          // console.log("formatCurrencyPrice");
          // console.log(formatCurrencyPrice);

          // generate template invoice html into pdf
          async function generatePdf() {
            let data = {
              partnerName: dataUser.data.partnername,
              partnerAddress: dataUser.data.address,
              packageName: reservation.package_name,
              packagesMulti: formatCurrencyPrice,
              eventDate: moment(reservation.event_date).utcOffset(0).format("DD-MM-YYYY"),
              eventTime: reservation.event_time,
              eventAddress: reservation.event_address,
              codeInvoice: reservation.reservation_no,
              invoiceDate: moment(reservation.reservation_date).utcOffset(0).format("DD-MM-YYYY"),
              customerName: detailUser.name,
              customerAddress: detailUser.address,
              completePayment: statusPayment,
              sumPackage: getSumPackage.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              subTotal: subTotal.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              sumPayment: sumPayment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              totalPrice: totalPrice.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              totalDiscount: totalDiscount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              totalPayment: totalPayment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              totalDownPayment: totalDownPayment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              totalPpn: totalPpn.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              remainingPayment: remainingPayment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              description: reservation.description,
              bankName: detailBank == undefined ? "-" : detailBank.bank_name,
              accountBank: detailBank == undefined ? "-" : detailBank.account_name,
              rekBank: detailBank == undefined ? "-" : detailBank.account_no,
              terms: termPartner.data.terms
            }

            getTemplateHtml().then(async (res) => {
              // Now we have the html code of our template in res object
              // you can check by logging it on console
              // console.log(res)
              console.log("Compiling the template with handlebars")
              const template = hb.compile(res, { strict: true });
              // we have compile our code with handlebars
              const result = template(data);
              // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
              const html = result;

              // puppeteer only support vps cloud
              // we are using headless mode
              // const browser = await puppeteer.launch({headless: true});
              // const page = await browser.newPage()
              // // We set the page content as the generated html by handlebars
              // await page.setContent(html)
              // // We use pdf function to generate the pdf in the same folder as this file.
              // await page.pdf({ 
              //   path: './views/invoice_manual.pdf', 
              //   format: 'A4',
              //   printBackground: true,
              //   displayHeaderFooter: true,
              //   footerTemplate: `<div style="font-size: 9px; padding-top: 8px; text-align: center; width: 100%;color: #444444">
              //   <span>HaiO Invoice</span> - <span class="pageNumber"></span>/<span class="totalPages"></span>
              //   </div>
              //   `,
              //   margin: {top: '50px', right: '10px', bottom: '50px', left: '10px', }
              // })
              // await browser.close();
              // console.log("PDF Generated");

              // render file html
              // fs.writeFile("./views/test.html", result, function(err) {
              //   if(err) {
              //       return console.log(err);
              //   }
              // });

              var datenow = moment(new Date).format("DD MMM YYYY H:mm:ss");

              var options = { 
                format: 'A4',
                orientation: "portrait",
                header: {
                  height: "20mm",
                  contents: {
                    first: `<div style="font-size: 11px; padding-top: 8px; text-align: center; width: 100%;color: #444">
                      <span style="color: #444;">${datenow}</span>
                    </div>`
                  }
                },
                footer: {
                  height: "30mm",
                  contents: {
                    default: `<div style="font-size: 11px; padding-top: 8px; text-align: center; width: 100%;color: #444">
                    <span>HaiO Invoice</span> - <span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>
                    </div>`, // fallback value
                  }
                },
              };

              pdf.create(html, options).toFile('./views/invoice_manual.pdf', function(err, res) {
                console.log('This is a toFile:', res);
              });              

            }).catch(err => {
              console.error(err);
            });
          }

          generatePdf().then(async (res) => {
            setTimeout(() => {
              let mailoptions = {
                from: '"Haio Invoice" notify@haibersama.com',
                to: getData.data.reservation_contact.email,
                subject: `Invoice #${reservation.reservation_no} dari partner ${dataUser.data.partnername}`,
                html: compileInvoice.render({
                  partnerName: dataUser.data.partnername,
                  partnerAddress: dataUser.data.address,
                  packageName: reservation.package_name,
                  packagesMulti: formatCurrencyPrice,
                  eventDate: moment(reservation.event_date).utcOffset(0).format("DD-MM-YYYY"),
                  eventTime: reservation.event_time,
                  eventAddress: reservation.event_address,
                  codeInvoice: reservation.reservation_no,
                  invoiceDate: moment(reservation.reservation_date).utcOffset(0).format("DD-MM-YYYY"),
                  customerName: detailUser.name,
                  customerAddress: detailUser.address,
                  completePayment: statusPayment,
                  sumPackage: getSumPackage.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                  subTotal: subTotal.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                  sumPayment: sumPayment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                  totalPrice: totalPrice.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                  totalDiscount: totalDiscount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                  totalPayment: totalPayment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                  totalDownPayment: totalDownPayment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                  totalPpn: totalPpn.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                  remainingPayment: remainingPayment.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                  description: reservation.description,
                  bankName: detailBank == undefined ? "-" : detailBank.bank_name,
                  accountBank: detailBank == undefined ? "-" : detailBank.account_name,
                  rekBank: detailBank == undefined ? "-" : detailBank.account_no,
                  terms: termPartner.data.terms
                  // services: services
                }),
                attachments: {
                  filename: `${reservation.package_name}` + '_' + `${detailUser.name}` + '_' + `${moment(reservation.event_date).utcOffset(0).format("DD-MM-YYYY")}` + '.pdf',
                  contentType: 'application/pdf',
                  path: './views/invoice_manual.pdf'
                }
              };
              console.log("mailoptions :" + JSON.stringify(mailoptions));

              transporter.transporterSmtp.sendMail(mailoptions, function (error, res) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Message sent: " + res.response);
                }
                //smtpTransport.close();
              });

            }, 5000);
          })
        }
     }

    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};

exports.updateTotalInvoice = async function (req, res, next) {
  try {
    const { reservationNo, userId } = req;

    const params = {};
    var where = " WHERE 1=1 "

    params.partner_id = userId;
    where += " AND rv.reservation_no = '" + reservationNo + "' ";

    //  let reservation = await resv.findReservations(where);
    let data = await resv.updateTotalInvoiceManual(req);

    if (data.success == true) {
      return res.status(200).send(data);
    } else {
      return res.status(500).send(data);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};

exports.updateConfirmationPayment = async function (req, res, next) {
  try {
    const { reservationNo, userId } = req;

    const params = {};
    var where = " WHERE 1=1 "

    params.partner_id = userId;
    where += " AND rv.reservation_no = '" + reservationNo + "' ";

    //  let reservation = await resv.findReservations(where);
    let data = await resv.updateConfirmationPaymentImage(req);

    if (data.success == true) {
      return res.status(200).send(data);
    } else {
      return res.status(500).send(data);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};
