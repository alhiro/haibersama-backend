const Sequelize = require('sequelize');
const ErpSupplier = require('../models/erpSupplier');
const ErpWarehouse = require('../models/erpWarehouse');
const ErpInventory = require('../models/erpInventory');
const ErpProduction = require('../models/erpProduction');
const ErpReport = require('../models/erpReport');
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

  ['warehouse', 'supplier', 'reference', 'production_place', 'output_product', 'report_type'].forEach((key) => {
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
