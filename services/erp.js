const Sequelize = require('sequelize');
const ErpSupplier = require('../models/erpSupplier');
const ErpWarehouse = require('../models/erpWarehouse');
const ErpInventory = require('../models/erpInventory');
const ErpProduction = require('../models/erpProduction');
const ErpReport = require('../models/erpReport');
const ErpCashFlow = require('../models/erpCashFlow');
const ErpInvoice = require('../models/erpInvoice');
const ErpTransaction = require('../models/erpTransaction');
const ErpPurchaseOrder = require('../models/erpPurchaseOrder');
const ErpExpense = require('../models/erpExpense');
const ErpScanHistory = require('../models/erpScanHistory');

const Op = Sequelize.Op;

const MODULES = {
  supplier: {
    label: 'Supplier',
    model: ErpSupplier,
    titleField: 'name',
    defaultStatus: 'Aktif',
    statuses: ['Aktif', 'Review', 'Hold'],
    extraFields: {
      relation: ['Outer Linen Oversize', 'Kemeja Basic Twill', 'Dress Rayon Premium', 'Semua SKU publish'],
    },
  },
  purchaseorder: {
    label: 'Purchase Order',
    model: ErpPurchaseOrder,
    titleField: 'name',
    defaultStatus: 'Draft',
    statuses: ['Draft', 'Dikirim Supplier', 'Dikonfirmasi', 'Barang Diterima', 'Sebagian Diterima', 'Batal'],
    extraFields: {
      poType: ['Bahan Baku', 'Produk Jadi', 'Packaging', 'Jasa Produksi', 'Operasional'],
      supplier: ['CV Sumber Kain Bandung', 'PT Benang Nusantara', 'Gudang Packaging Prima', 'Vendor Aksesoris Garment'],
      warehouse: ['Warehouse Bahan Baku', 'Warehouse Produk Jadi', 'Area QC', 'Gudang Retur'],
      paymentStatus: ['Belum Bayar', 'DP', 'Lunas', 'Tempo', 'Batal'],
      paymentMethod: ['Tunai', 'Transfer Bank', 'QRIS', 'E-Wallet', 'Tempo'],
    },
  },
  expense: {
    label: 'Expense',
    model: ErpExpense,
    titleField: 'name',
    defaultStatus: 'Tercatat',
    statuses: ['Tercatat', 'Menunggu Bayar', 'Dibayar', 'Reimburse', 'Batal'],
    extraFields: {
      expenseType: ['Operasional', 'Produksi', 'Gaji', 'Marketing', 'Ongkir', 'Refund/Retur', 'Marketplace Fee', 'Lainnya'],
      category: [
        'Biaya Produksi',
        'Gaji Karyawan',
        'Ongkir',
        'Iklan Marketplace',
        'Refund/Retur',
        'Operasional Toko',
        'Sewa Gudang',
        'Lainnya',
      ],
      paymentStatus: ['Belum Bayar', 'DP', 'Lunas', 'Reimburse', 'Batal'],
      paymentMethod: ['Tunai', 'Transfer Bank', 'QRIS', 'E-Wallet', 'Marketplace', 'Tempo'],
      supplier: ['CV Sumber Kain Bandung', 'PT Benang Nusantara', 'Gudang Packaging Prima', 'Vendor Aksesoris Garment'],
      warehouse: ['Warehouse Bahan Baku', 'Warehouse Produk Jadi', 'Area QC', 'Gudang Retur'],
      product: ['Outer Linen Oversize', 'Kemeja Basic Twill', 'Dress Rayon Premium', 'Biaya non produk'],
      purchaseOrderNo: ['PO-SUP-2405-018', 'PO-PKG-2405-007'],
      productionBatch: ['Batch OUT-2405', 'Batch KMJ-1182', 'Batch DRS-2109'],
      sourceModule: ['Purchase Order', 'Production', 'Transaction', 'Invoice', 'Cash Flow', 'Manual'],
    },
  },
  warehouse: {
    label: 'Warehouse',
    model: ErpWarehouse,
    titleField: 'name',
    defaultStatus: 'Aktif',
    statuses: ['Aktif', 'Penuh', 'Maintenance'],
    extraFields: {
      relation: [
        'Kain Cotton Combed 30s - 7 gulung',
        'Outer Linen Oversize - 84 pcs',
        'Kemeja Basic Twill - 120 pcs',
        'Dress Rayon Batch 21 - 36 pcs hold QC',
      ],
    },
    barcode: {
      title: 'Scan Stok Gudang',
      description: 'Cek barang di rak, stok tersedia, batch, dan lokasi warehouse tanpa mencari manual.',
      buttonLabel: 'Scan',
      sheetTitle: 'Scan Stok Warehouse',
      code: 'HB-WH-FG-OUT-001',
      scannedItem: {
        name: 'Outer Linen Oversize',
        sku: 'HB-OUT-001',
        supplier: 'CV Sumber Kain Bandung',
        warehouse: 'Warehouse Produk Jadi',
        currentStock: '84 pcs',
        relation: 'Produksi Batch OUT-2405',
      },
      actions: ['Cek Stok', 'Barang Keluar', 'Transfer', 'Retur/QC'],
      defaultAction: 'Cek Stok',
      quantityLabel: 'Jumlah dicek / dipindahkan',
      defaultQuantity: '1 pcs',
    },
  },
  inventory: {
    label: 'Inventory',
    model: ErpInventory,
    titleField: 'name',
    defaultStatus: 'Barang Masuk',
    statuses: ['Barang Masuk', 'Dipakai Produksi', 'Barang Jadi', 'Hold QC', 'Transfer'],
    extraFields: {
      supplier: ['CV Sumber Kain Bandung', 'PT Benang Nusantara', 'Gudang Packaging Prima', 'Vendor Aksesoris Garment'],
      warehouse: ['Warehouse Bahan Baku', 'Warehouse Produk Jadi', 'Area QC', 'Gudang Retur'],
      relation: ['Outer Linen Oversize', 'Kemeja Basic Twill', 'Dress Rayon Premium', 'Batch OUT-2405', 'Batch KMJ-1182', 'Batch DRS-2109'],
    },
    barcode: {
      title: 'Scan Barang',
      description: 'Scan untuk barang masuk, keluar produksi, transfer gudang, barang jadi, atau QC.',
      buttonLabel: 'Scan',
      sheetTitle: 'Scan Barang Inventory',
      code: 'HB-MAT-COT30-0001',
      scannedItem: {
        name: 'Kain Cotton Combed 30s',
        sku: 'MAT-COT30-001',
        supplier: 'CV Sumber Kain Bandung',
        warehouse: 'Warehouse Bahan Baku',
        currentStock: '7 gulung',
        relation: 'Bahan untuk Outer Linen Oversize',
      },
      actions: ['Barang Masuk', 'Dipakai Produksi', 'Transfer', 'Barang Jadi', 'Hold QC'],
      defaultAction: 'Barang Masuk',
      quantityLabel: 'Jumlah barang',
      defaultQuantity: '1 gulung',
    },
  },
  production: {
    label: 'Produksi',
    model: ErpProduction,
    titleField: 'name',
    defaultStatus: 'Berjalan',
    statuses: ['Berjalan', 'QC', 'Selesai'],
    extraFields: {
      inventorySource: [
        'Kain Cotton Combed 30s - Warehouse Bahan Baku - 7 gulung',
        'Benang Jahit - Warehouse Bahan Baku - 12 cone',
        'Rayon Premium - Warehouse Bahan Baku - 5 roll',
      ],
      sourceWarehouse: ['Warehouse Bahan Baku', 'Gudang Retur'],
      outputProduct: ['Outer Linen Oversize', 'Kemeja Basic Twill', 'Dress Rayon Premium'],
      destinationWarehouse: ['Warehouse Produk Jadi', 'Area QC', 'Gudang Retur'],
      productionPlace: ['Tempat Jahit Bu Rina', 'QC Internal', 'Konveksi Mitra Bandung'],
    },
    barcode: {
      title: 'Scan Bahan Produksi',
      description: 'Ambil bahan dari gudang asal, cocokkan batch produksi, lalu stok bahan berkurang otomatis.',
      buttonLabel: 'Scan',
      sheetTitle: 'Scan Bahan Produksi',
      code: 'HB-BATCH-OUT-2405-MAT',
      scannedItem: {
        name: 'Kain Cotton Combed 30s',
        sku: 'MAT-COT30-001',
        supplier: 'CV Sumber Kain Bandung',
        warehouse: 'Warehouse Bahan Baku',
        currentStock: '7 gulung',
        relation: 'Batch OUT-2405',
      },
      actions: ['Ambil Bahan', 'Kirim QC', 'Selesai Produksi'],
      defaultAction: 'Ambil Bahan',
      quantityLabel: 'Jumlah bahan / hasil',
      defaultQuantity: '3 gulung',
    },
  },
  invoice: {
    label: 'Invoice',
    model: ErpInvoice,
    titleField: 'name',
    defaultStatus: 'Draft',
    statuses: ['Draft', 'Dikirim', 'Menunggu Bayar', 'Dibayar', 'Jatuh Tempo', 'Batal'],
    extraFields: {
      invoiceType: ['Produk', 'Jasa', 'Marketplace', 'Manual'],
      paymentMethod: ['Tunai', 'Transfer Bank', 'QRIS', 'E-Wallet', 'Marketplace', 'Tempo'],
      sourceModule: ['Transaction', 'Product', 'Service', 'Marketplace', 'Manual'],
    },
  },
  transaction: {
    label: 'Transaction',
    model: ErpTransaction,
    titleField: 'name',
    defaultStatus: 'Order Masuk',
    statuses: ['Order Masuk', 'Diproses', 'Dikirim', 'Selesai', 'Retur', 'Batal'],
    extraFields: {
      transactionType: ['Produk', 'Jasa', 'Marketplace', 'Manual'],
      channel: ['Toko', 'Marketplace', 'WhatsApp', 'Website', 'Manual'],
      paymentStatus: ['Belum Bayar', 'DP', 'Lunas', 'Refund', 'Batal'],
      paymentMethod: ['Tunai', 'Transfer Bank', 'QRIS', 'E-Wallet', 'Marketplace', 'Tempo'],
      warehouse: ['Warehouse Produk Jadi', 'Warehouse Bahan Baku', 'Area QC', 'Gudang Retur'],
    },
  },
  cashflow: {
    label: 'Cash Flow',
    model: ErpCashFlow,
    titleField: 'name',
    defaultStatus: 'Tercatat',
    statuses: ['Tercatat', 'Menunggu', 'Lunas', 'Batal'],
    extraFields: {
      cashType: ['Uang Masuk', 'Uang Keluar'],
      category: [
        'Penjualan Produk',
        'Penjualan Jasa',
        'Pembelian Supplier',
        'Biaya Produksi',
        'Gaji Karyawan',
        'Ongkir',
        'Iklan Marketplace',
        'Refund/Retur',
        'Operasional',
      ],
      paymentMethod: ['Tunai', 'Transfer Bank', 'QRIS', 'E-Wallet', 'Marketplace', 'Tempo'],
      sourceModule: ['Transaction', 'Invoice', 'Supplier', 'Production', 'Inventory', 'Expense', 'Manual'],
    },
  },
  report: {
    label: 'Laporan',
    model: ErpReport,
    titleField: 'title',
    defaultStatus: 'Publish',
    statuses: ['Publish', 'Draft', 'Review'],
    extraFields: {
      reportType: ['Penjualan Marketplace', 'Stok Rendah', 'Cash Flow Produksi', 'Owner Note'],
      period: ['Hari Ini', 'Minggu Ini', 'Bulan Ini', 'Custom'],
    },
  },
};

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const stringifyArray = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') return value;
  return JSON.stringify([value]);
};

const toBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  return ['true', '1', 'yes', 'aktif', 'active'].includes(String(value).toLowerCase());
};

const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(parsed) ? fallback : parsed;
};

const pickFirst = (...values) => values.find((value) => value !== undefined && value !== null);

const getConfig = (module) => {
  const config = MODULES[module];
  if (!config) {
    throw new Error('Modul ERP tidak ditemukan');
  }
  return config;
};

const searchFilter = (search, fields) => {
  if (!search || search.trim() === '') return null;

  const keyword = `%${search.toLowerCase()}%`;
  return fields.map((field) => Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(field)), { [Op.like]: keyword }));
};

const buildFilter = (module, partnerId, params = {}) => {
  const filter = { active: true };
  const config = getConfig(module);

  if (partnerId) filter.partner_id = partnerId;
  if (params.status) filter.status = params.status;
  if (params.startDate && params.endDate) {
    filter.created_at = { [Op.between]: [new Date(params.startDate), new Date(params.endDate)] };
  } else if (params.startDate) {
    filter.created_at = { [Op.gte]: new Date(params.startDate) };
  } else if (params.endDate) {
    filter.created_at = { [Op.lte]: new Date(params.endDate) };
  }

  [
    'warehouse',
    'supplier',
    'reference',
    'production_place',
    'output_product',
    'report_type',
    'cash_type',
    'category',
    'payment_method',
    'source_module',
    'invoice_type',
    'invoice_no',
    'customer',
    'transaction_type',
    'transaction_no',
    'channel',
    'payment_status',
    'po_type',
    'po_no',
    'expense_type',
    'expense_no',
    'product',
    'production_batch',
    'cashflow_reference',
    'vendor',
    'employee',
  ].forEach((key) => {
    if (params[key]) filter[key] = params[key];
  });

  const search = searchFilter(params.search, [config.titleField, 'description', 'status', 'meta']);
  if (search) filter[Op.or] = search;

  return filter;
};

