const resv = require("../services/reservation");
const sequelizeTransaction = require("../config/sequelizeTransaction");
const { VERIFY_URL } = process.env;

exports.createReservation = async function(req, res, next) {
    try {
        //const transaction = await sequelizeTransaction.transaction();
        const params = { name: req.body.name };
    
        let insertData = await resv.addReservation(params, req);
        return res.status(200).send(insertData);
      } catch (err) {
        return res.status(500).send({ data: err });
      }    
};