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
  cash_type: req.query.cash_type || req.query.cashType,
  category: req.query.category,
  payment_method: req.query.payment_method || req.query.paymentMethod,
  source_module: req.query.source_module || req.query.sourceModule,
  invoice_type: req.query.invoice_type || req.query.invoiceType,
  invoice_no: req.query.invoice_no || req.query.invoiceNo,
  customer: req.query.customer,
  transaction_type: req.query.transaction_type || req.query.transactionType,
  transaction_no: req.query.transaction_no || req.query.transactionNo,
  channel: req.query.channel,
  payment_status: req.query.payment_status || req.query.paymentStatus,
  po_type: req.query.po_type || req.query.poType || req.query.purchaseOrderType,
  po_no: req.query.po_no || req.query.poNo || req.query.purchaseOrderNo,
  expense_type: req.query.expense_type || req.query.expenseType,
  expense_no: req.query.expense_no || req.query.expenseNo,
  product: req.query.product,
  production_batch: req.query.production_batch || req.query.productionBatch,
  cashflow_reference: req.query.cashflow_reference || req.query.cashflowReference,
  vendor: req.query.vendor,
  employee: req.query.employee,
  actorEmail: resSafeAuth(req).email,
  actorRole: resSafeAuth(req).erpRole,
});

const resSafeAuth = (req) => (req.res && req.res.locals && req.res.locals.auth) || {};

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

const partnerId = (res) => res.locals.auth.partnerId || res.locals.auth.id;

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

exports.getOwnerDashboard = async (req, res) => {
  try {
    const result = await erpService.getOwnerDashboard(partnerId(res));
    return res.status(200).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getRoleApprovalDashboard = async (req, res) => {
  try {
    const result = await erpService.getRoleApprovalDashboard(partnerId(res));
    return res.status(200).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const id = req.body.id || req.query.id;
    const result = await erpService.approveRequest(partnerId(res), id, req.body, res.locals.auth.email, res.locals.auth.erpRole);
    return res.status(result.success ? 200 : 404).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const id = req.body.id || req.query.id;
    const result = await erpService.rejectRequest(partnerId(res), id, req.body, res.locals.auth.email, res.locals.auth.erpRole);
    return res.status(result.success ? 200 : 404).send(result);
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
    const result = await erpService.getList(req.params.module, partnerId(res), listParams(req));
    return sendList(res, result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getDetail = async (req, res) => {
  try {
    const result = await erpService.getDetail(req.params.module, partnerId(res), req.query.id, res.locals.auth.email, res.locals.auth.erpRole);
    return res.status(result.success ? 200 : 404).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.create = async (req, res) => {
  try {
    const body = { ...req.body };
    if (String(req.params.module || '').toLowerCase() === 'attendance') {
      const now = new Date();
      const isCheckOut = body.attendanceAction === 'Check Out' ||
        body.checkOutMode === true ||
        body.check_out ||
        body.checkOut;
      body.name = body.name || res.locals.auth.name || res.locals.auth.email || 'Absensi Karyawan';
      body.employee = body.employee || res.locals.auth.name || res.locals.auth.email;
      body.employeeEmail = body.employeeEmail || res.locals.auth.email;
      body.employeeRole = body.employeeRole || res.locals.auth.erpRole;
      body.department = body.department || res.locals.auth.erpDepartment;
      body.workDate = body.workDate || now;
      if (isCheckOut) {
        body.checkOut = body.checkOut || body.check_out || now;
      } else {
        body.checkIn = body.checkIn || body.check_in || now;
      }
      body.attendanceType = body.attendanceType || 'Mobile';
    }
    const result = await erpService.create(req.params.module, partnerId(res), body, res.locals.auth.email, res.locals.auth.erpRole);
    return res.status(result.success ? 200 : 400).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.body.id || req.query.id;
    const result = await erpService.update(req.params.module, partnerId(res), id, req.body, res.locals.auth.email, res.locals.auth.erpRole);
    return res.status(result.success ? 200 : 404).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.body.id || req.query.id;
    const result = await erpService.delete(req.params.module, partnerId(res), id, res.locals.auth.email, res.locals.auth.erpRole);
    return res.status(result.success ? 200 : 404).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const result = await erpService.getMetrics(req.params.module, partnerId(res), res.locals.auth.email, res.locals.auth.erpRole);
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
    const result = await erpService.scan(req.params.module, partnerId(res), req.body, res.locals.auth.email, res.locals.auth.erpRole);
    return res.status(200).send(result);
  } catch (err) {
    return handleError(res, err);
  }
};
