var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

const Partner = dbSeq.define('partner', {
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
  title: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  description: {
    type: Sequelize.STRING(200),
    allowNull: false
  },
  phone_no: {
    type: Sequelize.STRING(20),
    allowNull: false
  },
  email: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  address: {
    type: Sequelize.STRING(300),
    allowNull: false
  },
  nation: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  longitude: {
    type: Sequelize.DECIMAL(11,8),
    allowNull: true
  },
  latitude: {
    type: Sequelize.DECIMAL(11,8),
    allowNull: true
  },
  profile_image: {
    type: Sequelize.STRING(300),
    allowNull: false
  },
  sms_verified: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  email_verified: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  active: {
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
  tableName: 'partner',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
});

module.exports = Partner

