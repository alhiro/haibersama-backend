var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpProduction = dbSeq.define('erp_production', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'hai_user', key: 'id' }
  },
  name: { type: Sequelize.STRING(150), allowNull: false },
  description: { type: Sequelize.STRING(1000), allowNull: true },
  status: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'Berjalan' },
  meta: { type: Sequelize.STRING(200), allowNull: true },
  amount: { type: Sequelize.STRING(100), allowNull: true },
  inventory_source: { type: Sequelize.STRING(250), allowNull: true },
  source_warehouse: { type: Sequelize.STRING(150), allowNull: true },
  output_product: { type: Sequelize.STRING(150), allowNull: true },
  destination_warehouse: { type: Sequelize.STRING(150), allowNull: true },
  quantity: { type: Sequelize.DECIMAL, allowNull: true, defaultValue: 0 },
  unit: { type: Sequelize.STRING(40), allowNull: true },
  production_place: { type: Sequelize.STRING(150), allowNull: true },
  failed_quantity: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
  qc_pass_quantity: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
  relation: { type: Sequelize.STRING(250), allowNull: true },
  relations: { type: Sequelize.TEXT, allowNull: true },
  flow_flags: { type: Sequelize.TEXT, allowNull: true },
  active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  created_at: { type: Sequelize.DATE, allowNull: true },
  created_by: { type: Sequelize.STRING(50), allowNull: true },
  updated_at: { type: Sequelize.DATE, allowNull: true },
  updated_by: { type: Sequelize.STRING(50), allowNull: true },
}, {
  tableName: 'erp_production',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpProduction.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpProduction, { foreignKey: "partner_id" });

module.exports = ErpProduction