const baseRelations = (data) => {
  if (data.relations) return data.relations;

  const relations = [];
  if (data.supplier || data.supplier_name) relations.push(`Supplier: ${data.supplier || data.supplier_name}`);
  if (data.warehouse) relations.push(`Warehouse: ${data.warehouse}`);
  if (data.source_warehouse) relations.push(`Gudang Asal: ${data.source_warehouse}`);
  if (data.destination_warehouse) relations.push(`Gudang Tujuan: ${data.destination_warehouse}`);
  if (data.output_product) relations.push(`Produk jadi: ${data.output_product}`);
  if (data.cash_type) relations.push(`Tipe Kas: ${data.cash_type}`);
  if (data.invoice_no) relations.push(`Invoice: ${data.invoice_no}`);
  if (data.customer) relations.push(`Customer: ${data.customer}`);
  if (data.transaction_no) relations.push(`Transaksi: ${data.transaction_no}`);
  if (data.po_no) relations.push(`PO: ${data.po_no}`);
  if (data.expense_no) relations.push(`Expense: ${data.expense_no}`);
  if (data.production_batch) relations.push(`Produksi: ${data.production_batch}`);
  if (data.cashflow_reference) relations.push(`Cash Flow: ${data.cashflow_reference}`);
  if (data.vendor) relations.push(`Vendor: ${data.vendor}`);
  if (data.employee) relations.push(`Karyawan: ${data.employee}`);
  if (data.product) relations.push(`Produk/Jasa: ${data.product}`);
  if (data.item) relations.push(`Barang: ${data.item}`);
  if (data.channel) relations.push(`Channel: ${data.channel}`);
  if (data.source_module) relations.push(`Sumber: ${data.source_module}`);
  if (data.source_reference) relations.push(`Ref Sumber: ${data.source_reference}`);
  if (data.relation) relations.push(data.relation);
  return relations;
};

