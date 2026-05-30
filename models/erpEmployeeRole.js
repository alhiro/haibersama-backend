var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpEmployeeRole = dbSeq.define('erp_employee_role', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'hai_user', key: 'id' } },
  user_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'hai_user', key: 'id' } },
  name: { type: Sequelize.STRING(150), allowNull: false },
  email: { type: Sequelize.STRING(120), allowNull: true },
  phone: { type: Sequelize.STRING(50), allowNull: true },
  role: { type: Sequelize.STRING(80), allowNull: false, defaultValue: 'Staff' },
  department: { type: Sequelize.STRING(100), allowNull: true },
  status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Aktif' },
  permissions: { type: Sequelize.TEXT, allowNull: true },
  invited_by: { type: Sequelize.STRING(120), allowNull: true },
  invited_at: { type: Sequelize.DATE, allowNull: true },
  joined_at: { type: Sequelize.DATE, allowNull: true },
  note: { type: Sequelize.STRING(1000), allowNull: true },
  active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  created_at: { type: Sequelize.DATE, allowNull: true },
  created_by: { type: Sequelize.STRING(50), allowNull: true },
  updated_at: { type: Sequelize.DATE, allowNull: true },
  updated_by: { type: Sequelize.STRING(50), allowNull: true },
}, {
  tableName: 'erp_employee_role',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpEmployeeRole.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpEmployeeRole, { foreignKey: "partner_id" });

module.exports = ErpEmployeeRole
