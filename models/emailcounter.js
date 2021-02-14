var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

const EmailCounter = dbSeq.define('email_counter', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  reservation_no: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  status_code: {
    type: Sequelize.STRING(500),
    allowNull: false
  },
  counter: {
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
  },
}, 
{
  tableName: 'email_counter',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = EmailCounter

