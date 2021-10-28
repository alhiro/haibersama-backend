const eventService = require("../services/event");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getAllEvent = async function (req, res, next) {
  try {
    var allData = await eventService.getAll();
    return res.status(200).json({ status: 200, data: allData, message: "Semua Event Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getEvent = async function (req, res, next) {
  try {
    const params = { id: req.query.id };
    var findEvent = await eventService.find(params);
    return res.status(200).json({ status: 200, data: findEvent.data, message: findEvent.message });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getEventPartner = async function (req, res, next) {
  const partner_id = parseInt(req.query.partnerid);
  console.log("controller search event partner_id " + partner_id);
  try {
    var findEvent = await eventService.findAll(partner_id);
    return res.status(200).json({ status: 200, data: findEvent, message: "Event Partner Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.searchEvent = async function (req, res, next) {
  console.log("controller search event " + JSON.stringify(req.query));
  try {
        var events = await eventService.search(req.query);
        return res.status(200).json({ status: 200, data: events, message: "Pencarian Event Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.addEvent = async function (req, res, next) {
  try {
    console.log("controller add event")
    const params = { title: req.title };

    let insertEvent = await eventService.findOrCreate(params, req);
    return res.status(200).send(insertEvent);
  } catch (err) {
    console.log(err)
    return res.status(500).send({ data: err });
  }
};

exports.updateEvent = async function (req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { id: req.id };
    console.log(req);

    const findEvent = await eventService.find(params);
    console.log("find Event :", findEvent)
    if (findEvent.success === true) {
      let updateEvent = await eventService.update(params, req);
      return res.status(200).send(updateEvent);
    } else
      return res.status(400).send(findEvent);

  } catch (err) {
    return res.status(500).send({ data: err });
  }
};
