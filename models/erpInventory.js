var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpInventory = dbSeq.define('erp_inventory', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'hai_user', key: 'id' }
  },
  name: { type: Sequelize.STRING(150), allowNull: false },
  description: { type: Sequelize.STRING(1000), allowNull: true },
  status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Barang Masuk' },
  meta: { type: Sequelize.STRING(200), allowNull: true },
  amount: { type: Sequelize.STRING(100), allowNull: true },
  supplier: { type: Sequelize.STRING(150), allowNull: true },
  quantity: { type: Sequelize.DECIMAL, allowNull: true, defaultValue: 0 },
  unit: { type: Sequelize.STRING(40), allowNull: true },
  warehouse: { type: Sequelize.STRING(150), allowNull: true },
  added_by: { type: Sequelize.STRING(100), allowNull: true },
  added_at: { type: Sequelize.DATE, allowNull: true },
  reference: { type: Sequelize.STRING(100), allowNull: true },
  relation: { type: Sequelize.STRING(250), allowNull: true },
  details: { type: Sequelize.TEXT, allowNull: true },
  relations: { type: Sequelize.TEXT, allowNull: true },
  flow_flags: { type: Sequelize.TEXT, allowNull: true },
  active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  created_at: { type: Sequelize.DATE, allowNull: true },
  created_by: { type: Sequelize.STRING(50), allowNull: true },
  updated_at: { type: Sequelize.DATE, allowNull: true },
  updated_by: { type: Sequelize.STRING(50), allowNull: true },
}, {
  tableName: 'erp_inventory',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpInventory.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpInventory, { foreignKey: "partner_id" });

module.exports = ErpInventory
