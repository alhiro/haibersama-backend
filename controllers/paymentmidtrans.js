const paymentmidtrans = require("../services/paymentmidtrans");

exports.createPayment = async function(req, res, next) {
    try {   

        if(!req.reservationNo)
        {
          return res.status(400).send({ code: 400, success: false, message: "Invalid reservation no.", data: {} });
        }else if(!req.paymentType)
        {
          return res.status(400).send({ code: 400, success: false, message: "Please input payment type. (DOWN_PAYMENT, REPAYMENT, FULL_PAYMENT).", data: {} });
        }

        let response = await paymentmidtrans.findOrCreatePayment(req);
        response.code = response.success ? 200 : 500;
      return res.status(200).send(response);
    } catch (err) {
      return res
        .status(500)
        .send({ code: 500, success: false, message: err.message, data: {} });
    }  
};

exports.callback = async function(req, res, next) {
    try {            
        let data = await paymentmidtrans.updatePaymentCallback(req);
        return res.status(200).send(data);
      } catch (err) {
        console.log(err);
        return res.status(500).send({ data: err });
      }    
};
