var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpPurchaseOrder = dbSeq.define('erp_purchase_order', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'hai_user', key: 'id' }
  },
  name: { type: Sequelize.STRING(150), allowNull: false },
  description: { type: Sequelize.STRING(1000), allowNull: true },
  status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Draft' },
  meta: { type: Sequelize.STRING(200), allowNull: true },
  amount: { type: Sequelize.STRING(100), allowNull: true },
  po_no: { type: Sequelize.STRING(80), allowNull: true },
  po_type: { type: Sequelize.STRING(40), allowNull: true },
  supplier: { type: Sequelize.STRING(150), allowNull: true },
  supplier_contact: { type: Sequelize.STRING(120), allowNull: true },
  warehouse: { type: Sequelize.STRING(150), allowNull: true },
  item: { type: Sequelize.STRING(150), allowNull: true },
  quantity: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  received_quantity: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  unit: { type: Sequelize.STRING(40), allowNull: true },
  expected_date: { type: Sequelize.DATE, allowNull: true },
  payment_status: { type: Sequelize.STRING(40), allowNull: true },
  payment_method: { type: Sequelize.STRING(80), allowNull: true },
  subtotal: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  discount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  tax: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  shipping_cost: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  total: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  source_reference: { type: Sequelize.STRING(150), allowNull: true },
  reference: { type: Sequelize.STRING(150), allowNull: true },
  approval_status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Tidak Perlu Approval' },
  approval_id: { type: Sequelize.INTEGER, allowNull: true },
  approved_by: { type: Sequelize.STRING(120), allowNull: true },
  approved_at: { type: Sequelize.DATE, allowNull: true },
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
  tableName: 'erp_purchase_order',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpPurchaseOrder.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpPurchaseOrder, { foreignKey: "partner_id" });

module.exports = ErpPurchaseOrder
