var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const partnerWalletHistory = dbSeq.define('partner_wallet_history', {
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
  transaction_no: {
    type: Sequelize.STRING(30),
    allowNull: false
  },
  transaction_date: {
    type: Sequelize.DATE,
    allowNull: false
  },
  transaction_type: {
    type: Sequelize.STRING(10),
    allowNull: false
  },
  reservation_type:{
    type: Sequelize.STRING(20),
    allowNull: true
  },
  reservation_no: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  total_amount: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  status: {
    type: Sequelize.STRING(50),
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
  tableName: 'partner_wallet_history',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = partnerWalletHistory

partnerWalletHistory.belongsTo(HaiUser, { foreignKey: "partner_id" });