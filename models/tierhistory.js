var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')
var tiersetting = require('./tiersetting')

const tierHistory = dbSeq.define('tier_history', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'hai_user',
      key: 'id'
    }
  },
  tier_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'tier_setting',
      key: 'id'
    }
  },
  tier_name: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  start_date: {
    type: Sequelize.DATE,
    allowNull: false
  },
  end_date: {
    type: Sequelize.DATE,
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
  tableName: 'tier_history',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = tierHistory

tierHistory.belongsTo(HaiUser, { foreignKey: "user_id" });
tierHistory.belongsTo(HaiUser, { foreignKey: "tier_id" });