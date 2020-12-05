var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

var Category = require('./category')

const Service = dbSeq.define('service', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'category',
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
  tableName: 'service',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
});

Service.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Service, { foreignKey: "category_id" });

//Service.belongsTo(PartnerPackageHeader, { foreignKey: 'uomid' })

module.exports = Service