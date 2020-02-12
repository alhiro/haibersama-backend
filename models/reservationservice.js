var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

const ReservationService = dbSeq.define('reservation_service', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  reservation_no: {
    type: Sequelize.STRING(20),
    allowNull: false,
    references: {
      model: 'Reservation',
      key: 'id'
    }
  },
  service_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  sub_service_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING(500),
    allowNull: false
  },
  price: {
    type: Sequelize.DECIMAL(18,2),
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
  tableName: 'reservation_service',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

module.exports = ReservationService

