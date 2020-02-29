var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

const PartnerCertificate = dbSeq.define('partner_certificate', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  organizer: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  certificate_date: {
    type: Sequelize.DATE,
    allowNull: true
  },
  description: {
    type: Sequelize.STRING(200),
    allowNull: true
  },
  location: {
    type: Sequelize.STRING(200),
    allowNull: true
  },
  image_url: {
    type: Sequelize.STRING(200),
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
  tableName: 'partner_certificate',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = PartnerCertificate

