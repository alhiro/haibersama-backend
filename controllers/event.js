const eventService = require("../services/event");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getAllEvent = async (req, res, next) => {
  try {
    const params = { page: req.query.page, limit: req.query.limit, search: req.query.search, startDate: req.query.startDate, endDate: req.query.endDate };

    var all = await eventService.getAll(params, res);
    return res.status(200).json(
      {
        success: all.success,
        data: all.data,
        message: all.message,
        page: all.page,
        pageCount: all.count,
        length: all.length
      });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getAllPublicLimit = async function (req, res, next) {
  try {
    const params = { page: req.query.page, limit: req.query.limit, search: req.query.search, startDate: req.query.startDate, endDate: req.query.endDate, };

    var allData = await eventService.getAllPublicLimit(params, res);
    return res.status(200).json({ status: 200, data: allData, message: "Semua Selayang Partner Berhasil Diambil" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getAllPublic = async (req, res, next) => {
  try {
    const params = { page: req.query.page, limit: req.query.limit, search: req.query.search, startDate: req.query.startDate, endDate: req.query.endDate };

    var all = await eventService.getAllPublic(params, res);
    return res.status(200).json(
      {
        success: all.success,
        data: all.data,
        message: all.message,
        page: all.page,
        pageCount: all.count,
        length: all.length
      });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getEventSelayang = async (req, res, next) => {
  try {
    const params = { page: req.query.page, limit: req.query.limit, search: req.query.search, startDate: req.query.startDate, endDate: req.query.endDate, };

    var all = await eventService.getListSelayang(params, res);
    return res.status(200).json(
      {
        success: all.success,
        data: all.data,
        message: all.message,
        page: all.page,
        pageCount: all.count,
        length: all.length
      });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getEvent = async function (req, res, next) {
  try {
    const params = { id: req.query.id };
    var findEvent = await eventService.find(params, res);
    return res.status(200).json({ status: 200, data: findEvent.data, message: findEvent.message });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getEventPartner = async (req, res, next) => {
  const partner_id = res.locals.auth.id;
  console.log("controller search event partner_id " + partner_id);
  try {
    const params = { partnerId: req.query.partner_id, page: req.query.page, limit: req.query.limit, search: req.query.search, startDate: req.query.startDate, endDate: req.query.endDate};

    var all = await eventService.findListSelayangPartner(partner_id, params);
    return res.status(200).json(
      {
        success: all.success,
        data: all.data,
        message: all.message,
        page: all.page,
        pageCount: all.count,
        length: all.length
      });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getEventPartnerPublic = async (req, res, next) => {
  const partner_id = res.locals.auth.id;
  console.log("controller search event partner_id " + partner_id);
  try {
    const params = { partnerId: req.query.partner_id, page: req.query.page, limit: req.query.limit, search: req.query.search, startDate: req.query.startDate, endDate: req.query.endDate};

    var all = await eventService.findListSelayangPartnerPublic(partner_id, params);
    return res.status(200).json(
      {
        success: all.success,
        data: all.data,
        message: all.message,
        page: all.page,
        pageCount: all.count,
        length: all.length
      });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.searchEvent = async function(req, res, next) {
  console.log("controller search event " + JSON.stringify(req.query));
  try {
    var events = await eventService.search(req.query);
    return res
      .status(200)
      .json({
        status: 200,
        data: events,
        message: "Pencarian Selayang Berhasil Diambil",
      });
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
    console.log("req.title : " + JSON.stringify(req.title));
    console.log("req.description : " + JSON.stringify(req.description));

    // if (!req.title || req.title.trim() === "" || !req.description || req.description.trim() === "") {
    //   return res.status(400).send({
    //     success: false,
    //     message: "Title dan deskripsi tidak boleh kosong.",
    //     data: {}
    //   });
    // }

    let insertEvent = await eventService.findOrCreate(params, req);
    return res.status(200).send(insertEvent);
  } catch (err) {
    console.log(err)
    return res.status(500).send({ data: err });
  }
};

exports.updateEvent = async function (data, req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { id: data.id };
    console.log("params event id");
    console.log(params);

    const findEvent = await eventService.find(params, res);
    if (findEvent.success === true) {
      let updateEvent = await eventService.update(data, req, params, findEvent.data.dataValues);
      return res.status(200).send(updateEvent);
    } else {
      return res.status(404).send(findEvent);
    }
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.deleteEvent = async function(req, res, next) {
  try {
    var result = await eventService.delete(req);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ data: err });
  }
};