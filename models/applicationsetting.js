var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

const applicationSetting = dbSeq.define('application_setting', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  setting_name: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  setting_value: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  remark: {
    type: Sequelize.STRING(5000),
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
  tableName: 'application_setting',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = applicationSetting