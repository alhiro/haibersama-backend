const partnerrating = require("../services/partnerrating");
const sequelizeTransaction = require("../config/sequelizeTransaction");

exports.getAllRating = async function(req, res, next) {
  try {
    const reservationId = req;
    console.log(reservationId);
    var params = { reservation_id: reservationId };
    var rating = await partnerrating.getList(params);
    return res
      .status(rating.status == "200" ? 200 : 500)
      .json({ status: rating.status, data: rating.data, message: "Retrieved data" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.addRating = async function(req, res, next) {
  try {
    const params = { reservation_id: req.reservationId };

    let result = await partnerrating.findOrCreateRating(params, req);
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.replyReview = async function(req, res, next) {
  try {
    let result = await partnerrating.replyReview(req);
    return res.status(200).send(result);    
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};
