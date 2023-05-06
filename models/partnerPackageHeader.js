var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var Category = require('./category')
var PartnerPackageDetail = require('./partnerPackageDetail')
var Service = require('./service')
var HaiUser = require('./haiuser')

const PartnerPackageHeader = dbSeq.define('partner_package_header', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    unique: true
  },
  name: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  category_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'category',
      key: 'id'
    }
  },
  service_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'service',
      key: 'id'
    }
  },
  totalprice: {
    type: Sequelize.DECIMAL,
    allowNull: true
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING(500),
    allowNull: false
  },
  additional_services: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  terms: {
    type: Sequelize.STRING(5000),
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

PartnerPackageHeader.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(PartnerPackageHeader, { foreignKey: "partner_id" });

PartnerPackageHeader.belongsTo(Category, {foreignKey: 'category_id'})
PartnerPackageHeader.belongsTo(Service, {foreignKey: 'service_id'});

PartnerPackageHeader.hasMany(PartnerPackageDetail, {foreignKey: 'package_header_id'})
PartnerPackageDetail.belongsTo(PartnerPackageHeader, {foreignKey: 'package_header_id'});

module.exports = PartnerPackageHeader

