const erpService = require('../services/erp');

const listParams = (req) => ({
  page: req.query.page,
  limit: req.query.limit,
  search: req.query.search,
  status: req.query.status,
  startDate: req.query.startDate,
  endDate: req.query.endDate,
  warehouse: req.query.warehouse,
  supplier: req.query.supplier,
  reference: req.query.reference,
  production_place: req.query.production_place || req.query.productionPlace,
  output_product: req.query.output_product || req.query.outputProduct,
  report_type: req.query.report_type || req.query.reportType,
});

const sendList = (res, result) => res.status(200).json({
  success: result.success,
  data: result.data,
  message: result.message,
  page: result.page,
  pageCount: result.count,
  length: result.length,
});

const handleError = (res, err) => {
  const status = err.message === 'Modul ERP tidak ditemukan' ? 400 : 500;
  return res.status(status).send({
  code: status,
  success: false,
  message: err.message,
  data: { err },
});
};

exports.getModules = async (req, res) => {
  try {
    return res.status(200).send({
      success: true,
      message: 'Daftar Modul ERP Berhasil Diambil',
      data: erpService.modules(),
    });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getOptions = async (req, res) => {
  try {
    const result = erpService.getOptions(req.params.module);
    return res.status(200).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getList = async (req, res) => {
  try {
    const result = await erpService.getList(req.params.module, res.locals.auth.id, listParams(req));
    return sendList(res, result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getDetail = async (req, res) => {
  try {
    const result = await erpService.getDetail(req.params.module, res.locals.auth.id, req.query.id);
    return res.status(result.success ? 200 : 404).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.create = async (req, res) => {
  try {
    const result = await erpService.create(req.params.module, res.locals.auth.id, req.body, res.locals.auth.email);
    return res.status(result.success ? 200 : 400).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.body.id || req.query.id;
    const result = await erpService.update(req.params.module, res.locals.auth.id, id, req.body, res.locals.auth.email);
    return res.status(result.success ? 200 : 404).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.body.id || req.query.id;
    const result = await erpService.delete(req.params.module, res.locals.auth.id, id);
    return res.status(result.success ? 200 : 404).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const result = await erpService.getMetrics(req.params.module, res.locals.auth.id);
    return res.status(200).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getBarcodeConfig = async (req, res) => {
  try {
    const result = erpService.getBarcodeConfig(req.params.module);
    return res.status(200).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.scan = async (req, res) => {
  try {
    const result = await erpService.scan(req.params.module, res.locals.auth.id, req.body, res.locals.auth.email);
    return res.status(200).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};
