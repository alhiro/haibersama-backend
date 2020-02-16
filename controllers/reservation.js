const resv = require("../services/reservation");
const sequelizeTransaction = require("../config/sequelizeTransaction");
const { VERIFY_URL } = process.env;

exports.createReservation = async function(req, res, next) {
    try {    
        let insertData = await resv.findOrCreateReservation(req);
        return res.status(200).send(insertData);
      } catch (err) {
        return res.status(500).send({ data: err });
      }    
};

exports.updateStatus = async function(req, res, next) {
    try {        
        const { body } = req;
    
        let data = await resv.updateStatusReservation(body);
        return res.status(200).send(data);
      } catch (err) {
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
        const { body } = req;
        const { statusCode, categoryId, userId, type } = body;
        
        //const paging = { limit: pageSize, offset: (page - 1) *  pageSize};

        const params = { };

        if(type == 2){
            params = { partner_id: userId };
        }else{
            params = { user_id: userId };
        }        

        if(!statusCode && statusCode != ""){
          params.statusCode = statusCode;
        }
        
        if(!categoryId && categoryId > 0){
          params.categoryId = categoryId;
        }
            
        let data = await resv.findReservations(params, paging);
        return res.status(200).send(data);
    
      } catch (err) {
        return res.status(500).send({ data: err });
      }    
};