var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var User = require('./haiuser')

const partnerPortfolio = dbSeq.define('partner_portfolio', {
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
    type: Sequelize.STRING(50),
    allowNull: true
  },
  category_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  portfolio_date: {
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
  tableName: 'partner_portfolio',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = partnerPortfolio

partnerPortfolio.belongsTo(User, { foreignKey: "partner_id" });