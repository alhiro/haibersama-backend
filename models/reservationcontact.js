var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

const ReservationContact = dbSeq.define('reservation_contact', {
  id: {
    type: Sequelize.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  reservation_id: {
    type: Sequelize.STRING(20),
    allowNull: false,
    references: {
      model: 'Reservation',
      key: 'id'
    }
  },
  name: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  address: {
    type: Sequelize.STRING(500),
    allowNull: false
  },
  phone_no: {
    type: Sequelize.STRING(20),
    allowNull: false
  },
  wa_no: {
    type: Sequelize.STRING(20),
    allowNull: false
  },
  email: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  social_media: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  other_description: {
    type: Sequelize.STRING(500),
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
  tableName: 'reservation_contact',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = ReservationContact

