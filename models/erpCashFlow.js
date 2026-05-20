var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpCashFlow = dbSeq.define('erp_cash_flow', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'hai_user', key: 'id' }
  },
  name: { type: Sequelize.STRING(150), allowNull: false },
  description: { type: Sequelize.STRING(1000), allowNull: true },
  status: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'Tercatat' },
  meta: { type: Sequelize.STRING(200), allowNull: true },
  amount: { type: Sequelize.STRING(100), allowNull: true },
  nominal: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  cash_type: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'Uang Masuk' },
  category: { type: Sequelize.STRING(100), allowNull: true },
  payment_method: { type: Sequelize.STRING(80), allowNull: true },
  transaction_date: { type: Sequelize.DATE, allowNull: true },
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
  tableName: 'erp_cash_flow',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpCashFlow.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpCashFlow, { foreignKey: "partner_id" });

module.exports = ErpCashFlow
