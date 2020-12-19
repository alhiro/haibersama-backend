var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const InfoCode = dbSeq.define('info_code', {
  code: {
    type: Sequelize.STRING,
    allowNull: false,
    // unique: true,
    primaryKey: true,
    autoIncrement: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // description_alias: {
  //   type: Sequelize.STRING,
  //   allowNull: true
  // },
  code_type: {
    type: Sequelize.STRING,
    allowNull: false,
    // unique: true,
    primaryKey: true,
  },
  type_description: {
    type: Sequelize.STRING,
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
    indexes: [
        {
            unique: true,
            fields: ['code', 'code_type']
        }
    ]
},
{
  tableName: 'info_code',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = InfoCode