const baseFlowFlags = (data) => {
  if (data.flow_flags) return data.flow_flags;

  const flags = [];
  if (data.supplier) flags.push({ label: 'Supplier', value: data.supplier });
  if (data.warehouse) flags.push({ label: 'Warehouse', value: data.warehouse });
  if (data.source_warehouse) flags.push({ label: 'Gudang Asal', value: data.source_warehouse });
  if (data.destination_warehouse) flags.push({ label: 'Gudang Tujuan', value: data.destination_warehouse });
  if (data.output_product) flags.push({ label: 'Produk Jadi', value: data.output_product });
  if (data.quantity) flags.push({ label: 'Jumlah', value: `${data.quantity} ${data.unit || ''}`.trim() });
  if (data.cash_type) flags.push({ label: 'Arus Kas', value: data.cash_type });
  if (data.category) flags.push({ label: 'Kategori', value: data.category });
  if (data.payment_method) flags.push({ label: 'Pembayaran', value: data.payment_method });
  if (data.source_module) flags.push({ label: 'Sumber', value: data.source_module });
  if (data.invoice_type) flags.push({ label: 'Jenis Invoice', value: data.invoice_type });
  if (data.invoice_no) flags.push({ label: 'No Invoice', value: data.invoice_no });
  if (data.customer) flags.push({ label: 'Customer', value: data.customer });
  if (data.total) flags.push({ label: 'Total', value: data.total });
  if (data.transaction_type) flags.push({ label: 'Jenis Transaksi', value: data.transaction_type });
  if (data.transaction_no) flags.push({ label: 'No Transaksi', value: data.transaction_no });
  if (data.channel) flags.push({ label: 'Channel', value: data.channel });
  if (data.payment_status) flags.push({ label: 'Status Bayar', value: data.payment_status });
  if (data.product) flags.push({ label: 'Produk/Jasa', value: data.product });
  if (data.po_type) flags.push({ label: 'Jenis PO', value: data.po_type });
  if (data.po_no) flags.push({ label: 'No PO', value: data.po_no });
  if (data.expense_type) flags.push({ label: 'Jenis Expense', value: data.expense_type });
  if (data.expense_no) flags.push({ label: 'No Expense', value: data.expense_no });
  if (data.production_batch) flags.push({ label: 'Produksi', value: data.production_batch });
  if (data.cashflow_reference) flags.push({ label: 'Cash Flow', value: data.cashflow_reference });
  if (data.vendor) flags.push({ label: 'Vendor', value: data.vendor });
  if (data.employee) flags.push({ label: 'Karyawan', value: data.employee });
  if (data.item) flags.push({ label: 'Barang', value: data.item });
  if (data.expected_date) flags.push({ label: 'Estimasi Datang', value: data.expected_date });
  if (data.received_quantity) flags.push({ label: 'Diterima', value: `${data.received_quantity} ${data.unit || ''}`.trim() });
  return flags;
};

const normalize = (module, row) => {
  if (!row) return row;

  const data = row.dataValues ? { ...row.dataValues } : { ...row };
  const title = data.title || data.name;
  const details = parseJsonArray(data.details);
  const relations = parseJsonArray(data.relations);
  const flowFlags = parseJsonArray(data.flow_flags);

  return {
    ...data,
    module,
    title,
    name: data.name || title,
    subtitle: data.description,
    mapUrl: data.map_url,
    addedBy: data.added_by,
    addedAt: data.added_at,
    inventorySource: data.inventory_source,
    sourceWarehouse: data.source_warehouse,
    outputProduct: data.output_product,
    destinationWarehouse: data.destination_warehouse,
    productionPlace: data.production_place,
    reportType: data.report_type,
    cashType: data.cash_type,
    paymentMethod: data.payment_method,
    transactionDate: data.transaction_date,
    sourceModule: data.source_module,
    sourceReference: data.source_reference,
    invoiceNo: data.invoice_no,
    invoiceType: data.invoice_type,
    customerContact: data.customer_contact,
    issueDate: data.issue_date,
    dueDate: data.due_date,
    paidAmount: data.paid_amount,
    transactionNo: data.transaction_no,
    transactionType: data.transaction_type,
    paymentStatus: data.payment_status,
    shippingCost: data.shipping_cost,
    purchaseOrderNo: data.po_no,
    purchaseOrderType: data.po_type,
    supplierContact: data.supplier_contact,
    expectedDate: data.expected_date,
    receivedQuantity: data.received_quantity,
    expenseNo: data.expense_no,
    expenseType: data.expense_type,
    expenseDate: data.expense_date,
    productionBatch: data.production_batch,
    cashflowReference: data.cashflow_reference,
    details,
    relations,
    flow_flags: flowFlags,
    flowFlags,
  };
};

