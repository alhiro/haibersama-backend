var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpMarketplaceSettlement = dbSeq.define('erp_marketplace_settlement', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'hai_user', key: 'id' } },
  name: { type: Sequelize.STRING(150), allowNull: false },
  settlement_no: { type: Sequelize.STRING(80), allowNull: true },
  marketplace: { type: Sequelize.STRING(80), allowNull: true },
  status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Menunggu Cair' },
  gross_sales: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  marketplace_fee: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  shipping_fee: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  discount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  refund_amount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  net_payout: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  payout_date: { type: Sequelize.DATE, allowNull: true },
  transaction_no: { type: Sequelize.STRING(80), allowNull: true },
  invoice_no: { type: Sequelize.STRING(80), allowNull: true },
  cashflow_reference: { type: Sequelize.STRING(150), allowNull: true },
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
  tableName: 'erp_marketplace_settlement',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpMarketplaceSettlement.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpMarketplaceSettlement, { foreignKey: "partner_id" });

module.exports = ErpMarketplaceSettlement
