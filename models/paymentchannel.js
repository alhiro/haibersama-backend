var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

const PaymentChannel = dbSeq.define('payment_channel', {
  id: {
    type: Sequelize.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  payment_channel_code: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  description: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  pg_code: {
    type: Sequelize.STRING(10),
    allowNull: true
  },
  method_code: {
    type: Sequelize.STRING(10),
    allowNull: false
  },
  bank_code: {
    type: Sequelize.STRING(10),
    allowNull: false
  },
  bank_name: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  account_no: {
    type: Sequelize.STRING(20),
    allowNull: false
  },
  account_name: {
    type: Sequelize.STRING(100),
    allowNull: false
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
  tableName: 'payment_channel',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
});

module.exports = PaymentChannel

