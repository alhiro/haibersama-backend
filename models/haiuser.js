var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var PartnerCategory = require('./partnerCategory')

const HaiUser = dbSeq.define('hai_user', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  name: {
    type: Sequelize.STRING(200),
    allowNull: true
  },
  picture: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  given_name: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  family_name: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  phone_number: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  active: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  token: {
    type: Sequelize.STRING,
    allowNull: false
  },
  address: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  nation: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  dob: {
    type: Sequelize.DATE,
    allowNull: true
  },
  province: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  city: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  postalcode: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  type: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: '1'
  },
  title: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  description: {
    type: Sequelize.STRING(200),
    allowNull: true
  },
  longitude: {
    type: Sequelize.DECIMAL(11,8),
    allowNull: true
  },
  latitude: {
    type: Sequelize.DECIMAL(11,8),
    allowNull: true
  },  
  whatsapp_number: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  last_login: {
    type: Sequelize.DATE,
    allowNull: true
  },
  refresh_token: {
    type: Sequelize.STRING,
    allowNull: true
  },
  verified_document: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  is_verified: {
    type: Sequelize.BOOLEAN,
    allowNull: true
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
  tableName: 'hai_user',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
  //defaultScope: { attributes: { exclude: ['password'] },},
});

HaiUser.hasMany(PartnerCategory, {foreignKey: 'partner_id'})
PartnerCategory.belongsTo(HaiUser, {foreignKey: 'partner_id'});

module.exports = HaiUser

