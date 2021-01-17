var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

var ReservationContact = require('./reservationcontact')
var ReservationService = require('./reservationservice')
var ReservationStatusHistory = require('./reservationstatushistory')

const Reservation = dbSeq.define('reservation', {
  id: {
    type: Sequelize.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  reservation_no: {
    type: Sequelize.STRING(20),
    allowNull: false,
    unique: true
  },
  reservation_date:{
    type: Sequelize.DATE,
    allowNull: false
  },
  reservation_type:{
    type: Sequelize.STRING(20),
    allowNull: false
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  partner_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  category_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  package_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  service_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  event_date:{
    type: Sequelize.DATE,
    allowNull: false
  },
  event_time:{
    type: Sequelize.TIME,
    allowNull: false
  },
  duration:{
    type: Sequelize.INTEGER,
    allowNull: false
  },
  event_address: {
    type: Sequelize.STRING(500),
    allowNull: false
  },
  total_price: {
    type: Sequelize.DECIMAL(18, 2),
    allowNull: false
  },
  total_discount: {
    type: Sequelize.DECIMAL(18, 2),
    allowNull: true
  },
  total_payment: {
    type: Sequelize.DECIMAL(18, 2),
    allowNull: true
  },
  status_code: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  transaction_status_code: {
    type: Sequelize.STRING(50),
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
  tableName: 'reservation',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
  classMethods: {
    associate: function (models) {
      Reservation.hasOne(models.ReservationContact, {foreignKey: 'reservation_id', as: 'reservation_contact'}),
      Reservation.hasMany(models.ReservationService, {foreignKey: 'reservation_id', as: 'reservation_services'}),
      Reservation.hasMany(models.ReservationStatusHistory, {foreignKey: 'reservation_id', as: 'reservation_status_histories'})
    },
  },
});

Reservation.hasOne(ReservationContact, {foreignKey: 'reservation_id', as: 'reservation_contact'});
Reservation.hasMany(ReservationService, {foreignKey: 'reservation_id', as: 'reservation_services'});
Reservation.hasMany(ReservationStatusHistory, {foreignKey: 'reservation_id', as: 'reservation_status_histories'});

// ReservationContact.belongsTo(Reservation, {foreignKey: 'reservation_id'});
// ReservationService.belongsTo(Reservation, {foreignKey: 'reservation_id'});
// ReservationStatusHistory.belongsTo(Reservation, {foreignKey: 'reservation_id'});

ReservationContact.belongsTo(Reservation);
ReservationService.belongsTo(Reservation);
ReservationStatusHistory.belongsTo(Reservation);

module.exports = Reservation

