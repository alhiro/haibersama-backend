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
const PartnerProduct = require('../models/partnerProduct');
const ErpApproval = require('../models/erpApproval');
const ErpAuditLog = require('../models/erpAuditLog');
const ErpEmployeeRole = require('../models/erpEmployeeRole');
const ErpStockLedger = require('../models/erpStockLedger');
const ErpReturnRefund = require('../models/erpReturnRefund');
const ErpMarketplaceSettlement = require('../models/erpMarketplaceSettlement');
const HaiUser = require('../models/haiuser');
const emailTransporter = require('../config/email');

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
  employeerole: {
    label: 'Employee Role',
    model: ErpEmployeeRole,
    titleField: 'name',
    defaultStatus: 'Aktif',
    statuses: ['Aktif', 'Nonaktif', 'Review'],
    extraFields: {
      role: ['Owner', 'Supervisor', 'Warehouse Staff', 'Admin', 'Penjahit', 'Kasir', 'Driver', 'Marketplace Admin'],
      department: ['Owner', 'Warehouse', 'Produksi', 'Finance', 'Toko', 'Marketplace', 'Operasional'],
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
  stockledger: {
    label: 'Stock Ledger',
    model: ErpStockLedger,
    titleField: 'name',
    defaultStatus: 'Tercatat',
    statuses: ['Tercatat', 'Menunggu Approval', 'Disetujui', 'Ditolak'],
    extraFields: {
      movementType: ['Adjustment', 'Koreksi'],
      warehouse: ['Warehouse Bahan Baku', 'Warehouse Produk Jadi', 'Area QC', 'Gudang Retur'],
      sourceModule: ['Manual'],
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
  returnrefund: {
    label: 'Return & Refund',
    model: ErpReturnRefund,
    titleField: 'name',
    defaultStatus: 'Pengajuan',
    statuses: ['Pengajuan', 'Diterima', 'QC Retur', 'Refund Diproses', 'Selesai', 'Ditolak'],
    extraFields: {
      refundMethod: ['Transfer Bank', 'Marketplace', 'E-Wallet', 'Cash', 'Saldo Toko'],
      warehouse: ['Gudang Retur', 'Area QC', 'Warehouse Produk Jadi'],
    },
  },
  settlement: {
    label: 'Marketplace Settlement',
    model: ErpMarketplaceSettlement,
    titleField: 'name',
    defaultStatus: 'Menunggu Cair',
    statuses: ['Menunggu Cair', 'Cair', 'Selisih', 'Rekonsiliasi', 'Batal'],
    extraFields: {
      marketplace: ['Shopee', 'Tokopedia', 'TikTok Shop', 'Lazada', 'Blibli', 'Manual'],
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
    'role',
    'department',
    'movement_type',
    'return_no',
    'settlement_no',
    'marketplace',
    'approval_status',
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
  if (data.return_no) relations.push(`Retur: ${data.return_no}`);
  if (data.settlement_no) relations.push(`Settlement: ${data.settlement_no}`);
  if (data.cashflow_reference) relations.push(`Cash Flow: ${data.cashflow_reference}`);
  if (data.approval_status) relations.push(`Approval: ${data.approval_status}`);
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
  if (data.movement_type) flags.push({ label: 'Mutasi', value: data.movement_type });
  if (data.approval_status) flags.push({ label: 'Approval', value: data.approval_status });
  if (data.return_no) flags.push({ label: 'No Retur', value: data.return_no });
  if (data.settlement_no) flags.push({ label: 'No Settlement', value: data.settlement_no });
  if (data.marketplace) flags.push({ label: 'Marketplace', value: data.marketplace });
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
    approvalStatus: data.approval_status,
    approvalId: data.approval_id,
    userId: data.user_id,
    inviteStatus: data.invite_status,
    inviteSentAt: data.invite_sent_at,
    inviteError: data.invite_error,
    role: data.role,
    department: data.department,
    movementType: data.movement_type,
    returnNo: data.return_no,
    refundAmount: data.refund_amount,
    refundMethod: data.refund_method,
    settlementNo: data.settlement_no,
    marketplace: data.marketplace,
    grossSales: data.gross_sales,
    marketplaceFee: data.marketplace_fee,
    netPayout: data.net_payout,
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

  if (module === 'employeerole') {
    Object.assign(common, {
      user_id: pickFirst(body.user_id, body.userId, body.UserId),
      email: pickFirst(body.email, body.Email),
      phone: pickFirst(body.phone, body.Phone),
      role: pickFirst(body.role, body.Role),
      department: pickFirst(body.department, body.Department),
      permissions: stringifyArray(pickFirst(body.permissions, body.Permissions)),
      invited_by: pickFirst(body.invited_by, body.invitedBy, body.InvitedBy),
      invited_at: pickFirst(body.invited_at, body.invitedAt, body.InvitedAt),
      joined_at: pickFirst(body.joined_at, body.joinedAt, body.JoinedAt),
      invite_status: pickFirst(body.invite_status, body.inviteStatus, body.InviteStatus),
      invite_sent_at: pickFirst(body.invite_sent_at, body.inviteSentAt, body.InviteSentAt),
      invite_error: pickFirst(body.invite_error, body.inviteError, body.InviteError),
      note: pickFirst(body.note, body.Note),
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
      approval_status: pickFirst(body.approval_status, body.approvalStatus, body.ApprovalStatus),
      approval_id: pickFirst(body.approval_id, body.approvalId, body.ApprovalId),
    });
  }

  if (module === 'stockledger') {
    const quantityIn = toNumber(pickFirst(body.quantity_in, body.quantityIn, body.QuantityIn), 0);
    const quantityOut = toNumber(pickFirst(body.quantity_out, body.quantityOut, body.QuantityOut), 0);
    Object.assign(common, {
      sku: pickFirst(body.sku, body.Sku),
      movement_type: pickFirst(body.movement_type, body.movementType, body.MovementType),
      quantity_in: quantityIn,
      quantity_out: quantityOut,
      balance_after: toNumber(pickFirst(body.balance_after, body.balanceAfter, body.BalanceAfter), quantityIn - quantityOut),
      unit: pickFirst(body.unit, body.Unit),
      warehouse: pickFirst(body.warehouse, body.Warehouse),
      source_module: pickFirst(body.source_module, body.sourceModule, body.SourceModule),
      source_reference: pickFirst(body.source_reference, body.sourceReference, body.SourceReference),
      supplier: pickFirst(body.supplier, body.Supplier),
      production_batch: pickFirst(body.production_batch, body.productionBatch, body.ProductionBatch),
      product: pickFirst(body.product, body.Product),
      approval_status: pickFirst(body.approval_status, body.approvalStatus, body.ApprovalStatus),
      approval_id: pickFirst(body.approval_id, body.approvalId, body.ApprovalId),
      reason: pickFirst(body.reason, body.Reason),
      note: pickFirst(body.note, body.Note),
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
      approval_status: pickFirst(body.approval_status, body.approvalStatus, body.ApprovalStatus),
      approval_id: pickFirst(body.approval_id, body.approvalId, body.ApprovalId),
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
      approval_status: pickFirst(body.approval_status, body.approvalStatus, body.ApprovalStatus),
      approval_id: pickFirst(body.approval_id, body.approvalId, body.ApprovalId),
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
      approval_status: pickFirst(body.approval_status, body.approvalStatus, body.ApprovalStatus),
      approval_id: pickFirst(body.approval_id, body.approvalId, body.ApprovalId),
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

  if (module === 'returnrefund') {
    const refundAmount = toNumber(pickFirst(body.refund_amount, body.refundAmount, body.RefundAmount, body.total, body.Total), 0);
    Object.assign(common, {
      return_no: pickFirst(body.return_no, body.returnNo, body.ReturnNo),
      customer: pickFirst(body.customer, body.Customer),
      product: pickFirst(body.product, body.Product),
      quantity: toNumber(pickFirst(body.quantity, body.Quantity), 0),
      unit: pickFirst(body.unit, body.Unit),
      transaction_no: pickFirst(body.transaction_no, body.transactionNo, body.TransactionNo),
      invoice_no: pickFirst(body.invoice_no, body.invoiceNo, body.InvoiceNo),
      warehouse: pickFirst(body.warehouse, body.Warehouse),
      refund_amount: refundAmount,
      amount: common.amount || `Rp${refundAmount.toLocaleString('id-ID')}`,
      refund_method: pickFirst(body.refund_method, body.refundMethod, body.RefundMethod),
      reason: pickFirst(body.reason, body.Reason),
      cashflow_reference: pickFirst(body.cashflow_reference, body.cashflowReference, body.CashflowReference),
      approval_status: pickFirst(body.approval_status, body.approvalStatus, body.ApprovalStatus),
      approval_id: pickFirst(body.approval_id, body.approvalId, body.ApprovalId),
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
      approval_status: pickFirst(body.approval_status, body.approvalStatus, body.ApprovalStatus),
      approval_id: pickFirst(body.approval_id, body.approvalId, body.ApprovalId),
      note: pickFirst(body.note, body.Note),
    });
  }

  if (module === 'settlement') {
    const grossSales = toNumber(pickFirst(body.gross_sales, body.grossSales, body.GrossSales), 0);
    const marketplaceFee = toNumber(pickFirst(body.marketplace_fee, body.marketplaceFee, body.MarketplaceFee), 0);
    const shippingFee = toNumber(pickFirst(body.shipping_fee, body.shippingFee, body.ShippingFee), 0);
    const discount = toNumber(pickFirst(body.discount, body.Discount), 0);
    const refundAmount = toNumber(pickFirst(body.refund_amount, body.refundAmount, body.RefundAmount), 0);
    const netPayout = toNumber(pickFirst(body.net_payout, body.netPayout, body.NetPayout), grossSales - marketplaceFee - shippingFee - discount - refundAmount);
    Object.assign(common, {
      settlement_no: pickFirst(body.settlement_no, body.settlementNo, body.SettlementNo),
      marketplace: pickFirst(body.marketplace, body.Marketplace),
      gross_sales: grossSales,
      marketplace_fee: marketplaceFee,
      shipping_fee: shippingFee,
      discount,
      refund_amount: refundAmount,
      net_payout: netPayout,
      amount: common.amount || `Rp${netPayout.toLocaleString('id-ID')}`,
      payout_date: pickFirst(body.payout_date, body.payoutDate, body.PayoutDate),
      transaction_no: pickFirst(body.transaction_no, body.transactionNo, body.TransactionNo),
      invoice_no: pickFirst(body.invoice_no, body.invoiceNo, body.InvoiceNo),
      cashflow_reference: pickFirst(body.cashflow_reference, body.cashflowReference, body.CashflowReference),
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
      approval_status: pickFirst(body.approval_status, body.approvalStatus, body.ApprovalStatus),
      approval_id: pickFirst(body.approval_id, body.approvalId, body.ApprovalId),
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

  if (module === 'employeerole') {
    return [
      metric('Karyawan Aktif', await config.model.count({ where: { ...where, status: 'Aktif' } })),
      metric('Owner', await config.model.count({ where: { ...where, role: 'Owner' } })),
      metric('Supervisor', await config.model.count({ where: { ...where, role: 'Supervisor' } })),
      metric('Total Role', total),
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

  if (module === 'stockledger') {
    const rows = await config.model.findAll({ where, attributes: ['quantity_in', 'quantity_out', 'approval_status'] });
    const inQty = rows.reduce((sum, item) => sum + toNumber(item.quantity_in), 0);
    const outQty = rows.reduce((sum, item) => sum + toNumber(item.quantity_out), 0);
    return [
      metric('Mutasi Masuk', inQty),
      metric('Mutasi Keluar', outQty),
      metric('Pending Approval', rows.filter((item) => item.approval_status === 'Menunggu Approval').length),
      metric('Saldo Mutasi', inQty - outQty),
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

  if (module === 'returnrefund') {
    const rows = await config.model.findAll({ where, attributes: ['refund_amount', 'status'] });
    const refundTotal = rows.reduce((sum, item) => sum + toNumber(item.refund_amount), 0);
    return [
      metric('Pengajuan Retur', await config.model.count({ where: { ...where, status: 'Pengajuan' } })),
      metric('Refund Diproses', await config.model.count({ where: { ...where, status: 'Refund Diproses' } })),
      metric('Nilai Refund', rupiah(refundTotal)),
      metric('Selesai', await config.model.count({ where: { ...where, status: 'Selesai' } })),
    ];
  }

  if (module === 'settlement') {
    const rows = await config.model.findAll({ where, attributes: ['gross_sales', 'marketplace_fee', 'net_payout', 'status'] });
    const gross = rows.reduce((sum, item) => sum + toNumber(item.gross_sales), 0);
    const fee = rows.reduce((sum, item) => sum + toNumber(item.marketplace_fee), 0);
    const payout = rows.reduce((sum, item) => sum + toNumber(item.net_payout), 0);
    return [
      metric('Gross Sales', rupiah(gross)),
      metric('Fee Marketplace', rupiah(fee)),
      metric('Dana Cair', rupiah(payout)),
      metric('Menunggu Cair', await config.model.count({ where: { ...where, status: 'Menunggu Cair' } })),
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

const rupiah = (value) => `Rp${Number(value || 0).toLocaleString('id-ID')}`;
const APPROVAL_THRESHOLD = 5000000;

const requestNo = () => `APR-${Date.now()}`;

const compactJson = (value) => {
  if (!value) return null;
  try {
    return JSON.stringify(value);
  } catch (error) {
    return null;
  }
};

const titleFromPayload = (module, payload, row) => {
  const config = MODULES[module];
  const data = row && row.dataValues ? row.dataValues : row || payload || {};
  const field = config ? config.titleField : 'name';
  return data[field] || data.name || data.title || data.invoice_no || data.transaction_no || data.po_no || data.expense_no || 'Data ERP';
};

const writeAuditLog = async ({ partnerId, module, action, entityId, entityTitle, actor, actorRole, beforeData, afterData, note }) => {
  try {
    await ErpAuditLog.create({
      partner_id: partnerId,
      module,
      action,
      entity_id: entityId,
      entity_title: entityTitle,
      actor,
      actor_role: actorRole || 'Staff',
      before_data: compactJson(beforeData),
      after_data: compactJson(afterData),
      note,
      created_by: actor,
    });
  } catch (error) {
    // Audit logging must not block the operational flow.
  }
};

const approvalRuleFor = (module, payload = {}) => {
  const status = String(payload.status || '');
  const paymentStatus = String(payload.payment_status || payload.paymentStatus || '');
  const amount = toNumber(payload.total || payload.nominal || payload.amount);

  if (module === 'inventory' && ['Dipakai Produksi', 'Transfer'].includes(status)) {
    return {
      action: 'Stok Keluar',
      approverRole: 'Supervisor',
      riskLevel: 'Medium',
      threshold: 0,
      reason: 'Stok keluar atau transfer gudang perlu approval supervisor.',
    };
  }

  if (module === 'production' && ['QC', 'Selesai'].includes(status)) {
    return {
      action: 'Approval Produksi',
      approverRole: 'Supervisor',
      riskLevel: 'Medium',
      threshold: 0,
      reason: 'Perubahan status produksi perlu approval supervisor.',
    };
  }

  if (module === 'stockledger') {
    const movementType = String(payload.movement_type || payload.movementType || '');
    const quantityOut = toNumber(payload.quantity_out || payload.quantityOut);
    const isManualCorrection = ['Adjustment', 'Koreksi'].includes(movementType);
    if (isManualCorrection && quantityOut > 0) {
      return {
        action: 'Koreksi Stok Keluar',
        approverRole: 'Supervisor',
        riskLevel: 'Medium',
        threshold: 0,
        reason: 'Koreksi stok yang mengurangi stok perlu approval supervisor.',
      };
    }
  }

  if (['cashflow', 'expense', 'purchaseorder', 'invoice'].includes(module) && amount >= APPROVAL_THRESHOLD) {
    return {
      action: 'Pembayaran Besar',
      approverRole: 'Owner',
      riskLevel: 'High',
      threshold: APPROVAL_THRESHOLD,
      reason: `Nominal ${rupiah(amount)} melewati limit approval owner.`,
    };
  }

  if (['cashflow', 'expense', 'purchaseorder'].includes(module) && ['Lunas', 'Dibayar'].includes(paymentStatus) && amount >= APPROVAL_THRESHOLD) {
    return {
      action: 'Konfirmasi Pembayaran',
      approverRole: 'Owner',
      riskLevel: 'High',
      threshold: APPROVAL_THRESHOLD,
      reason: `Pembayaran ${rupiah(amount)} perlu approval owner.`,
    };
  }

  return null;
};

const maybeCreateApproval = async ({ module, partnerId, payload, row, actor }) => {
  const rule = approvalRuleFor(module, payload);
  if (!rule) return null;

  const title = titleFromPayload(module, payload, row);
  const amount = toNumber(payload.total || payload.nominal || payload.amount);
  const entityId = row && row.id ? row.id : null;
  const referenceNo = payload.reference || payload.invoice_no || payload.transaction_no || payload.po_no || payload.expense_no || payload.source_reference;

  try {
    const approval = await ErpApproval.create({
      partner_id: partnerId,
      request_no: requestNo(),
      module,
      action: rule.action,
      title,
      description: rule.reason,
      status: 'Menunggu Approval',
      requested_by: actor,
      requester_role: payload.requester_role || payload.requesterRole || 'Staff',
      approver_role: rule.approverRole,
      amount,
      threshold: rule.threshold,
      reference_id: entityId,
      reference_no: referenceNo,
      risk_level: rule.riskLevel,
      details: compactJson(payload),
      created_by: actor,
    });

    await writeAuditLog({
      partnerId,
      module: 'approval',
      action: 'REQUEST',
      entityId: approval.id,
      entityTitle: title,
      actor,
      actorRole: payload.requester_role || payload.requesterRole || 'Staff',
      afterData: approval.dataValues,
      note: rule.reason,
    });

    return approval;
  } catch (error) {
    return null;
  }
};

const autoCreateStockLedger = async ({ module, partnerId, payload, row, actor }) => {
  if (!['inventory', 'transaction', 'returnrefund', 'production', 'purchaseorder'].includes(module)) return null;
  const title = payload.name || payload.product || payload.item || payload.output_product || titleFromPayload(module, payload, row);
  const quantity = toNumber(payload.quantity || payload.received_quantity || payload.qc_pass_quantity);
  if (!title || quantity <= 0) return null;

  const outStatuses = ['Dipakai Produksi', 'Transfer', 'Selesai', 'Dikirim'];
  const isOut = module === 'transaction' || outStatuses.includes(payload.status);
  const isReturn = module === 'returnrefund';
  const movementType = isReturn ? 'Retur' : module === 'production' ? 'Produksi' : isOut ? 'Keluar' : 'Masuk';

  try {
    return await ErpStockLedger.create({
      partner_id: partnerId,
      name: title,
      movement_type: movementType,
      status: payload.approval_status === 'Menunggu Approval' ? 'Menunggu Approval' : 'Tercatat',
      quantity_in: isOut ? 0 : quantity,
      quantity_out: isOut ? quantity : 0,
      balance_after: 0,
      unit: payload.unit,
      warehouse: payload.warehouse || payload.destination_warehouse || payload.source_warehouse,
      source_module: module,
      source_reference: payload.reference || payload.transaction_no || payload.po_no || payload.return_no || payload.source_reference,
      supplier: payload.supplier,
      production_batch: payload.production_batch || payload.output_product,
      product: payload.product || payload.output_product || payload.item,
      approval_status: payload.approval_status || 'Tidak Perlu Approval',
      approval_id: payload.approval_id,
      note: `Auto ledger dari ${module}`,
      created_by: actor,
    });
  } catch (error) {
    return null;
  }
};

const autoCreateCashFlow = async ({ module, partnerId, payload, row, actor }) => {
  if (module === 'cashflow') return null;
  const isPaid = ['Lunas', 'Dibayar', 'Cair', 'Selesai'].includes(String(payload.payment_status || payload.status));
  if (!isPaid) return null;

  const isCashIn = ['invoice', 'transaction', 'settlement'].includes(module);
  const isCashOut = ['expense', 'purchaseorder', 'returnrefund'].includes(module);
  if (!isCashIn && !isCashOut) return null;

  const nominal = toNumber(payload.net_payout || payload.refund_amount || payload.total || payload.nominal || payload.amount);
  if (nominal <= 0) return null;
  const sourceReference = payload.reference || payload.invoice_no || payload.transaction_no || payload.po_no || payload.return_no || payload.settlement_no;

  try {
    if (sourceReference) {
      const existing = await ErpCashFlow.findOne({
        where: { partner_id: partnerId, source_module: module, source_reference: sourceReference, active: true },
      });
      if (existing) return existing;
    }
    return await ErpCashFlow.create({
      partner_id: partnerId,
      name: `Auto ${isCashIn ? 'Cash In' : 'Cash Out'} - ${titleFromPayload(module, payload, row)}`,
      description: `Dibuat otomatis dari modul ${module}`,
      status: 'Tercatat',
      meta: module,
      amount: `Rp${nominal.toLocaleString('id-ID')}`,
      nominal,
      cash_type: isCashIn ? 'Uang Masuk' : 'Uang Keluar',
      category: module === 'returnrefund' ? 'Refund/Retur' : module === 'purchaseorder' ? 'Pembelian Supplier' : module === 'expense' ? 'Operasional' : 'Penjualan Produk',
      payment_method: payload.payment_method || payload.refund_method || 'Auto',
      transaction_date: new Date(),
      source_module: module,
      source_reference: sourceReference,
      reference: `AUTO-${module}-${row && row.id ? row.id : Date.now()}`,
      created_by: actor,
    });
  } catch (error) {
    return null;
  }
};

const prepareEmployeeRolePayload = async ({ partnerId, payload, actor }) => {
  if (!payload.email) return payload;

  const email = String(payload.email).trim().toLowerCase();
  payload.email = email;
  payload.invited_by = payload.invited_by || actor;
  payload.invited_at = payload.invited_at || new Date();
  payload.invite_status = payload.invite_status || 'Belum Dikirim';

  const user = await HaiUser.findOne({
    where: { email },
    attributes: ['id', 'name', 'email', 'phone_number'],
  }).catch(() => null);

  if (user) {
    payload.user_id = payload.user_id || user.id;
    payload.name = payload.name || user.name || email;
    payload.phone = payload.phone || user.phone_number;
    payload.joined_at = payload.joined_at || new Date();
  }

  const existing = await ErpEmployeeRole.findOne({
    where: { partner_id: partnerId, email, active: true },
  }).catch(() => null);

  if (existing && (!payload.id || Number(existing.id) !== Number(payload.id))) {
    throw new Error('Email karyawan sudah terdaftar di role ERP partner ini');
  }

  return payload;
};

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const employeeInviteHtml = ({ employeeName, partnerName, role, accountExists, appUrl }) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#233044;max-width:560px;margin:auto;padding:24px">
    <h2 style="margin:0 0 12px;color:#0f6bff">Undangan Tim HaiBersama ERP</h2>
    <p>Halo ${escapeHtml(employeeName)},</p>
    <p>Kamu ditambahkan ke tim <strong>${escapeHtml(partnerName)}</strong> sebagai <strong>${escapeHtml(role)}</strong>.</p>
    <p>${accountExists
      ? 'Akun HaiBersama dengan email ini sudah terdaftar. Silakan login untuk mulai mengakses menu ERP sesuai role kamu.'
      : 'Silakan buat akun HaiBersama dengan email ini terlebih dahulu. Setelah akun dibuat, akses ERP kamu akan aktif otomatis.'}</p>
    <p style="margin:24px 0">
      <a href="${escapeHtml(appUrl)}" style="background:#0f6bff;color:white;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block">
        ${accountExists ? 'Buka HaiBersama' : 'Daftar / Buka HaiBersama'}
      </a>
    </p>
    <p style="font-size:13px;color:#667085">Gunakan email yang sama dengan undangan ini agar akses ERP terhubung otomatis.</p>
  </div>
`;

const sendEmployeeRoleInvite = async ({ partnerId, payload, row, actor }) => {
  if (!payload.email) return { status: 'Email Kosong', error: null };

  const partner = await HaiUser.findOne({
    where: { id: partnerId },
    attributes: ['name', 'title', 'email'],
  }).catch(() => null);

  const accountExists = Boolean(payload.user_id);
  const partnerName = (partner && (partner.title || partner.name || partner.email)) || 'Partner HaiBersama';
  const employeeName = payload.name || payload.email;
  const role = payload.role || 'Karyawan';
  const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || process.env.VERIFY_URL || process.env.API_URL || 'https://haibersama.com';

  try {
    await emailTransporter.transporterSmtp.sendMail({
      from: `"HaiBersama ERP" <${process.env.EMAIL_USERNAME || 'notify@haibersama.com'}>`,
      to: payload.email,
      subject: `Undangan akses ERP ${partnerName}`,
      html: employeeInviteHtml({ employeeName, partnerName, role, accountExists, appUrl }),
    });

    await ErpEmployeeRole.update({
      invite_status: accountExists ? 'Terkirim - Akun Terhubung' : 'Terkirim - Menunggu Daftar',
      invite_sent_at: new Date(),
      invite_error: null,
      updated_by: actor,
    }, { where: { id: row.id, partner_id: partnerId } });

    return {
      status: accountExists ? 'Terkirim - Akun Terhubung' : 'Terkirim - Menunggu Daftar',
      error: null,
    };
  } catch (error) {
    await ErpEmployeeRole.update({
      invite_status: 'Gagal Dikirim',
      invite_error: error.message,
      updated_by: actor,
    }, { where: { id: row.id, partner_id: partnerId } }).catch(() => null);

    return { status: 'Gagal Dikirim', error: error.message };
  }
};

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const safeFindAll = async (model, options = {}) => {
  try {
    return await model.findAll(options);
  } catch (error) {
    return [];
  }
};

const safeCount = async (model, options = {}) => {
  try {
    return await model.count(options);
  } catch (error) {
    return 0;
  }
};

const buildOwnerDashboard = async (partnerId) => {
  const baseWhere = { partner_id: partnerId, active: true };
  const { start, end } = todayRange();

  const [
    transactions,
    invoices,
    cashFlows,
    purchaseOrders,
    expenses,
    products,
    inventories,
    productions,
  ] = await Promise.all([
    safeFindAll(ErpTransaction, { where: baseWhere, attributes: ['name', 'product', 'quantity', 'total', 'status', 'payment_status', 'transaction_date', 'created_at'] }),
    safeFindAll(ErpInvoice, { where: baseWhere, attributes: ['invoice_no', 'customer', 'total', 'paid_amount', 'status', 'due_date'] }),
    safeFindAll(ErpCashFlow, { where: baseWhere, attributes: ['nominal', 'amount', 'cash_type', 'status', 'transaction_date', 'created_at'] }),
    safeFindAll(ErpPurchaseOrder, { where: baseWhere, attributes: ['po_no', 'supplier', 'item', 'total', 'payment_status', 'status'] }),
    safeFindAll(ErpExpense, { where: baseWhere, attributes: ['name', 'total', 'category', 'payment_status', 'status', 'expense_date'] }),
    safeFindAll(PartnerProduct, { where: baseWhere, attributes: ['name', 'price', 'stock_quantity', 'unit', 'status'] }),
    safeFindAll(ErpInventory, { where: baseWhere, attributes: ['name', 'quantity', 'unit', 'warehouse', 'status'] }),
    safeFindAll(ErpProduction, { where: baseWhere, attributes: ['name', 'output_product', 'quantity', 'status', 'production_place', 'created_at', 'updated_at'] }),
  ]);

  const isToday = (dateValue) => {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    return date >= start && date < end;
  };
  const isActive = (row) => row.status !== 'Batal';
  const transactionDate = (row) => row.transaction_date || row.created_at;
  const todayTransactions = transactions.filter((row) => isActive(row) && isToday(transactionDate(row)));
  const completedTransactions = transactions.filter((row) => isActive(row) && (row.status === 'Selesai' || row.payment_status === 'Lunas'));
  const todayRevenue = todayTransactions.reduce((sum, item) => sum + toNumber(item.total), 0);
  const totalRevenue = completedTransactions.reduce((sum, item) => sum + toNumber(item.total), 0);

  const cashIn = cashFlows
    .filter((row) => isActive(row) && String(row.cash_type).toLowerCase().includes('masuk'))
    .reduce((sum, item) => sum + toNumber(item.nominal || item.amount), 0);
  const cashOut = cashFlows
    .filter((row) => isActive(row) && String(row.cash_type).toLowerCase().includes('keluar'))
    .reduce((sum, item) => sum + toNumber(item.nominal || item.amount), 0);
  const cashAvailable = cashIn - cashOut;

  const receivable = invoices
    .filter((row) => isActive(row) && row.status !== 'Dibayar')
    .reduce((sum, item) => sum + Math.max(toNumber(item.total) - toNumber(item.paid_amount), 0), 0);
  const supplierDebt = purchaseOrders
    .filter((row) => isActive(row) && row.payment_status !== 'Lunas')
    .reduce((sum, item) => sum + toNumber(item.total), 0);
  const unpaidExpense = expenses
    .filter((row) => isActive(row) && row.payment_status !== 'Lunas' && row.status !== 'Dibayar')
    .reduce((sum, item) => sum + toNumber(item.total), 0);

  const salesByProduct = completedTransactions.reduce((result, row) => {
    const name = row.product || row.name || 'Produk/Jasa';
    const current = result[name] || { name, quantity: 0, total: 0 };
    current.quantity += toNumber(row.quantity);
    current.total += toNumber(row.total);
    result[name] = current;
    return result;
  }, {});

  const topProducts = Object.values(salesByProduct)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((item) => ({
      title: item.name,
      subtitle: `${item.quantity || 0} terjual`,
      value: rupiah(item.total),
    }));

  const lowProductStocks = products
    .filter((row) => toNumber(row.stock_quantity) <= 10)
    .map((row) => ({
      title: row.name,
      subtitle: row.status || 'Produk',
      value: `${toNumber(row.stock_quantity)} ${row.unit || 'pcs'}`,
    }));
  const lowInventoryStocks = inventories
    .filter((row) => toNumber(row.quantity) <= 5)
    .map((row) => ({
      title: row.name,
      subtitle: row.warehouse || row.status || 'Inventory',
      value: `${toNumber(row.quantity)} ${row.unit || ''}`.trim(),
    }));
  const lowStocks = [...lowProductStocks, ...lowInventoryStocks].slice(0, 6);

  const lateLimit = new Date();
  lateLimit.setDate(lateLimit.getDate() - 7);
  const lateProductions = productions
    .filter((row) => ['Berjalan', 'QC'].includes(row.status) && new Date(row.created_at || row.updated_at || Date.now()) < lateLimit)
    .slice(0, 5)
    .map((row) => ({
      title: row.name,
      subtitle: row.production_place || row.output_product || 'Produksi',
      value: row.status,
    }));

  const productionCost = expenses
    .filter((row) => isActive(row) && String(row.category || '').toLowerCase().includes('produksi'))
    .reduce((sum, item) => sum + toNumber(item.total), 0);
  const purchaseCost = purchaseOrders
    .filter((row) => isActive(row) && row.payment_status === 'Lunas')
    .reduce((sum, item) => sum + toNumber(item.total), 0);
  const grossProfit = totalRevenue - productionCost - purchaseCost;
  const grossMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  const overdueInvoices = invoices.filter((row) => {
    if (!row.due_date || row.status === 'Dibayar' || row.status === 'Batal') return false;
    return new Date(row.due_date) < new Date();
  }).length;
  const activeOrders = transactions.filter((row) => ['Order Masuk', 'Diproses', 'Dikirim'].includes(row.status)).length;

  const alerts = [
    lowStocks.length ? `${lowStocks.length} stok rendah perlu dicek` : null,
    lateProductions.length ? `${lateProductions.length} produksi terlambat` : null,
    overdueInvoices ? `${overdueInvoices} invoice jatuh tempo` : null,
    supplierDebt > 0 ? `Hutang supplier ${rupiah(supplierDebt)}` : null,
  ].filter(Boolean);

  return {
    generatedAt: new Date().toISOString(),
    metrics: [
      { key: 'todayRevenue', title: 'Omzet Hari Ini', value: rupiah(todayRevenue), subtitle: `${todayTransactions.length} transaksi hari ini`, status: todayRevenue > 0 ? 'good' : 'neutral' },
      { key: 'cashAvailable', title: 'Kas Tersedia', value: rupiah(cashAvailable), subtitle: `Masuk ${rupiah(cashIn)} / Keluar ${rupiah(cashOut)}`, status: cashAvailable >= 0 ? 'good' : 'warning' },
      { key: 'receivable', title: 'Piutang', value: rupiah(receivable), subtitle: `${overdueInvoices} jatuh tempo`, status: overdueInvoices ? 'warning' : 'neutral' },
      { key: 'supplierDebt', title: 'Hutang Supplier', value: rupiah(supplierDebt), subtitle: `Biaya belum dibayar ${rupiah(unpaidExpense)}`, status: supplierDebt > 0 ? 'warning' : 'good' },
      { key: 'grossMargin', title: 'Margin Kasar', value: `${grossMargin}%`, subtitle: `Laba kotor ${rupiah(grossProfit)}`, status: grossMargin >= 30 ? 'good' : grossMargin > 0 ? 'neutral' : 'warning' },
      { key: 'activeOrders', title: 'Order Diproses', value: activeOrders, subtitle: 'Belum selesai', status: activeOrders ? 'neutral' : 'good' },
      { key: 'lowStocks', title: 'Stok Rendah', value: lowStocks.length, subtitle: 'Produk dan inventory', status: lowStocks.length ? 'warning' : 'good' },
      { key: 'lateProductions', title: 'Produksi Terlambat', value: lateProductions.length, subtitle: 'Batch berjalan > 7 hari', status: lateProductions.length ? 'warning' : 'good' },
    ],
    sections: {
      topProducts,
      lowStocks,
      lateProductions,
      alerts,
    },
  };
};

const normalizeApproval = (row) => {
  const data = row && row.dataValues ? row.dataValues : row;
  return {
    id: data.id,
    requestNo: data.request_no,
    module: data.module,
    action: data.action,
    title: data.title,
    description: data.description,
    status: data.status,
    requestedBy: data.requested_by,
    requesterRole: data.requester_role,
    approverRole: data.approver_role,
    approvedBy: data.approved_by,
    approvedAt: data.approved_at,
    amount: rupiah(data.amount),
    threshold: rupiah(data.threshold),
    referenceId: data.reference_id,
    referenceNo: data.reference_no,
    riskLevel: data.risk_level,
    approvalNote: data.approval_note,
    createdAt: data.created_at,
  };
};

const normalizeAuditLog = (row) => {
  const data = row && row.dataValues ? row.dataValues : row;
  return {
    id: data.id,
    module: data.module,
    action: data.action,
    entityId: data.entity_id,
    entityTitle: data.entity_title,
    actor: data.actor,
    actorRole: data.actor_role,
    note: data.note,
    createdAt: data.created_at,
  };
};

const roleRules = [
  {
    role: 'Staff',
    scope: 'Input data operasional',
    approval: 'Tidak bisa approve',
    examples: ['Input supplier', 'Input transaksi', 'Input inventory masuk'],
  },
  {
    role: 'Supervisor',
    scope: 'Approve produksi dan stok keluar',
    approval: 'Produksi, QC, transfer, stok keluar',
    examples: ['Approve bahan keluar produksi', 'Approve batch selesai'],
  },
  {
    role: 'Owner',
    scope: 'Approve pembayaran besar',
    approval: `Pembayaran di atas ${rupiah(APPROVAL_THRESHOLD)}`,
    examples: ['Approve PO besar', 'Approve expense besar', 'Approve cash out besar'],
  },
];

const buildRoleApprovalDashboard = async (partnerId) => {
  const where = { partner_id: partnerId, active: true };
  const [approvals, auditLogs] = await Promise.all([
    safeFindAll(ErpApproval, {
      where,
      order: [['created_at', 'DESC']],
      limit: 50,
    }),
    safeFindAll(ErpAuditLog, {
      where: { partner_id: partnerId },
      order: [['created_at', 'DESC']],
      limit: 30,
    }),
  ]);

  const today = todayRange();
  const isToday = (dateValue) => {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    return date >= today.start && date < today.end;
  };
  const pending = approvals.filter((item) => item.status === 'Menunggu Approval');
  const approvedToday = approvals.filter((item) => item.status === 'Disetujui' && isToday(item.approved_at || item.updated_at));
  const rejected = approvals.filter((item) => item.status === 'Ditolak');

  return {
    metrics: [
      { title: 'Menunggu Approval', value: pending.length, status: pending.length ? 'warning' : 'good' },
      { title: 'Disetujui Hari Ini', value: approvedToday.length, status: 'good' },
      { title: 'Ditolak', value: rejected.length, status: rejected.length ? 'warning' : 'neutral' },
      { title: 'Audit Log', value: auditLogs.length, status: 'neutral' },
    ],
    pendingApprovals: pending.map(normalizeApproval),
    recentApprovals: approvals.slice(0, 10).map(normalizeApproval),
    auditLogs: auditLogs.map(normalizeAuditLog),
    roleRules,
  };
};

const decideApproval = async ({ partnerId, id, status, note, actor, actorRole }) => {
  const approval = await ErpApproval.findOne({ where: { id, partner_id: partnerId, active: true } });
  if (!approval) {
    return { success: false, message: 'Approval tidak ditemukan', data: {} };
  }

  const allowedRoles = approval.approver_role === 'Owner'
    ? ['Owner']
    : ['Supervisor', 'Owner'];
  if (!allowedRoles.includes(actorRole)) {
    return { success: false, message: 'Role tidak sesuai untuk approval ini', data: {} };
  }

  const beforeData = { ...approval.dataValues };
  await ErpApproval.update({
    status,
    approval_note: note,
    approved_by: actor,
    approved_at: new Date(),
    updated_by: actor,
  }, { where: { id, partner_id: partnerId } });

  const updated = await ErpApproval.findOne({ where: { id, partner_id: partnerId } });
  const referenceConfig = MODULES[updated.module];
  if (referenceConfig && referenceConfig.model.rawAttributes.approval_status && updated.reference_id) {
    await referenceConfig.model.update({
      approval_status: status,
      approved_by: actor,
      approved_at: new Date(),
    }, { where: { id: updated.reference_id, partner_id: partnerId } });
  }
  await writeAuditLog({
    partnerId,
    module: 'approval',
    action: status === 'Disetujui' ? 'APPROVE' : 'REJECT',
    entityId: updated.id,
    entityTitle: updated.title,
    actor,
    actorRole,
    beforeData,
    afterData: updated.dataValues,
    note,
  });

  return {
    success: true,
    message: `Approval ${status}`,
    data: normalizeApproval(updated),
  };
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
      message: `Pilihan ${config.label} berhasil dimuat`,
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
      message: rows.rows.length > 0 ? `Daftar ${config.label} berhasil dimuat` : `${config.label} masih kosong`,
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
      ? { success: true, message: `Detail ${config.label} berhasil dimuat`, data: normalize(module, row) }
      : { success: false, message: `${config.label} tidak ditemukan`, data: {} };
  },

  create: async (module, partnerId, body, createdBy, actorRole = 'Staff') => {
    const config = getConfig(module);
    const payload = payloadByModule(module, body);
    payload.partner_id = partnerId;
    payload.created_by = createdBy;
    payload.status = payload.status || config.defaultStatus;
    if (module === 'employeerole') {
      await prepareEmployeeRolePayload({ partnerId, payload, actor: createdBy });
    }

    const title = payload[config.titleField];
    if (!title || title.trim() === '') {
      return { success: false, message: `Nama/Judul ${config.label} wajib diisi`, data: {} };
    }
    if (module === 'stockledger' && !payload.reason && !payload.note) {
      return { success: false, message: 'Alasan koreksi stok wajib diisi', data: {} };
    }

    const row = await config.model.create(sanitizePayload(config.model, payload));
    await writeAuditLog({
      partnerId,
      module,
      action: 'CREATE',
      entityId: row.id,
      entityTitle: titleFromPayload(module, payload, row),
      actor: createdBy,
      actorRole: body.requesterRole || body.requester_role || actorRole,
      afterData: row.dataValues,
      note: `${config.label} dibuat`,
    });
    const approval = await maybeCreateApproval({ module, partnerId, payload: { ...payload, requesterRole: body.requesterRole || body.requester_role || actorRole }, row, actor: createdBy });
    if (approval && config.model.rawAttributes.approval_status) {
      await config.model.update({
        approval_status: 'Menunggu Approval',
        approval_id: approval.id,
      }, { where: { id: row.id, partner_id: partnerId } });
      row.approval_status = 'Menunggu Approval';
      row.approval_id = approval.id;
      payload.approval_status = 'Menunggu Approval';
      payload.approval_id = approval.id;
    }
    await autoCreateStockLedger({ module, partnerId, payload, row, actor: createdBy });
    await autoCreateCashFlow({ module, partnerId, payload, row, actor: createdBy });
    if (module === 'employeerole') {
      const invite = await sendEmployeeRoleInvite({ partnerId, payload, row, actor: createdBy });
      const freshRow = await config.model.findOne({ where: { id: row.id, partner_id: partnerId } });
      const inviteMessage = invite.error
        ? 'Role karyawan berhasil disimpan, tetapi email undangan gagal dikirim. Owner bisa menghubungi karyawan secara manual atau kirim ulang nanti.'
        : payload.user_id
          ? 'Role karyawan berhasil disimpan. Undangan dikirim dan akun karyawan sudah terhubung.'
          : 'Role karyawan berhasil disimpan. Undangan dikirim, karyawan perlu daftar dengan email yang sama.';
      return { success: true, message: inviteMessage, data: normalize(module, freshRow || row) };
    }
    return { success: true, message: approval ? `${config.label} berhasil disimpan dan menunggu approval` : `${config.label} berhasil disimpan`, data: normalize(module, row) };
  },

  update: async (module, partnerId, id, body, updatedBy, actorRole = 'Staff') => {
    const config = getConfig(module);
    const current = await config.model.findOne({ where: { id, partner_id: partnerId } });
    if (!current) {
      return { success: false, message: `${config.label} tidak ditemukan`, data: {} };
    }

    const beforeData = { ...current.dataValues };
    const payload = payloadByModule(module, { ...current.dataValues, ...body });
    payload.id = id;
    payload.updated_by = updatedBy;
    if (module === 'employeerole') {
      await prepareEmployeeRolePayload({ partnerId, payload, actor: updatedBy });
    }
    if (module === 'stockledger' && !payload.reason && !payload.note) {
      return { success: false, message: 'Alasan koreksi stok wajib diisi', data: {} };
    }

    await config.model.update(sanitizePayload(config.model, payload), { where: { id, partner_id: partnerId } });

    const updated = await config.model.findOne({ where: { id, partner_id: partnerId } });
    await writeAuditLog({
      partnerId,
      module,
      action: 'UPDATE',
      entityId: updated.id,
      entityTitle: titleFromPayload(module, payload, updated),
      actor: updatedBy,
      actorRole: body.requesterRole || body.requester_role || actorRole,
      beforeData,
      afterData: updated.dataValues,
      note: `${config.label} diubah`,
    });
    const approval = await maybeCreateApproval({ module, partnerId, payload: { ...payload, requesterRole: body.requesterRole || body.requester_role || actorRole }, row: updated, actor: updatedBy });
    if (approval && config.model.rawAttributes.approval_status) {
      await config.model.update({
        approval_status: 'Menunggu Approval',
        approval_id: approval.id,
      }, { where: { id: updated.id, partner_id: partnerId } });
      updated.approval_status = 'Menunggu Approval';
      updated.approval_id = approval.id;
      payload.approval_status = 'Menunggu Approval';
      payload.approval_id = approval.id;
    }
    await autoCreateCashFlow({ module, partnerId, payload, row: updated, actor: updatedBy });
    if (module === 'employeerole' && (body.resendInvite || (body.email && String(body.email).toLowerCase() !== String(beforeData.email || '').toLowerCase()))) {
      const invite = await sendEmployeeRoleInvite({ partnerId, payload, row: updated, actor: updatedBy });
      const freshRow = await config.model.findOne({ where: { id: updated.id, partner_id: partnerId } });
      const inviteMessage = invite.error
        ? 'Role karyawan berhasil diperbarui, tetapi email undangan gagal dikirim.'
        : 'Role karyawan berhasil diperbarui dan undangan email dikirim.';
      return { success: true, message: inviteMessage, data: normalize(module, freshRow || updated) };
    }
    return { success: true, message: approval ? `${config.label} berhasil diperbarui dan menunggu approval` : `${config.label} berhasil diperbarui`, data: normalize(module, updated) };
  },

  delete: async (module, partnerId, id, deletedBy, actorRole = 'Staff') => {
    const config = getConfig(module);
    const current = await config.model.findOne({ where: { id, partner_id: partnerId } });
    const deleted = await config.model.destroy({ where: { id, partner_id: partnerId } });
    if (deleted && current) {
      await writeAuditLog({
        partnerId,
        module,
        action: 'DELETE',
        entityId: current.id,
        entityTitle: titleFromPayload(module, current.dataValues, current),
        actor: deletedBy,
        actorRole,
        beforeData: current.dataValues,
        note: `${config.label} dihapus`,
      });
    }
    return deleted
      ? { success: true, message: `${config.label} berhasil dihapus`, data: [] }
      : { success: false, message: `${config.label} tidak ditemukan`, data: {} };
  },

  getMetrics: async (module, partnerId) => {
    const config = getConfig(module);
    const metrics = await buildMetrics(module, partnerId);
    return { success: true, message: `Ringkasan ${config.label} berhasil dimuat`, data: metrics };
  },

  getOwnerDashboard: async (partnerId) => ({
    success: true,
    message: 'Ringkasan owner berhasil dimuat',
    data: await buildOwnerDashboard(partnerId),
  }),

  getRoleApprovalDashboard: async (partnerId) => ({
    success: true,
    message: 'Role dan approval berhasil dimuat',
    data: await buildRoleApprovalDashboard(partnerId),
  }),

  approveRequest: async (partnerId, id, body, actor, actorRole) => decideApproval({
    partnerId,
    id,
    status: 'Disetujui',
    note: body.note || body.approvalNote || 'Disetujui',
    actor,
    actorRole,
  }),

  rejectRequest: async (partnerId, id, body, actor, actorRole) => decideApproval({
    partnerId,
    id,
    status: 'Ditolak',
    note: body.note || body.approvalNote || 'Ditolak',
    actor,
    actorRole,
  }),

  getBarcodeConfig: (module) => {
    const config = getConfig(module);
    return {
      success: true,
      message: `Pengaturan barcode ${config.label} berhasil dimuat`,
      data: config.barcode || {},
    };
  },

  scan: async (module, partnerId, body, createdBy, actorRole = 'Staff') => {
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
    await writeAuditLog({
      partnerId,
      module,
      action: 'SCAN',
      entityId: row.id,
      entityTitle: payload.result_name || payload.code,
      actor: createdBy,
      actorRole: body.requesterRole || body.requester_role || actorRole,
      afterData: payload,
      note: `Scan ${config.label}`,
    });
    return {
      success: true,
      message: `Scan ${config.label} berhasil dicatat`,
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
