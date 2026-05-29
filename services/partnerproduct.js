const Sequelize = require('sequelize');
const PartnerProduct = require('../models/partnerProduct');
const ErpWarehouse = require('../models/erpWarehouse');
const ErpProduction = require('../models/erpProduction');
const ErpAuditLog = require('../models/erpAuditLog');

const Op = Sequelize.Op;

const DEFAULT_STATUSES = ['Publish', 'Draft', 'Perlu Foto'];
const DEFAULT_WAREHOUSES = [];
const DEFAULT_PRODUCTION_BATCHES = [];
const DEFAULT_TITLE_OPTIONS = [];
const DEFAULT_TITLE_OPTIONS_BY_WAREHOUSE = {};

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

const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  return ['true', '1', 'yes', 'publish'].includes(String(value).toLowerCase());
};

const normalizeProduct = (product) => {
  if (!product) return product;

  const data = product.dataValues ? { ...product.dataValues } : { ...product };
  const relations = parseJsonArray(data.relations);
  const flowFlags = parseJsonArray(data.flow_flags);
  const stockText = `${toNumber(data.stock_quantity)} ${data.unit || 'pcs'}`;

  return {
    ...data,
    title: data.name,
    subtitle: data.description,
    meta: data.sku ? `SKU ${data.sku}` : null,
    amount: `Rp ${Number(data.price || 0).toLocaleString('id-ID')}`,
    stock: stockText,
    relations,
    flow_flags: flowFlags,
    flowFlags,
    hasPhoto: Boolean(data.has_photo),
  };
};

const buildRelations = (data) => {
  if (data.relations) return data.relations;

  const relations = [];
  if (data.supplier_name) relations.push(`Supplier: ${data.supplier_name}`);
  if (data.warehouse) relations.push(`Warehouse: ${data.warehouse}`);
  if (data.stock_quantity !== undefined) relations.push(`Inventory: ${data.stock_quantity} ${data.unit || 'pcs'} siap jual`);
  if (data.production_batch) relations.push(`Produksi: ${data.production_batch}`);

  return relations;
};

const buildFlowFlags = (data) => {
  if (data.flow_flags) return data.flow_flags;

  const flowFlags = [];
  if (data.production_batch) {
    flowFlags.push({ label: 'Dari Produksi', value: data.production_batch });
  }
  if (data.warehouse) {
    flowFlags.push({ label: 'Gudang', value: data.warehouse });
  }
  if (data.stock_quantity !== undefined) {
    flowFlags.push({ label: data.status === 'Perlu Foto' ? 'Status Stok' : 'Siap Jual', value: `${data.stock_quantity} ${data.unit || 'pcs'}` });
  }

  return flowFlags;
};

const buildProductPayload = (data) => {
  const stockQuantity = toNumber(data.stock_quantity, toNumber(data.quantity, 0));
  const unit = data.unit || 'pcs';
  const status = data.status || 'Draft';
  const publicValue = data.public !== undefined ? toBoolean(data.public) : status === 'Publish';
  const hasPhoto = data.has_photo !== undefined ? toBoolean(data.has_photo) : Boolean(data.image_url);

  const payload = {
    name: data.name || data.title,
    sku: data.sku,
    description: data.description || data.subtitle,
    status,
    price: toNumber(data.price, 0),
    warehouse: data.warehouse,
    production_batch: data.production_batch || data.production,
    stock_quantity: stockQuantity,
    unit,
    supplier_name: data.supplier_name,
    inventory_note: data.inventory_note,
    has_photo: hasPhoto,
    image_url: data.image_url,
    public: publicValue,
    active: data.active !== undefined ? toBoolean(data.active, true) : true,
  };

  payload.relations = stringifyArray(data.relations || buildRelations(payload));
  payload.flow_flags = stringifyArray(data.flow_flags || data.flowFlags || buildFlowFlags(payload));

  return payload;
};

const removeUndefined = (data) => Object.keys(data).reduce((result, key) => {
  if (data[key] !== undefined) result[key] = data[key];
  return result;
}, {});

const unique = (items) => [...new Set(items.filter((item) => item !== undefined && item !== null && String(item).trim() !== ''))];

const writeProductAudit = async ({ partnerId, action, entityId, entityTitle, actor, actorRole, beforeData, afterData, note }) => {
  try {
    await ErpAuditLog.create({
      partner_id: partnerId,
      module: 'product',
      action,
      entity_id: entityId,
      entity_title: entityTitle,
      actor,
      actor_role: actorRole,
      before_data: beforeData ? JSON.stringify(beforeData) : null,
      after_data: afterData ? JSON.stringify(afterData) : null,
      note,
      created_by: actor,
    });
  } catch (error) {
    console.error('Gagal mencatat audit produk', error.message);
  }
};

