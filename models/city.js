  var dbSeq = require('../config/sequelize')
  var Sequelize = require('sequelize')  
  var Province = require('./province')

  const City = dbSeq.define('city', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    province_id: {
      type: Sequelize.INTEGER,      
      references: {
        model: 'province',
        key: 'id'
      } 
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'city',
    freezeTableName: true,
    timestamps: true,
    paranoid: false,
    underscored: true
  });
  
  City.belongsTo(Province, { foreignKey: "province_id" });
  Province.hasMany(City, { foreignKey: "province_id" });

  module.exports = City

