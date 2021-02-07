const resv = require("../services/reservation");
const sequelizeTransaction = require("../config/sequelizeTransaction");
const { VERIFY_URL, EMAIL_PASSWORD, EMAIL_USERNAME } = process.env;
var nodemailer = require("nodemailer");

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
          "<p>Status: " + reservation.transaction_status_code + "</p>";
          "<p>This is your invoice:</p>";

          emailBody += "<table>"; 
          emailBody += "<th><td>Category</td><td>Reservation No</td><td>Reservation Date</td><td>Event Date</td><td>Total Price</td></th>";
               
          emailBody += "<tr><td>" + reservation.category + "</td><td>" + reservation.reservation_no + "</td><td>" + reservation.reservation_date + "</td><td>" + reservation.event_date + "</td><td>" + reservation.total_price + "</td></tr>";
          
          
          emailBody += "</table>" +
          "<br><br>" +
          "<p>--Team</p>";

          // console.log(emailBody);

          let mailoptions = {
            from: '"<notify>" notify@haiorganizer.com',
            to: req.email,
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
 