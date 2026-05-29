var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpAuditLog = dbSeq.define('erp_audit_log', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'hai_user', key: 'id' }
  },
  module: { type: Sequelize.STRING(60), allowNull: false },
  action: { type: Sequelize.STRING(80), allowNull: false },
  entity_id: { type: Sequelize.INTEGER, allowNull: true },
  entity_title: { type: Sequelize.STRING(150), allowNull: true },
  actor: { type: Sequelize.STRING(120), allowNull: true },
  actor_role: { type: Sequelize.STRING(80), allowNull: true },
  before_data: { type: Sequelize.TEXT, allowNull: true },
  after_data: { type: Sequelize.TEXT, allowNull: true },
  note: { type: Sequelize.STRING(1000), allowNull: true },
  created_at: { type: Sequelize.DATE, allowNull: true },
  created_by: { type: Sequelize.STRING(50), allowNull: true },
  updated_at: { type: Sequelize.DATE, allowNull: true },
  updated_by: { type: Sequelize.STRING(50), allowNull: true },
}, {
  tableName: 'erp_audit_log',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpAuditLog.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpAuditLog, { foreignKey: "partner_id" });

module.exports = ErpAuditLog
