var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpStockLedger = dbSeq.define('erp_stock_ledger', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'hai_user', key: 'id' } },
  name: { type: Sequelize.STRING(150), allowNull: false },
  sku: { type: Sequelize.STRING(80), allowNull: true },
  movement_type: { type: Sequelize.STRING(60), allowNull: false, defaultValue: 'Masuk' },
  status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Tercatat' },
  quantity_in: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  quantity_out: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  balance_after: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  unit: { type: Sequelize.STRING(40), allowNull: true },
  warehouse: { type: Sequelize.STRING(150), allowNull: true },
  source_module: { type: Sequelize.STRING(80), allowNull: true },
  source_reference: { type: Sequelize.STRING(150), allowNull: true },
  supplier: { type: Sequelize.STRING(150), allowNull: true },
  production_batch: { type: Sequelize.STRING(120), allowNull: true },
  product: { type: Sequelize.STRING(150), allowNull: true },
  approval_status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Tidak Perlu Approval' },
  approval_id: { type: Sequelize.INTEGER, allowNull: true },
  approved_by: { type: Sequelize.STRING(120), allowNull: true },
  approved_at: { type: Sequelize.DATE, allowNull: true },
  reason: { type: Sequelize.STRING(500), allowNull: true },
  note: { type: Sequelize.STRING(1000), allowNull: true },
  details: { type: Sequelize.TEXT, allowNull: true },
  relations: { type: Sequelize.TEXT, allowNull: true },
  flow_flags: { type: Sequelize.TEXT, allowNull: true },
  active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  created_at: { type: Sequelize.DATE, allowNull: true },
  created_by: { type: Sequelize.STRING(50), allowNull: true },
  updated_at: { type: Sequelize.DATE, allowNull: true },
  updated_by: { type: Sequelize.STRING(50), allowNull: true },
}, {
  tableName: 'erp_stock_ledger',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpStockLedger.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpStockLedger, { foreignKey: "partner_id" });

module.exports = ErpStockLedger
