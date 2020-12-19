var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')
var Payment = require('./payment')

const PaymentDetail = dbSeq.define('payment_detail', {
  id: {
    type: Sequelize.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  payment_id: {
    type: Sequelize.BIGINT,
    allowNull: false,
    references: {
      model: 'payment',
      key: 'id'
    }
  },
  payment_type_code: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  payment_order_id: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  pg_code: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  // payment_channel_code: {
  //   type: Sequelize.STRING(50),
  //   allowNull: false
  // },
  method_code: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  bank: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  payment_amount: {
    type: Sequelize.DECIMAL(18, 2),
    allowNull: true
  },
  payment_date: {
    type: Sequelize.DATE,
    allowNull: true
  },
  payment_type: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  payment_time_limit: {
    type: Sequelize.DATE,
    allowNull: true
  },
  status_code: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  is_refund: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  refund_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  token: {
    type: Sequelize.STRING(500),
    allowNull: true
  },
  redirect_url: {
    type: Sequelize.STRING(500),
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
  tableName: 'payment_detail',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
  classMethods: {
    associate: function (models) {
      PaymentDetail.belongsTo(models.Payment, {
        foreignKey: {
          allowNull: false
        }
      }
      )
    },
  },
});

module.exports = PaymentDetail

