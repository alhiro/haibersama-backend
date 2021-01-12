var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

var Service = require('./service')

const SubService = dbSeq.define('subservice', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  service_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'service',
      key: 'id'
    }
  },
  name: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  description: {
    type: Sequelize.STRING(200),
    allowNull: true
  },
  created_by: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  updated_by: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
}, 
{
  tableName: 'subservice',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
});

// SubService.belongsTo(Service, { foreignKey: "service_id" });
// Service.hasMany(SubService, { foreignKey: "service_id" });

module.exports = SubService