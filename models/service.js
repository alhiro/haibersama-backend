var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

const Service = dbSeq.define('service', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  description: {
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
  tableName: 'service',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
});

module.exports = Service