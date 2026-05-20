var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpScanHistory = dbSeq.define('erp_scan_history', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'hai_user', key: 'id' }
  },
  module: { type: Sequelize.STRING(40), allowNull: false },
  code: { type: Sequelize.STRING(100), allowNull: false },
  action: { type: Sequelize.STRING(80), allowNull: true },
  quantity: { type: Sequelize.STRING(50), allowNull: true },
  result_name: { type: Sequelize.STRING(150), allowNull: true },
  result_sku: { type: Sequelize.STRING(100), allowNull: true },
  payload: { type: Sequelize.TEXT, allowNull: true },
  created_at: { type: Sequelize.DATE, allowNull: true },
  created_by: { type: Sequelize.STRING(50), allowNull: true },
  updated_at: { type: Sequelize.DATE, allowNull: true },
  updated_by: { type: Sequelize.STRING(50), allowNull: true },
}, {
  tableName: 'erp_scan_history',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpScanHistory.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpScanHistory, { foreignKey: "partner_id" });

module.exports = ErpScanHistory
