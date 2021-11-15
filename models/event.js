var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const Event = dbSeq.define('event', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  description: {
    type: Sequelize.STRING(500),
    allowNull: true
  },
  image_url: {
    type: Sequelize.STRING(500),
    allowNull: false
  },
  link_url: {
    type: Sequelize.STRING(500),
    allowNull: true
  },
  ticket: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  event_date: {
    type: Sequelize.DATE,
    allowNull: true
  },
  approval: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  order_no: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  active: {
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
  },
}, 
{
  tableName: 'event',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

Event.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(Event, { foreignKey: "partner_id" });

module.exports = Event

