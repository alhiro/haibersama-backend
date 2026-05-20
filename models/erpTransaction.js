var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpTransaction = dbSeq.define('erp_transaction', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'hai_user', key: 'id' }
  },
  name: { type: Sequelize.STRING(150), allowNull: false },
  description: { type: Sequelize.STRING(1000), allowNull: true },
  status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Order Masuk' },
  meta: { type: Sequelize.STRING(200), allowNull: true },
  amount: { type: Sequelize.STRING(100), allowNull: true },
  transaction_no: { type: Sequelize.STRING(80), allowNull: true },
  transaction_type: { type: Sequelize.STRING(40), allowNull: true },
  channel: { type: Sequelize.STRING(80), allowNull: true },
  customer: { type: Sequelize.STRING(150), allowNull: true },
  customer_contact: { type: Sequelize.STRING(120), allowNull: true },
  product: { type: Sequelize.STRING(150), allowNull: true },
  quantity: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  unit: { type: Sequelize.STRING(40), allowNull: true },
  warehouse: { type: Sequelize.STRING(150), allowNull: true },
  invoice_no: { type: Sequelize.STRING(80), allowNull: true },
  payment_status: { type: Sequelize.STRING(40), allowNull: true },
  payment_method: { type: Sequelize.STRING(80), allowNull: true },
  subtotal: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  discount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  tax: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  shipping_cost: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  total: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  transaction_date: { type: Sequelize.DATE, allowNull: true },
  due_date: { type: Sequelize.DATE, allowNull: true },
  source_reference: { type: Sequelize.STRING(150), allowNull: true },
  reference: { type: Sequelize.STRING(150), allowNull: true },
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
  tableName: 'erp_transaction',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpTransaction.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpTransaction, { foreignKey: "partner_id" });

module.exports = ErpTransaction