const payloadByModule = (module, body) => {
  const common = {
    description: pickFirst(body.description, body.subtitle, body.Description),
    status: pickFirst(body.status, body.Status),
    meta: pickFirst(body.meta, body.Meta),
    amount: pickFirst(body.amount, body.Amount),
    active: toBoolean(pickFirst(body.active, body.Active), true),
  };

  if (module === 'report') {
    common.title = pickFirst(body.title, body.name, body.Title, body.Name);
  } else {
    common.name = pickFirst(body.name, body.title, body.Name, body.Title);
  }

  if (module === 'supplier') {
    Object.assign(common, {
      contact: pickFirst(body.contact, body.Contact),
      address: pickFirst(body.address, body.Address),
      map_url: pickFirst(body.map_url, body.mapUrl, body.MapUrl),
      relation: pickFirst(body.relation, body.Relation),
    });
  }

  if (module === 'warehouse') {
    Object.assign(common, {
      contact: pickFirst(body.contact, body.Contact),
      address: pickFirst(body.address, body.Address),
      map_url: pickFirst(body.map_url, body.mapUrl, body.MapUrl),
      rack: pickFirst(body.rack, body.Rack),
      capacity: pickFirst(body.capacity, body.Capacity),
      relation: pickFirst(body.relation, body.Relation),
    });
  }

  if (module === 'inventory') {
    Object.assign(common, {
      supplier: pickFirst(body.supplier, body.Supplier),
      quantity: toNumber(pickFirst(body.quantity, body.Quantity), 0),
      unit: pickFirst(body.unit, body.Unit),
      warehouse: pickFirst(body.warehouse, body.Warehouse),
      added_by: pickFirst(body.added_by, body.addedBy, body.AddedBy),
      added_at: pickFirst(body.added_at, body.addedAt, body.AddedAt),
      reference: pickFirst(body.reference, body.Reference),
      relation: pickFirst(body.relation, body.Relation),
    });
  }

  if (module === 'production') {
    Object.assign(common, {
      inventory_source: pickFirst(body.inventory_source, body.inventorySource, body.InventorySource),
      source_warehouse: pickFirst(body.source_warehouse, body.sourceWarehouse, body.SourceWarehouse),
      output_product: pickFirst(body.output_product, body.outputProduct, body.OutputProduct),
      destination_warehouse: pickFirst(body.destination_warehouse, body.destinationWarehouse, body.DestinationWarehouse),
      quantity: toNumber(pickFirst(body.quantity, body.Quantity), 0),
      unit: pickFirst(body.unit, body.Unit),
      production_place: pickFirst(body.production_place, body.productionPlace, body.ProductionPlace),
      failed_quantity: toNumber(pickFirst(body.failed_quantity, body.failedQuantity, body.FailedQuantity), 0),
      qc_pass_quantity: toNumber(pickFirst(body.qc_pass_quantity, body.qcPassQuantity, body.QcPassQuantity), 0),
      relation: pickFirst(body.relation, body.Relation),
    });
  }

  if (module === 'report') {
    Object.assign(common, {
      report_type: pickFirst(body.report_type, body.reportType, body.ReportType),
      period: pickFirst(body.period, body.Period),
      note: pickFirst(body.note, body.Note),
    });
  }

  if (module === 'cashflow') {
    const nominal = toNumber(pickFirst(body.nominal, body.Nominal, body.amount, body.Amount), 0);
    Object.assign(common, {
      nominal,
      amount: common.amount || `Rp${nominal.toLocaleString('id-ID')}`,
      cash_type: pickFirst(body.cash_type, body.cashType, body.CashType),
      category: pickFirst(body.category, body.Category),
      payment_method: pickFirst(body.payment_method, body.paymentMethod, body.PaymentMethod),
      transaction_date: pickFirst(body.transaction_date, body.transactionDate, body.TransactionDate),
      source_module: pickFirst(body.source_module, body.sourceModule, body.SourceModule),
      source_reference: pickFirst(body.source_reference, body.sourceReference, body.SourceReference),
      reference: pickFirst(body.reference, body.Reference),
      note: pickFirst(body.note, body.Note),
    });
  }

  if (module === 'invoice') {
    const subtotal = toNumber(pickFirst(body.subtotal, body.Subtotal, body.total, body.Total, body.amount, body.Amount), 0);
    const discount = toNumber(pickFirst(body.discount, body.Discount), 0);
    const tax = toNumber(pickFirst(body.tax, body.Tax), 0);
    const total = toNumber(pickFirst(body.total, body.Total, body.amount, body.Amount), subtotal - discount + tax);
    const paidAmount = toNumber(pickFirst(body.paid_amount, body.paidAmount, body.PaidAmount), 0);
    Object.assign(common, {
      invoice_no: pickFirst(body.invoice_no, body.invoiceNo, body.InvoiceNo),
      invoice_type: pickFirst(body.invoice_type, body.invoiceType, body.InvoiceType),
      customer: pickFirst(body.customer, body.Customer),
      customer_contact: pickFirst(body.customer_contact, body.customerContact, body.CustomerContact),
      issue_date: pickFirst(body.issue_date, body.issueDate, body.IssueDate),
      due_date: pickFirst(body.due_date, body.dueDate, body.DueDate),
      subtotal,
      discount,
      tax,
      total,
      paid_amount: paidAmount,
      amount: common.amount || `Rp${total.toLocaleString('id-ID')}`,
      payment_method: pickFirst(body.payment_method, body.paymentMethod, body.PaymentMethod),
      source_module: pickFirst(body.source_module, body.sourceModule, body.SourceModule),
      source_reference: pickFirst(body.source_reference, body.sourceReference, body.SourceReference),
      reference: pickFirst(body.reference, body.Reference),
      note: pickFirst(body.note, body.Note),
    });
  }

  if (module === 'transaction') {
    const subtotal = toNumber(pickFirst(body.subtotal, body.Subtotal, body.total, body.Total, body.amount, body.Amount), 0);
    const discount = toNumber(pickFirst(body.discount, body.Discount), 0);
    const tax = toNumber(pickFirst(body.tax, body.Tax), 0);
    const shippingCost = toNumber(pickFirst(body.shipping_cost, body.shippingCost, body.ShippingCost), 0);
    const total = toNumber(pickFirst(body.total, body.Total, body.amount, body.Amount), subtotal - discount + tax + shippingCost);
    Object.assign(common, {
      transaction_no: pickFirst(body.transaction_no, body.transactionNo, body.TransactionNo),
      transaction_type: pickFirst(body.transaction_type, body.transactionType, body.TransactionType),
      channel: pickFirst(body.channel, body.Channel),
      customer: pickFirst(body.customer, body.Customer),
      customer_contact: pickFirst(body.customer_contact, body.customerContact, body.CustomerContact),
      product: pickFirst(body.product, body.Product),
      quantity: toNumber(pickFirst(body.quantity, body.Quantity), 0),
      unit: pickFirst(body.unit, body.Unit),
      warehouse: pickFirst(body.warehouse, body.Warehouse),
      invoice_no: pickFirst(body.invoice_no, body.invoiceNo, body.InvoiceNo),
      payment_status: pickFirst(body.payment_status, body.paymentStatus, body.PaymentStatus),
      payment_method: pickFirst(body.payment_method, body.paymentMethod, body.PaymentMethod),
      subtotal,
      discount,
      tax,
      shipping_cost: shippingCost,
      total,
      amount: common.amount || `Rp${total.toLocaleString('id-ID')}`,
      transaction_date: pickFirst(body.transaction_date, body.transactionDate, body.TransactionDate),
      due_date: pickFirst(body.due_date, body.dueDate, body.DueDate),
      source_reference: pickFirst(body.source_reference, body.sourceReference, body.SourceReference),
      reference: pickFirst(body.reference, body.Reference),
      note: pickFirst(body.note, body.Note),
    });
  }

  if (module === 'purchaseorder') {
    const subtotal = toNumber(pickFirst(body.subtotal, body.Subtotal, body.total, body.Total, body.amount, body.Amount), 0);
    const discount = toNumber(pickFirst(body.discount, body.Discount), 0);
    const tax = toNumber(pickFirst(body.tax, body.Tax), 0);
    const shippingCost = toNumber(pickFirst(body.shipping_cost, body.shippingCost, body.ShippingCost), 0);
    const total = toNumber(pickFirst(body.total, body.Total, body.amount, body.Amount), subtotal - discount + tax + shippingCost);
    Object.assign(common, {
      po_no: pickFirst(body.po_no, body.purchaseOrderNo, body.poNo, body.PurchaseOrderNo, body.PoNo),
      po_type: pickFirst(body.po_type, body.purchaseOrderType, body.poType, body.PurchaseOrderType, body.PoType),
      supplier: pickFirst(body.supplier, body.Supplier),
      supplier_contact: pickFirst(body.supplier_contact, body.supplierContact, body.SupplierContact),
      warehouse: pickFirst(body.warehouse, body.Warehouse),
      item: pickFirst(body.item, body.Item),
      quantity: toNumber(pickFirst(body.quantity, body.Quantity), 0),
      received_quantity: toNumber(pickFirst(body.received_quantity, body.receivedQuantity, body.ReceivedQuantity), 0),
      unit: pickFirst(body.unit, body.Unit),
      expected_date: pickFirst(body.expected_date, body.expectedDate, body.ExpectedDate),
      payment_status: pickFirst(body.payment_status, body.paymentStatus, body.PaymentStatus),
      payment_method: pickFirst(body.payment_method, body.paymentMethod, body.PaymentMethod),
      subtotal,
      discount,
      tax,
      shipping_cost: shippingCost,
      total,
      amount: common.amount || `Rp${total.toLocaleString('id-ID')}`,
      source_reference: pickFirst(body.source_reference, body.sourceReference, body.SourceReference),
      reference: pickFirst(body.reference, body.Reference),
      note: pickFirst(body.note, body.Note),
    });
  }

  if (module === 'expense') {
    const subtotal = toNumber(pickFirst(body.subtotal, body.Subtotal, body.total, body.Total, body.amount, body.Amount), 0);
    const discount = toNumber(pickFirst(body.discount, body.Discount), 0);
    const tax = toNumber(pickFirst(body.tax, body.Tax), 0);
    const total = toNumber(pickFirst(body.total, body.Total, body.amount, body.Amount), subtotal - discount + tax);
    Object.assign(common, {
      expense_no: pickFirst(body.expense_no, body.expenseNo, body.ExpenseNo),
      expense_type: pickFirst(body.expense_type, body.expenseType, body.ExpenseType),
      category: pickFirst(body.category, body.Category),
      supplier: pickFirst(body.supplier, body.Supplier),
      warehouse: pickFirst(body.warehouse, body.Warehouse),
      product: pickFirst(body.product, body.Product),
      po_no: pickFirst(body.po_no, body.purchaseOrderNo, body.poNo, body.PurchaseOrderNo, body.PoNo),
      production_batch: pickFirst(body.production_batch, body.productionBatch, body.ProductionBatch),
      transaction_no: pickFirst(body.transaction_no, body.transactionNo, body.TransactionNo),
      invoice_no: pickFirst(body.invoice_no, body.invoiceNo, body.InvoiceNo),
      cashflow_reference: pickFirst(body.cashflow_reference, body.cashflowReference, body.CashflowReference),
      vendor: pickFirst(body.vendor, body.Vendor),
      employee: pickFirst(body.employee, body.Employee),
      payment_status: pickFirst(body.payment_status, body.paymentStatus, body.PaymentStatus),
      payment_method: pickFirst(body.payment_method, body.paymentMethod, body.PaymentMethod),
      expense_date: pickFirst(body.expense_date, body.expenseDate, body.ExpenseDate),
      due_date: pickFirst(body.due_date, body.dueDate, body.DueDate),
      subtotal,
      discount,
      tax,
      total,
      amount: common.amount || `Rp${total.toLocaleString('id-ID')}`,
      source_module: pickFirst(body.source_module, body.sourceModule, body.SourceModule),
      source_reference: pickFirst(body.source_reference, body.sourceReference, body.SourceReference),
      reference: pickFirst(body.reference, body.Reference),
      note: pickFirst(body.note, body.Note),
    });
  }

  common.details = stringifyArray(pickFirst(body.details, body.Details));
  common.relations = stringifyArray(pickFirst(body.relations, body.Relations) || baseRelations(common));
  common.flow_flags = stringifyArray(pickFirst(body.flow_flags, body.flowFlags, body.FlowFlags) || baseFlowFlags(common));

  return common;
};

