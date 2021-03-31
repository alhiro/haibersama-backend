var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const partnerAwards = dbSeq.define('partner_awards', {
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
  organizer: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  awards_date: {
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
  occupation: {
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
  }
}, 
{
  tableName: 'partner_awards',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = partnerAwards

partnerAwards.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(partnerAwards, { foreignKey: "partner_id" });