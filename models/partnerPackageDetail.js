var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var SubService = require('./subservice')

const PartnerPackageDetail = dbSeq.define('partner_package_detail', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  package_header_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'partner_package_header',
      key: 'id'
    }
  },
  // di remark sementara karna d table gad fieldnya
  // category_id: {
  //   type: Sequelize.INTEGER,
  //   allowNull: false,
  //   primaryKey: true,
  //   references: {
  //     model: 'category',
  //     key: 'id'
  //   }
  // },
  subservice_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'subservice',
      key: 'id'
    }
  },
  price: {
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
  additional_services: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  terms: {
    type: Sequelize.STRING(300),
    allowNull: false
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
  tableName: 'partner_package_detail',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
});

PartnerPackageDetail.belongsTo(SubService, { foreignKey: "subservice_id" });

module.exports = PartnerPackageDetail

