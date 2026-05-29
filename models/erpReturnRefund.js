var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpReturnRefund = dbSeq.define('erp_return_refund', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'hai_user', key: 'id' } },
  name: { type: Sequelize.STRING(150), allowNull: false },
  return_no: { type: Sequelize.STRING(80), allowNull: true },
  status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Pengajuan' },
  customer: { type: Sequelize.STRING(150), allowNull: true },
  product: { type: Sequelize.STRING(150), allowNull: true },
  quantity: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  unit: { type: Sequelize.STRING(40), allowNull: true },
  transaction_no: { type: Sequelize.STRING(80), allowNull: true },
  invoice_no: { type: Sequelize.STRING(80), allowNull: true },
  warehouse: { type: Sequelize.STRING(150), allowNull: true },
  refund_amount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  refund_method: { type: Sequelize.STRING(80), allowNull: true },
  reason: { type: Sequelize.STRING(500), allowNull: true },
  cashflow_reference: { type: Sequelize.STRING(150), allowNull: true },
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
  tableName: 'erp_return_refund',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpReturnRefund.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpReturnRefund, { foreignKey: "partner_id" });

module.exports = ErpReturnRefund
