var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpExpense = dbSeq.define('erp_expense', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'hai_user', key: 'id' }
  },
  name: { type: Sequelize.STRING(150), allowNull: false },
  description: { type: Sequelize.STRING(1000), allowNull: true },
  status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Tercatat' },
  meta: { type: Sequelize.STRING(200), allowNull: true },
  amount: { type: Sequelize.STRING(100), allowNull: true },
  expense_no: { type: Sequelize.STRING(80), allowNull: true },
  expense_type: { type: Sequelize.STRING(60), allowNull: true },
  category: { type: Sequelize.STRING(100), allowNull: true },
  supplier: { type: Sequelize.STRING(150), allowNull: true },
  warehouse: { type: Sequelize.STRING(150), allowNull: true },
  product: { type: Sequelize.STRING(150), allowNull: true },
  po_no: { type: Sequelize.STRING(80), allowNull: true },
  production_batch: { type: Sequelize.STRING(120), allowNull: true },
  transaction_no: { type: Sequelize.STRING(80), allowNull: true },
  invoice_no: { type: Sequelize.STRING(80), allowNull: true },
  cashflow_reference: { type: Sequelize.STRING(150), allowNull: true },
  vendor: { type: Sequelize.STRING(150), allowNull: true },
  employee: { type: Sequelize.STRING(150), allowNull: true },
  payment_status: { type: Sequelize.STRING(40), allowNull: true },
  payment_method: { type: Sequelize.STRING(80), allowNull: true },
  expense_date: { type: Sequelize.DATE, allowNull: true },
  due_date: { type: Sequelize.DATE, allowNull: true },
  subtotal: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  discount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  tax: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  total: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  source_module: { type: Sequelize.STRING(80), allowNull: true },
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
  tableName: 'erp_expense',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpExpense.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpExpense, { foreignKey: "partner_id" });

module.exports = ErpExpense