const metric = (title, value) => ({ title, value: String(value) });

const sanitizePayload = (model, payload) => Object.keys(payload).reduce((result, key) => {
  if (model.rawAttributes[key]) result[key] = payload[key];
  return result;
}, {});

const buildMetrics = async (module, partnerId) => {
  const config = getConfig(module);
  const where = { partner_id: partnerId, active: true };
  const total = await config.model.count({ where });

  if (module === 'supplier') {
    return [
      metric('Supplier Aktif', await config.model.count({ where: { ...where, status: 'Aktif' } })),
      metric('Perlu Review', await config.model.count({ where: { ...where, status: 'Review' } })),
      metric('Hold', await config.model.count({ where: { ...where, status: 'Hold' } })),
      metric('Total Supplier', total),
    ];
  }

  if (module === 'warehouse') {
    const warehouses = await config.model.findAll({ where, attributes: ['capacity'] });
    const capacities = warehouses.map((item) => toNumber(item.capacity)).filter((item) => item > 0);
    const avg = capacities.length ? Math.round(capacities.reduce((sum, item) => sum + item, 0) / capacities.length) : 0;
    return [
      metric('Total Gudang', total),
      metric('Aktif', await config.model.count({ where: { ...where, status: 'Aktif' } })),
      metric('Maintenance', await config.model.count({ where: { ...where, status: 'Maintenance' } })),
      metric('Kapasitas Terpakai', `${avg}%`),
    ];
  }

  if (module === 'inventory') {
    const rows = await config.model.findAll({ where, attributes: ['quantity'] });
    const totalQty = rows.reduce((sum, item) => sum + toNumber(item.quantity), 0);
    return [
      metric('Barang Masuk', await config.model.count({ where: { ...where, status: 'Barang Masuk' } })),
      metric('Dipakai Produksi', await config.model.count({ where: { ...where, status: 'Dipakai Produksi' } })),
      metric('Barang Jadi', await config.model.count({ where: { ...where, status: 'Barang Jadi' } })),
      metric('Total Qty', totalQty),
    ];
  }

  if (module === 'production') {
    const rows = await config.model.findAll({ where, attributes: ['quantity', 'failed_quantity', 'qc_pass_quantity'] });
    const output = rows.reduce((sum, item) => sum + toNumber(item.quantity), 0);
    const failed = rows.reduce((sum, item) => sum + toNumber(item.failed_quantity), 0);
    const qcPass = rows.reduce((sum, item) => sum + toNumber(item.qc_pass_quantity), 0);
    return [
      metric('Batch Aktif', await config.model.count({ where: { ...where, status: 'Berjalan' } })),
      metric('Output', output),
      metric('Produk Gagal', failed),
      metric('QC Pass', output ? `${Math.round((qcPass / output) * 100)}%` : '0%'),
    ];
  }

  if (module === 'cashflow') {
    const rows = await config.model.findAll({ where, attributes: ['nominal', 'amount', 'cash_type', 'status'] });
    const activeRows = rows.filter((item) => item.status !== 'Batal');
    const inRows = activeRows.filter((item) => String(item.cash_type).toLowerCase().includes('masuk'));
    const outRows = activeRows.filter((item) => String(item.cash_type).toLowerCase().includes('keluar'));
    const sumNominal = (items) => items.reduce((sum, item) => sum + toNumber(item.nominal || item.amount), 0);
    const cashIn = sumNominal(inRows);
    const cashOut = sumNominal(outRows);
    const rupiah = (value) => `Rp${Number(value).toLocaleString('id-ID')}`;

    return [
      metric('Saldo Kas', rupiah(cashIn - cashOut)),
      metric('Uang Masuk', rupiah(cashIn)),
      metric('Uang Keluar', rupiah(cashOut)),
      metric('Transaksi Kas', activeRows.length),
    ];
  }

  if (module === 'invoice') {
    const rows = await config.model.findAll({ where, attributes: ['total', 'paid_amount', 'status', 'due_date'] });
    const activeRows = rows.filter((item) => item.status !== 'Batal');
    const totalTagihan = activeRows.reduce((sum, item) => sum + toNumber(item.total), 0);
    const totalDibayar = activeRows.reduce((sum, item) => sum + toNumber(item.paid_amount), 0);
    const now = new Date();
    const overdue = activeRows.filter((item) => {
      if (!item.due_date) return false;
      return new Date(item.due_date) < now && item.status !== 'Dibayar';
    }).length;
    const rupiah = (value) => `Rp${Number(value).toLocaleString('id-ID')}`;

    return [
      metric('Total Tagihan', rupiah(totalTagihan)),
      metric('Sudah Dibayar', rupiah(totalDibayar)),
      metric('Belum Dibayar', rupiah(Math.max(totalTagihan - totalDibayar, 0))),
      metric('Jatuh Tempo', overdue),
    ];
  }

  if (module === 'transaction') {
    const rows = await config.model.findAll({ where, attributes: ['total', 'quantity', 'status', 'payment_status'] });
    const activeRows = rows.filter((item) => item.status !== 'Batal');
    const omzet = activeRows
      .filter((item) => item.status === 'Selesai')
      .reduce((sum, item) => sum + toNumber(item.total), 0);
    const pending = activeRows.filter((item) => ['Order Masuk', 'Diproses', 'Dikirim'].includes(item.status)).length;
    const qty = activeRows.reduce((sum, item) => sum + toNumber(item.quantity), 0);
    const paid = activeRows.filter((item) => item.payment_status === 'Lunas').length;
    const rupiah = (value) => `Rp${Number(value).toLocaleString('id-ID')}`;

    return [
      metric('Transaksi Aktif', activeRows.length),
      metric('Omzet Selesai', rupiah(omzet)),
      metric('Order Diproses', pending),
      metric('Item Terjual', qty || paid),
    ];
  }

  if (module === 'purchaseorder') {
    const rows = await config.model.findAll({ where, attributes: ['total', 'quantity', 'received_quantity', 'status'] });
    const activeRows = rows.filter((item) => item.status !== 'Batal');
    const nilaiPo = activeRows.reduce((sum, item) => sum + toNumber(item.total), 0);
    const waiting = activeRows.filter((item) => ['Dikirim Supplier', 'Dikonfirmasi', 'Sebagian Diterima'].includes(item.status)).length;
    const receivedQty = activeRows.reduce((sum, item) => sum + toNumber(item.received_quantity), 0);
    const orderedQty = activeRows.reduce((sum, item) => sum + toNumber(item.quantity), 0);
    const rupiah = (value) => `Rp${Number(value).toLocaleString('id-ID')}`;

    return [
      metric('Total PO', activeRows.length),
      metric('Nilai PO', rupiah(nilaiPo)),
      metric('Menunggu Barang', waiting),
      metric('Barang Diterima', receivedQty || orderedQty),
    ];
  }

  if (module === 'expense') {
    const rows = await config.model.findAll({ where, attributes: ['total', 'status', 'payment_status'] });
    const activeRows = rows.filter((item) => item.status !== 'Batal');
    const totalExpense = activeRows.reduce((sum, item) => sum + toNumber(item.total), 0);
    const waiting = activeRows.filter((item) => item.payment_status !== 'Lunas' && item.status !== 'Dibayar').length;
    const paidValue = activeRows
      .filter((item) => item.payment_status === 'Lunas' || item.status === 'Dibayar')
      .reduce((sum, item) => sum + toNumber(item.total), 0);
    const rupiah = (value) => `Rp${Number(value).toLocaleString('id-ID')}`;

    return [
      metric('Total Expense', activeRows.length),
      metric('Nilai Expense', rupiah(totalExpense)),
      metric('Belum Dibayar', waiting),
      metric('Sudah Dibayar', rupiah(paidValue)),
    ];
  }

  return [
    metric('Catatan Publish', await config.model.count({ where: { ...where, status: 'Publish' } })),
    metric('Draft', await config.model.count({ where: { ...where, status: 'Draft' } })),
    metric('Review', await config.model.count({ where: { ...where, status: 'Review' } })),
    metric('Total Laporan', total),
  ];
};

