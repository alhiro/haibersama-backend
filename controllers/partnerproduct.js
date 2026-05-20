const partnerProductService = require('../services/partnerproduct');

const getQueryParams = (req) => ({
  page: req.query.page,
  limit: req.query.limit,
  search: req.query.search,
  status: req.query.status,
  warehouse: req.query.warehouse,
  productionBatch: req.query.productionBatch || req.query.production_batch,
  startDate: req.query.startDate,
  endDate: req.query.endDate,
});

const sendListResponse = (res, result) => res.status(200).json({
  success: result.success,
  data: result.data,
  message: result.message,
  page: result.page,
  pageCount: result.count,
  length: result.length,
});

exports.getOptions = async (req, res) => {
  try {
    const result = await partnerProductService.getOptions();
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getAll = async (req, res) => {
  try {
    const partnerId = res.locals.auth.id;
    const result = await partnerProductService.getList(partnerId, getQueryParams(req));
    return sendListResponse(res, result);
  } catch (err) {
    return res.status(500).send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getPublicList = async (req, res) => {
  try {
    const partnerId = req.query.partner_id || req.query.partnerId;
    const result = await partnerProductService.getList(partnerId, getQueryParams(req), true);
    return sendListResponse(res, result);
  } catch (err) {
    return res.status(500).send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const result = await partnerProductService.getDetail(req.query.id, res.locals.auth.id);
    return res.status(result.success ? 200 : 404).send(result);
  } catch (err) {
    return res.status(500).send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getPublicDetail = async (req, res) => {
  try {
    const result = await partnerProductService.getDetail(req.query.id, null, true);
    return res.status(result.success ? 200 : 404).send(result);
  } catch (err) {
    return res.status(500).send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.create = async (data, res) => {
  try {
    const result = await partnerProductService.create(data);
    return res.status(result.success ? 200 : 400).send(result);
  } catch (err) {
    return res.status(500).send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.update = async (data, res) => {
  try {
    const result = await partnerProductService.update(data);
    return res.status(result.success ? 200 : 404).send(result);
  } catch (err) {
    return res.status(500).send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.delete = async (data, res) => {
  try {
    const result = await partnerProductService.delete(data);
    return res.status(result.success ? 200 : 404).send(result);
  } catch (err) {
    return res.status(500).send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const result = await partnerProductService.getMetrics(res.locals.auth.id);
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.getMarketplaceList = async (req, res) => {
  try {
    const partnerId = req.query.partner_id || req.query.partnerId || (parseInt(res.locals.auth.type) === 2 ? res.locals.auth.id : null);
    const result = await partnerProductService.getMarketplaceList(partnerId, getQueryParams(req));
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send({ code: 500, success: false, message: err.message, data: { err } });
  }
};
