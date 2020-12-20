var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

const ReservationStatusHistory = dbSeq.define('reservation_status_history', {
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
      model: 'reservation',
      key: 'id'
    }
  },
  status_code: {
    type: Sequelize.STRING(50),
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
  tableName: 'reservation_status_history',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
  classMethods: {
    associate: function (models) {
      ReservationStatusHistory.belongsTo(models.Reservation, {
        foreignKey: {
          allowNull: false
        }
      }
      )
    },
  },
});

module.exports = ReservationStatusHistory

