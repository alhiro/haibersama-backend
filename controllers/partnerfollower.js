const follower = require("../services/partnerfollower");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getAllFollower = async function (req, res, next) {
  try {
    var object = await follower.getAll();
    return res.status(200).json(
      { status: 200, data: object, message: "Semua Follower Berhasil Diambil" }
    );
  } catch (err) {
    return res
      .status(500)
      .send(
        { code: 500, success: false, message: err.message, data: { err } }
      );
  }
};

exports.getByIdFollower = async function (req, res, next) {
  try {
    const { limitItem, page, partnerId, email, userId, type } = req;

    let data = await follower.getById(res, partnerId, limitItem, page);
    data.code = data.success ? 200 : 500;
    return res.status(200).send(data);

    // return res.status(200).json(
    //   { status: 200, data: object, message: "Semua Follower Berhasil Diambil" }
    // );
  } catch (err) {
    return res
      .status(500)
      .send(
        { code: 500, success: false, message: err.message, data: { err } }
      );
  }
};

exports.addFollower = async function (req, res, next) {
  try {
    console.log("controller add follower");
    const params = { 
      user_id: req.user_id,
      partner_id: req.partner_id 
    };
    console.log(params);

    let insertFollower = await follower.findOrCreateFollower(params, req);
    return res.status(200).send(insertFollower);
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.updateFollower = async function (req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { id: req.body.id };

    const findFollower = await follower.findFollower(params);
    console.log("findFollower :", findFollower)
    if (findFollower.success === true) {
      let updateFollower = await follower.updateFollower(params, req);
      return res.status(200).send(updateFollower);
    }

  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.deleteFollower = async function(req, res, next) {
  try {
    var result = await follower.delete(req);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};