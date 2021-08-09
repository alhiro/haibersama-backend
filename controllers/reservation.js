const resv = require("../services/reservation");
const bank = require("../services/partnerbankaccount");
const term = require("../services/partnerpackage");
const partnerResv = require("../services/partner");
const emailcounter = require("../services/emailcounter");
const sequelizeTransaction = require("../config/sequelizeTransaction");
const { VERIFY_URL, EMAIL_PASSWORD, EMAIL_USERNAME } = process.env;
const moment = require("moment");
var nodemailer = require("nodemailer");
var Hogan = require("hogan.js");
var fs = require("fs");

exports.createReservation = async function(req, res, next) {
    try {  
      if(req.reservationType === "MANUAL_ORDER")
      {
        if(req.reservationDate === null)
        {
          return res.status(400).send({ code: 400, success: false, message: "Please input reservation date.", data: {} });
        }
      }  

        if(!req.packageId || req.packageId == 0)
        {
          return res.status(400).send({ code: 400, success: false, message: "Please select package.", data: {} });
        }else if(!req.eventDate)
        {
          return res.status(400).send({ code: 400, success: false, message: "Event date is null", data: {} });
        }else if(!req.eventTime)
        {
          return res.status(400).send({ code: 400, success: false, message: "Event time is null", data: {} });
        }else if(!req.eventAddress)
        {
          return res.status(400).send({ code: 400, success: false, message: "Event address is null or empty", data: {} });
        }else if(!req.name)
        {
          return res.status(400).send({ code: 400, success: false, message: "Name is null or empty", data: {} });
        }else if(!req.phoneNo || !req.waNo)
        {
          return res.status(400).send({ code: 400, success: false, message: "Phone No or WA No is null or empty", data: {} });
        }else if(!req.email)
        {
          return res.status(400).send({ code: 400, success: false, message: "Email is null or empty", data: {} });
        }

        let response = await resv.findOrCreateReservation(req);
        response.code = response.success ? 200 : 500;
      return res.status(200).send(response);
    } catch (err) {
      return res
        .status(500)
        .send({ code: 500, success: false, message: err.message, data: {} });
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
  
            var smtpTransport = nodemailer.createTransport({
              host: "missandei.id.rapidplex.com",
              port: 465,
              secure: true,
              auth: {
                user: EMAIL_USERNAME,
                pass: EMAIL_PASSWORD
              }
            });

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
              from: '"Hai Info" notify@haiorganizer.com',
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

            smtpTransport.sendMail(mailoptions, function(error, res) {
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
      let data = await resv.updateStatusReservationManual(req);
      let bankPartner = await bank.getList();
      
      if (data.success) {
        var reservation = data.data;
        var detailBank = bankPartner.data[0];
        var termPartner = await term.getPackage(reservation.package_id);

        console.log('list banks');
        console.log(detailBank);

        if(reservation.status_code == "ORDER_NEW" || reservation.status_code == "ORDER_PARTNER_CONFIRM" || reservation.status_code == "ORDER_DP_COMPLETED" || reservation.status_code == "ORDER_PAYMENT_COMPLETED")
        {
          let getData = await resv.findReservation(reservation.reservation_no);
          let dataUser = await partnerResv.getDetail(reservation.partner_id);  
          //console.log(dataUser);

          var smtpTransport = nodemailer.createTransport({
            host: "missandei.id.rapidplex.com",
            port: 465,
            secure: true,
            auth: {
              user: EMAIL_USERNAME,
              pass: EMAIL_PASSWORD
            }
          });

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

          let mailoptions = {
            from: '"Haio Invoice" notify@haiorganizer.com',
            to: getData.data.reservation_contact.email,
            subject: `Invoice #${reservation.reservation_no} dari partner ${dataUser.data.partnername}`,
            html: compileInvoice.render({
              partnerName: dataUser.data.partnername,
              partnerAddress: dataUser.data.address,
              packageName: reservation.package_name,
              eventDate: moment(reservation.event_date).utcOffset(0).format("DD-MM-YYYY"),
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
              remainingPayment: remainingPayment.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
              description: reservation.description,
              bankName: detailBank.bank_name,
              accountBank: detailBank.account_name,
              rekBank: detailBank.account_no,
              terms: termPartner.data.terms
              // services: services
            })
          };
          // console.log("mailoptions :" + JSON.stringify(mailoptions));

          smtpTransport.sendMail(mailoptions, function(error, res) {
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

exports.getReservation = async function(req, res, next) {
    try {
        const { body } = req;
        const { reservationNo } = body;
    
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
      var where = " "

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
      let data = await resv.findReservationsGroupByCategory(where);
      data.code = data.success ? 200 : 500;
      return res.status(200).send(data);
  
    } catch (err) {
      console.log(err);
      return res.status(500).send({ data: err });
    }    
};


exports.getSuccessReservations = async function(req, res, next) {
  try {
      const { eventFrom, eventTo,  userId,  } = req;
      
      //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

      const params = { };
      var where = " WHERE 1=1 "

      params.partner_id = userId;
      where += " AND rv.partner_id = " + userId; 

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

      var smtpTransport = nodemailer.createTransport({
        host: "missandei.id.rapidplex.com",
        port: 465,
        secure: true,
        auth: {
          user: EMAIL_USERNAME,
          pass: EMAIL_PASSWORD
        }
      });

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
        from: '"<notify>" notify@haiorganizer.com',
        to: email,
        subject: "Invoice",
        html: emailBody
      };
      console.log("mailoptions :" + JSON.stringify(mailoptions));

      smtpTransport.sendMail(mailoptions, function(error, res) {
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
        message: "Success to send email",
        data: {}
      });
    } else {
      return res.status(401).send({
        code: 401,
        success: false,
        message: "Failed to send email",
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
 
       var smtpTransport = nodemailer.createTransport({
         host: "missandei.id.rapidplex.com",
         port: 465,
         secure: true,
         auth: {
           user: EMAIL_USERNAME,
           pass: EMAIL_PASSWORD
         }
       });

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
         from: '"Haio Invoice" notify@haiorganizer.com',
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
 
       smtpTransport.sendMail(mailoptions, function(error, res) {
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
         message: "Success to send email",
         data: {}
       });
     } else {
       return res.status(401).send({
         code: 401,
         success: false,
         message: "Failed to send email",
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
      if (dataCounter.counter >= 3) {
        return res.status(500).send({ code: 500, success: false, message: "Reach limit send email for reservation number " + reservationNo, data: {} });
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
          
     //  let reservation = await resv.findReservations(where);
     let data = await resv.updateStatusReservationManual(req);
     let bankPartner = await bank.getList();     

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
    
          var smtpTransport = nodemailer.createTransport({
            host: "missandei.id.rapidplex.com",
            port: 465,
            secure: true,
            auth: {
              user: EMAIL_USERNAME,
              pass: EMAIL_PASSWORD
            }
          });

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

          var detailUser = getData.data.reservation_contact;

          remainingPayment = parseInt(totalPayment.replace(/[$,]/g, '')) - (parseInt(totalDiscount.replace(/[$,]/g, '')) + parseInt(totalDownPayment.replace(/[$,]/g, '')));

          if (getData.data.status_code == "ORDER_PAYMENT_COMPLETED") {
            remainingPayment = 0;
          }

          if (totalDownPayment == 0 || totalDownPayment == null) {
            totalDownPayment = parseFloat(totalDownPayment).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          }
          
          let mailoptions = {
            from: '"Haio Invoice" notify@haiorganizer.com',
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
              bankName: detailBank.bank_name,
              accountBank: detailBank.account_name,
              rekBank: detailBank.account_no,
              terms: termPartner.data.terms
              // services: services
            })
          };
          console.log("mailoptions :" + JSON.stringify(mailoptions));
    
          smtpTransport.sendMail(mailoptions, function(error, res) {
            if (error) {
              console.log(error);
            } else {
              console.log("Message sent: " + res.response);
            }
            //smtpTransport.close();
          });
        } else {
          return res.status(401).send({
            code: 401,
            success: false,
            message: "Failed to send email",
            data: {}
          });
        }
     }

    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};
