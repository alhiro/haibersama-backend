var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const ErpWarehouse = dbSeq.define('erp_warehouse', {
  id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'hai_user', key: 'id' }
  },
  name: { type: Sequelize.STRING(150), allowNull: false },
  description: { type: Sequelize.STRING(1000), allowNull: true },
  status: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'Aktif' },
  meta: { type: Sequelize.STRING(200), allowNull: true },
  amount: { type: Sequelize.STRING(100), allowNull: true },
  contact: { type: Sequelize.STRING(100), allowNull: true },
  address: { type: Sequelize.STRING(500), allowNull: true },
  map_url: { type: Sequelize.STRING(500), allowNull: true },
  rack: { type: Sequelize.STRING(100), allowNull: true },
  capacity: { type: Sequelize.STRING(50), allowNull: true },
  relation: { type: Sequelize.STRING(250), allowNull: true },
  relations: { type: Sequelize.TEXT, allowNull: true },
  flow_flags: { type: Sequelize.TEXT, allowNull: true },
  active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  created_at: { type: Sequelize.DATE, allowNull: true },
  created_by: { type: Sequelize.STRING(50), allowNull: true },
  updated_at: { type: Sequelize.DATE, allowNull: true },
  updated_by: { type: Sequelize.STRING(50), allowNull: true },
}, {
  tableName: 'erp_warehouse',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

ErpWarehouse.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(ErpWarehouse, { foreignKey: "partner_id" });

module.exports = ErpWarehouse
