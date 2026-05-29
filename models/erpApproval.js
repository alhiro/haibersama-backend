var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpApproval = dbSeq.define('erp_approval', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'hai_user', key: 'id' }
  },
  request_no: { type: Sequelize.STRING(80), allowNull: true },
  module: { type: Sequelize.STRING(60), allowNull: false },
  action: { type: Sequelize.STRING(80), allowNull: false },
  title: { type: Sequelize.STRING(150), allowNull: false },
  description: { type: Sequelize.STRING(1000), allowNull: true },
  status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Menunggu Approval' },
  requested_by: { type: Sequelize.STRING(120), allowNull: true },
  requester_role: { type: Sequelize.STRING(80), allowNull: true },
  approver_role: { type: Sequelize.STRING(80), allowNull: true },
  approved_by: { type: Sequelize.STRING(120), allowNull: true },
  approved_at: { type: Sequelize.DATE, allowNull: true },
  amount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  threshold: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
  reference_id: { type: Sequelize.INTEGER, allowNull: true },
  reference_no: { type: Sequelize.STRING(150), allowNull: true },
  risk_level: { type: Sequelize.STRING(40), allowNull: true },
  approval_note: { type: Sequelize.STRING(1000), allowNull: true },
  details: { type: Sequelize.TEXT, allowNull: true },
  active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  created_at: { type: Sequelize.DATE, allowNull: true },
  created_by: { type: Sequelize.STRING(50), allowNull: true },
  updated_at: { type: Sequelize.DATE, allowNull: true },
  updated_by: { type: Sequelize.STRING(50), allowNull: true },
}, {
  tableName: 'erp_approval',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpApproval.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpApproval, { foreignKey: "partner_id" });

module.exports = ErpApproval
