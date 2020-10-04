var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const PartnerRating = dbSeq.define('partner_rating', {
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
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  reservation_id: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  rating: {
    type: Sequelize.INTEGER,
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
  }
}, 
{
  tableName: 'partner_rating',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = PartnerRating

PartnerRating.belongsTo(HaiUser, { foreignKey: "partner_id" });
