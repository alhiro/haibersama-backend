var dbSeq = require('../config/sequelize')
var Sequelize = require('sequelize')

var PartnerPackageHeader = require('./partnerPackageHeader')
var HaiUser = require('./haiuser')

const ShareLink = dbSeq.define('share_links', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  share_by_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'hai_user',
      key: 'id'
    }
  },
  package_header_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'partner_package_header',
      key: 'id'
    }
  },
  share_code: {
    type: Sequelize.STRING(20),
    allowNull: false,
    unique: true,
  },
  created_by: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  updated_by: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
}, 
{
  tableName: 'share_links',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true,
});

// PartnerPackageHeader ↔ HaiUser (owner paket)
PartnerPackageHeader.belongsTo(HaiUser, { foreignKey: "partner_id" });
HaiUser.hasMany(PartnerPackageHeader, { foreignKey: "partner_id" });

// ShareLink ↔ PartnerPackageHeader (paket yang dishare)
ShareLink.belongsTo(PartnerPackageHeader, {foreignKey: 'package_header_id'});
PartnerPackageHeader.hasMany(ShareLink, {foreignKey: 'package_header_id'})

// ShareLink ↔ HaiUser (siapa yang share link)
ShareLink.belongsTo(HaiUser, { foreignKey: "share_by_id" });
HaiUser.hasMany(ShareLink, { foreignKey: "share_by_id" });

module.exports = ShareLink