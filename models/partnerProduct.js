var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const PartnerProduct = dbSeq.define('partner_product', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'hai_user',
      key: 'id'
    }
  },
  name: {
    type: Sequelize.STRING(150),
    allowNull: false
  },
  sku: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  description: {
    type: Sequelize.STRING(1000),
    allowNull: true
  },
  status: {
    type: Sequelize.STRING(30),
    allowNull: false,
    defaultValue: 'Draft'
  },
  price: {
    type: Sequelize.DECIMAL,
    allowNull: true,
    defaultValue: 0
  },
  warehouse: {
    type: Sequelize.STRING(100),
    allowNull: true
  },
  production_batch: {
    type: Sequelize.STRING(100),
    allowNull: true
  },
  stock_quantity: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  unit: {
    type: Sequelize.STRING(30),
    allowNull: true,
    defaultValue: 'pcs'
  },
  supplier_name: {
    type: Sequelize.STRING(150),
    allowNull: true
  },
  inventory_note: {
    type: Sequelize.STRING(200),
    allowNull: true
  },
  has_photo: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  image_url: {
    type: Sequelize.STRING(500),
    allowNull: true
  },
  relations: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  flow_flags: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  public: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  active: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  tableName: 'partner_product',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

PartnerProduct.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(PartnerProduct, { foreignKey: "partner_id" });

module.exports = PartnerProduct
