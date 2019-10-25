var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

const PartnerExperience = dbSeq.define('partner_experience', {
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
  company_name: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  period_from: {
    type: Sequelize.DATE,
    allowNull: true
  },
  period_to: {
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
  tableName: 'partner_experience',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = PartnerExperience

