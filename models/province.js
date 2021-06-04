var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

const Province = dbSeq.define('province', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
},
{
  tableName: 'province',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = Province