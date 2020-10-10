const resv = require("../services/reservation");
const sequelizeTransaction = require("../config/sequelizeTransaction");
const { VERIFY_URL } = process.env;

exports.createReservation = async function(req, res, next) {
    try {  
      if(req.reservationType === "103102")
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
            where += " AND partner_id = " + userId;
        }else{
            params.user_id = userId;
            where += " AND user_id = " + userId;
        }        

        if(statusCode != ""){
          params.status_code = statusCode;
          where += " AND status_code = '" + statusCode + "' ";
        }
        
        if(categoryId > 0){
          params.category_id = categoryId;
          where += " AND category_id = " + categoryId + " ";
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