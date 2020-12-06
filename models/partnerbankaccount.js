var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const partnerBankAccount = dbSeq.define('partner_bank_account', {
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
  bank_code: {
    type: Sequelize.STRING(10),
    allowNull: false
  },
  bank_name: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  account_no: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  account_name: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  is_active: {
    type: Sequelize.BOOLEAN,
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
  tableName: 'partner_bank_account',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = partnerBankAccount

partnerBankAccount.belongsTo(HaiUser, { foreignKey: "partner_id" });