const buildListFilter = (params, partnerId, onlyPublic = false) => {
  const filter = { active: true };

  if (partnerId) filter.partner_id = partnerId;
  if (onlyPublic) {
    filter.public = true;
    filter.status = 'Publish';
  }
  if (params.status) filter.status = params.status;
  if (params.warehouse) filter.warehouse = params.warehouse;
  if (params.productionBatch) filter.production_batch = params.productionBatch;
  if (params.startDate && params.endDate) {
    filter.created_at = {
      [Op.between]: [new Date(params.startDate), new Date(params.endDate)],
    };
  } else if (params.startDate) {
    filter.created_at = { [Op.gte]: new Date(params.startDate) };
  } else if (params.endDate) {
    filter.created_at = { [Op.lte]: new Date(params.endDate) };
  }
  if (params.search && params.search.trim() !== '') {
    const keyword = `%${params.search.toLowerCase()}%`;
    filter[Op.or] = [
      Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), { [Op.like]: keyword }),
      Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('sku')), { [Op.like]: keyword }),
      Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('description')), { [Op.like]: keyword }),
    ];
  }

  return filter;
};

module.exports = {
  getOptions: async (partnerId) => {
    const baseWhere = partnerId ? { partner_id: partnerId, active: true } : { partner_id: -1, active: true };
    const [warehouses, productions] = await Promise.all([
      ErpWarehouse.findAll({ where: baseWhere, attributes: ['name'], order: [['created_at', 'DESC']] }),
      ErpProduction.findAll({
        where: baseWhere,
        attributes: ['name', 'output_product', 'destination_warehouse'],
        order: [['created_at', 'DESC']],
      }),
    ]);

    const warehouseNames = unique(warehouses.map((item) => item.name));
    const productionBatches = unique(productions.map((item) => item.name));
    const titleOptions = unique(productions.map((item) => item.output_product));
    const titleOptionsByWarehouse = productions.reduce((result, item) => {
      const warehouse = item.destination_warehouse;
      const product = item.output_product;
      if (!warehouse || !product) return result;
      result[warehouse] = unique([...(result[warehouse] || []), product]);
      return result;
    }, {});

    return {
      success: true,
      message: 'Pilihan produk berhasil dimuat',
      data: {
        statuses: DEFAULT_STATUSES,
        warehouses: warehouseNames.length ? warehouseNames : DEFAULT_WAREHOUSES,
        production_batches: productionBatches.length ? productionBatches : DEFAULT_PRODUCTION_BATCHES,
        title_options: titleOptions.length ? titleOptions : DEFAULT_TITLE_OPTIONS,
        title_depends_on_field_key: 'warehouse',
        title_options_by_warehouse: Object.keys(titleOptionsByWarehouse).length ? titleOptionsByWarehouse : DEFAULT_TITLE_OPTIONS_BY_WAREHOUSE,
        units: ['pcs', 'set', 'pack', 'lusin'],
      },
    };
  },

  getList: async (partnerId, params = {}, onlyPublic = false) => {
    const page = parseInt(params.page || 1);
    const limit = parseInt(params.limit || 20);
    const filter = buildListFilter(params, partnerId, onlyPublic);

    return PartnerProduct.findAndCountAll({
      where: filter,
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    }).then((resp) => ({
      success: true,
      message: resp.rows.length > 0 ? 'Daftar produk berhasil dimuat' : 'Produk masih kosong',
      data: resp.rows.map(normalizeProduct),
      page,
      count: Math.ceil(resp.count / limit),
      length: resp.count,
    }));
  },

  getDetail: async (id, partnerId, onlyPublic = false) => {
    const filter = { id };
    if (partnerId) filter.partner_id = partnerId;
    if (onlyPublic) {
      filter.public = true;
      filter.status = 'Publish';
      filter.active = true;
    }

    return PartnerProduct.findOne({ where: filter })
      .then((data) => (!data
        ? { success: false, message: 'Produk tidak ditemukan', data: {} }
        : { success: true, message: 'Detail produk berhasil dimuat', data: normalizeProduct(data) }));
  },

  create: async (data) => {
    const payload = buildProductPayload(data);
    payload.partner_id = data.partner_id;
    payload.created_by = data.created_by;

    if (!payload.name || payload.name.trim() === '') {
      return { success: false, message: 'Nama produk wajib diisi', data: {} };
    }
    if (!payload.warehouse || !payload.production_batch) {
      return { success: false, message: 'Warehouse dan batch produksi wajib diisi', data: {} };
    }

    const where = payload.sku
      ? { partner_id: payload.partner_id, sku: payload.sku }
      : { partner_id: payload.partner_id, name: payload.name };

    const product = await PartnerProduct.findOrCreate({ where, defaults: payload });
    if (!product[1]) {
      return { success: false, message: 'Produk sudah ada', data: normalizeProduct(product[0]) };
    }

    await writeProductAudit({
      partnerId: payload.partner_id,
      action: 'CREATE',
      entityId: product[0].id,
      entityTitle: payload.name,
      actor: data.created_by,
      actorRole: data.actor_role,
      afterData: product[0].dataValues,
      note: 'Produk dibuat',
    });

    return { success: true, message: 'Produk berhasil disimpan', data: normalizeProduct(product[0]) };
  },

  update: async (data) => {
    const filter = { id: data.id, partner_id: data.partner_id };
    const current = await PartnerProduct.findOne({ where: filter });

    if (!current) {
      return { success: false, message: 'Produk tidak ditemukan', data: {} };
    }

    const cleanData = removeUndefined(data);
    const mergedData = {
      ...current.dataValues,
      ...cleanData,
    };

    if (cleanData.status !== undefined && cleanData.public === undefined) {
      mergedData.public = cleanData.status === 'Publish';
    }
    if (cleanData.relations === undefined) {
      delete mergedData.relations;
    }
    if (cleanData.flow_flags === undefined && cleanData.flowFlags === undefined) {
      delete mergedData.flow_flags;
    }

    const payload = buildProductPayload(mergedData);
    payload.updated_by = data.updated_by;

    await PartnerProduct.update(payload, { where: filter });

    const updated = await PartnerProduct.findOne({ where: filter });
    await writeProductAudit({
      partnerId: data.partner_id,
      action: 'UPDATE',
      entityId: updated.id,
      entityTitle: updated.name,
      actor: data.updated_by,
      actorRole: data.actor_role,
      beforeData: current.dataValues,
      afterData: updated.dataValues,
      note: 'Produk diperbarui',
    });
    return { success: true, message: 'Produk berhasil diperbarui', data: normalizeProduct(updated) };
  },

  delete: async (data) => {
    const current = await PartnerProduct.findOne({
      where: {
        id: data.id,
        partner_id: data.partner_id,
      },
    });
    const deleted = await PartnerProduct.destroy({
      where: {
        id: data.id,
        partner_id: data.partner_id,
      },
    });

    if (deleted) {
      await writeProductAudit({
        partnerId: data.partner_id,
        action: 'DELETE',
        entityId: data.id,
        entityTitle: current ? current.name : null,
        actor: data.deleted_by,
        actorRole: data.actor_role,
        beforeData: current ? current.dataValues : null,
        note: 'Produk dihapus',
      });
      return { success: true, message: 'Produk berhasil dihapus', data: [] };
    }

    return { success: false, message: 'Produk tidak ditemukan', data: {} };
  },

  getMetrics: async (partnerId) => {
    const baseFilter = { partner_id: partnerId, active: true };
    const totalSku = await PartnerProduct.count({ where: baseFilter });
    const publish = await PartnerProduct.count({ where: { ...baseFilter, status: 'Publish' } });
    const draft = await PartnerProduct.count({ where: { ...baseFilter, status: 'Draft' } });
    const needPhoto = await PartnerProduct.count({ where: { ...baseFilter, status: 'Perlu Foto' } });
    const rows = await PartnerProduct.findAll({ where: baseFilter, attributes: ['price', 'stock_quantity'] });

    const stockTotal = rows.reduce((total, item) => total + toNumber(item.stock_quantity), 0);
    const averagePrice = rows.length
      ? Math.round(rows.reduce((total, item) => total + toNumber(item.price), 0) / rows.length)
      : 0;

    return {
      success: true,
      message: 'Ringkasan produk berhasil dimuat',
      data: {
        total_sku: totalSku,
        publish,
        draft,
        perlu_foto: needPhoto,
        stock_total: stockTotal,
        average_price: averagePrice,
      },
    };
  },

  getMarketplaceList: async (partnerId, params = {}) => {
    const filter = buildListFilter(params, partnerId, true);

    return PartnerProduct.findAll({
      where: filter,
      order: [['stock_quantity', 'DESC'], ['created_at', 'DESC']],
    }).then((rows) => ({
      success: true,
      message: rows.length > 0 ? 'Produk marketplace berhasil dimuat' : 'Produk marketplace masih kosong',
      data: rows.map((row) => {
        const product = normalizeProduct(row);
        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          price: product.price,
          amount: product.amount,
          image_url: product.image_url,
          has_photo: product.has_photo,
        };
      }),
    }));
  },
};
