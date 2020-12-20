var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

var PaymentDetail = require('./paymentdetail')
// var PaymentStatusHistory = require('./paymentstatushistory')

const Payment = dbSeq.define('payment', {
  id: {
    type: Sequelize.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  reservation_no: {
    type: Sequelize.STRING(20),allowNull: false,
    references: {
      model: 'reservation',
      key: 'reservation_no'
    }
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
  total_payment_fee: {
    type: Sequelize.DECIMAL(18, 2),
    allowNull: true
  },
  // payment_channel_code: {
  //   type: Sequelize.STRING(50),
  //   allowNull: true
  // },
  // payment_time_limit: {
  //   type: Sequelize.DATE,
  //   allowNull: true
  // },
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
  tableName: 'payment',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
  classMethods: {
    associate: function (models) {
      Payment.hasMany(models.PaymentDetail, {foreignKey: 'payment_id', as: 'payment_detail'})//,
      //Payment.hasMany(models.PaymentStatusHistory, {foreignKey: 'payment_id', as: 'payment_status_histories'})
    },
  },
});

Payment.hasMany(PaymentDetail, {foreignKey: 'payment_id', as: 'payment_detail'});
// Payment.hasMany(PaymentStatusHistory, {foreignKey: 'payment_id', as: 'payment_status_histories'});

PaymentDetail.belongsTo(Payment);
// PaymentStatusHistory.belongsTo(Payment);

module.exports = Payment

