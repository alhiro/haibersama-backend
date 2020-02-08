var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var category = require('./category')
var Service = require('./service')

const PartnerPackageHeader = dbSeq.define('partner_package_header', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  category_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'category',
      key: 'Id'
    }
  },
  service_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'service',
      key: 'Id'
    }
  },
  totalprice: {
    type: Sequelize.DECIMAL,
    allowNull: true
  },
  description: {
    type: Sequelize.STRING(200),
    allowNull: false
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  additonal_services: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  terms: {
    type: Sequelize.STRING(300),
    allowNull: false
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: true
  },
  created_by: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: true
  },
  updated_by: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
}, 
{
  tableName: 'partner_package_header',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
});

PartnerPackageHeader.hasMany(Category, {foreignKey: 'category_id'})
PartnerPackageHeader.hasMany(Service, {foreignKey: 'service_id'});
//Inventory.belongsTo(Uom, {foreignKey: 'uomid'})

module.exports = PartnerPackageHeader