module.exports = {
  modules: () => Object.keys(MODULES).map((key) => ({
    module: key,
    title: MODULES[key].label,
    statuses: MODULES[key].statuses,
    defaultStatus: MODULES[key].defaultStatus,
  })),

  getOptions: (module) => {
    const config = getConfig(module);
    return {
      success: true,
      message: `Opsi ${config.label} Berhasil Diambil`,
      data: {
        module,
        title: config.label,
        statuses: config.statuses,
        defaultStatus: config.defaultStatus,
        extraFields: config.extraFields || {},
        barcodeConfig: config.barcode || null,
      },
    };
  },

  getList: async (module, partnerId, params = {}) => {
    const config = getConfig(module);
    const page = parseInt(params.page || 1);
    const limit = parseInt(params.limit || 20);
    const where = buildFilter(module, partnerId, params);

    const rows = await config.model.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    return {
      success: true,
      message: rows.rows.length > 0 ? `Daftar ${config.label} Berhasil Diambil` : `Data ${config.label} Kosong`,
      data: rows.rows.map((row) => normalize(module, row)),
      page,
      count: Math.ceil(rows.count / limit),
      length: rows.count,
    };
  },

  getDetail: async (module, partnerId, id) => {
    const config = getConfig(module);
    const row = await config.model.findOne({ where: { id, partner_id: partnerId, active: true } });
    return row
      ? { success: true, message: `${config.label} Berhasil Diambil`, data: normalize(module, row) }
      : { success: false, message: `${config.label} Tidak Ditemukan`, data: {} };
  },

  create: async (module, partnerId, body, createdBy) => {
    const config = getConfig(module);
    const payload = payloadByModule(module, body);
    payload.partner_id = partnerId;
    payload.created_by = createdBy;
    payload.status = payload.status || config.defaultStatus;

    const title = payload[config.titleField];
    if (!title || title.trim() === '') {
      return { success: false, message: `Nama/Judul ${config.label} wajib diisi`, data: {} };
    }

    const row = await config.model.create(sanitizePayload(config.model, payload));
    return { success: true, message: `${config.label} Berhasil Dibuat`, data: normalize(module, row) };
  },

  update: async (module, partnerId, id, body, updatedBy) => {
    const config = getConfig(module);
    const current = await config.model.findOne({ where: { id, partner_id: partnerId } });
    if (!current) {
      return { success: false, message: `${config.label} Tidak Ditemukan`, data: {} };
    }

    const payload = payloadByModule(module, { ...current.dataValues, ...body });
    payload.updated_by = updatedBy;

    await config.model.update(sanitizePayload(config.model, payload), { where: { id, partner_id: partnerId } });

    const updated = await config.model.findOne({ where: { id, partner_id: partnerId } });
    return { success: true, message: `${config.label} Berhasil Diubah`, data: normalize(module, updated) };
  },

  delete: async (module, partnerId, id) => {
    const config = getConfig(module);
    const deleted = await config.model.destroy({ where: { id, partner_id: partnerId } });
    return deleted
      ? { success: true, message: `${config.label} Berhasil Dihapus`, data: [] }
      : { success: false, message: `${config.label} Tidak Ditemukan`, data: {} };
  },

  getMetrics: async (module, partnerId) => {
    const config = getConfig(module);
    const metrics = await buildMetrics(module, partnerId);
    return { success: true, message: `Metrik ${config.label} Berhasil Diambil`, data: metrics };
  },

  getBarcodeConfig: (module) => {
    const config = getConfig(module);
    return {
      success: true,
      message: `Barcode ${config.label} Berhasil Diambil`,
      data: config.barcode || {},
    };
  },

  scan: async (module, partnerId, body, createdBy) => {
    const config = getConfig(module);
    const barcode = config.barcode || {};
    const scannedItem = body.scannedItem || barcode.scannedItem || {};
    const payload = {
      partner_id: partnerId,
      module,
      code: body.code || barcode.code,
      action: body.action || barcode.defaultAction,
      quantity: body.quantity || barcode.defaultQuantity,
      result_name: scannedItem.name,
      result_sku: scannedItem.sku,
      payload: JSON.stringify({ scannedItem, request: body }),
      created_by: createdBy,
    };

    const row = await ErpScanHistory.create(payload);
    return {
      success: true,
      message: `Scan ${config.label} Berhasil Dicatat`,
      data: {
        id: row.id,
        code: payload.code,
        action: payload.action,
        quantity: payload.quantity,
        scannedItem,
      },
    };
  },
};
