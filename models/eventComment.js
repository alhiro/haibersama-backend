const Sequelize = require('sequelize');
const dbSeq = require('../config/sequelize');
const HaiUser = require('./haiuser');
const Event = require('./event');

const EventComment = dbSeq.define('event_comment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  event_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'event',
      key: 'id'
    }
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'hai_user',
      key: 'id'
    }
  },
  parent_comment_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'event_comment',
      key: 'id'
    }
  },
  user_name: {
    type: Sequelize.STRING(100),
    allowNull: true
  },
  comment: {
    type: Sequelize.STRING(500),
    allowNull: false
  },
  comment_date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
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
}, {
  tableName: 'event_comment',
  freezeTableName: true,
  timestamps: true,
  paranoid: false,
  underscored: true
});

EventComment.belongsTo(Event, { foreignKey: 'event_id' });
Event.hasMany(EventComment, { foreignKey: 'event_id' });

EventComment.belongsTo(HaiUser, { foreignKey: 'user_id' });
HaiUser.hasMany(EventComment, { foreignKey: 'user_id' });

EventComment.hasMany(EventComment, {
  as: 'replies',
  foreignKey: 'parent_comment_id'
});
EventComment.belongsTo(EventComment, {
  as: 'parent',
  foreignKey: 'parent_comment_id'
});

module.exports = EventComment;
