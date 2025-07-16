const EventComment = require("../models/eventComment");
const HaiUser = require("../models/haiuser");
const Sequelize = require('sequelize');

module.exports = {
  getById: async (id) => {
    try {
      const comment = await EventComment.findByPk(id, {
        include: [{ association: "replies" }]
      });
      if (!comment) return { success: false, message: "Komentar tidak ditemukan", data: {} };
      return { success: true, message: "Komentar ditemukan", data: comment };
    } catch (error) {
      throw error
    }
  },

  getAllByEvent: async (params) => {
    try {
      const { page, limit, event_id, parent_comment_id} = params;
      console.log(params);

      return await EventComment.findAndCountAll({
        where: { 
          event_id: event_id, 
          parent_comment_id:
          parent_comment_id === undefined || parent_comment_id === 'null'
            ? null
            : parent_comment_id,
        },
        include: [
          // {
          //   association: "replies",
          //   required: false,
          //   separate: true,
          //   order: [["comment_date", "DESC"]],
          // },
          {
            model: HaiUser,
            attributes: ['id', 'name', 'picture'],
            required: false
          }
        ],
        order: [["comment_date", "DESC"]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        distinct: true,
      }).then(async (resp) => {
        // Hitung total replies per comment_id
        const commentIds = resp.rows.map(c => c.id);

        const repliesCounts = await EventComment.findAll({
          attributes: [
            'parent_comment_id',
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'reply_count']
          ],
          where: {
            parent_comment_id: commentIds
          },
          group: ['parent_comment_id']
        });

        // Convert ke Map {parent_comment_id: reply_count}
        const replyCountMap = {};
        repliesCounts.forEach(r => {
          replyCountMap[r.parent_comment_id] = parseInt(r.dataValues.reply_count);
        });

        // Inject count ke masing-masing comment
        const commentsWithReplyCount = resp.rows.map(c => {
          return {
            ...c.toJSON(),
            replies_count: replyCountMap[c.id] || 0
          };
        });

        const responseMessage = parent_comment_id === undefined || parent_comment_id === 'null'
          ? (resp.rows.length > 0 ? "Semua komentar selayang berhasil diambil!" : "Data komen selayang kosong!")
          : (resp.rows.length > 0 ? "Semua balasan komentar selayang berhasil diambil!" : "Data komen balasan selayang kosong!");
          
        return {
          success: true,
          message: responseMessage,
          data: commentsWithReplyCount,
          page: parseInt(page),
          pageCount: Math.ceil(resp.count / limit),
          length: resp.count
        };
      });
    } catch (error) {
      throw error
    }
  },

  addComment: async (payload, res) => {
    try {
      const created = await EventComment.create({
        event_id: payload.event_id,
        user_id: res.locals.auth.id,
        user_name: res.locals.auth.name,
        comment: payload.comment,
        parent_comment_id: payload.parent_comment_id || null,
        comment_date: new Date(),
        created_by: res.locals.auth.email || "system",
        created_at: new Date(),
      });
      console.log(created);
      return { success: true, message: "Komentar ditambahkan", data: created };
    } catch (error) {
      throw error
    }
  },

  editComment: async (payload, res) => {
    try {
      console.log("payload")
      console.log(payload);

      // Pastikan comment milik user ini
      const commentRecord = await EventComment.findOne({
        where: {
          id: payload.id,
          user_id: res.locals.auth.id
        }
      });

      console.log(commentRecord);
  
      if (!commentRecord) {
        return {
          success: false,
          message: "Komentar tidak ditemukan atau bukan milik Anda!",
          data: {}
        };
      }
  
      commentRecord.comment = payload.comment;
      commentRecord.updated_at = new Date();
      await commentRecord.save();
  
      return {
        success: true,
        message: "Komentar berhasil diperbarui",
        data: commentRecord
      };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: "Gagal mengupdate komentar",
        data: err
      };
    }
  },
  
  deleteComment: async (payload, res) => {
    try {
      console.log(payload);
      const comment = await EventComment.findByPk(payload.id);
  
      if (!comment) {
        return {
          success: false,
          message: "Komentar tidak ditemukan",
          data: {}
        };
      }
    
      // Cek apakah komentar ini milik user yang sedang login
      if (comment.user_id !== res.locals.auth.id) {
        return {
          success: false,
          message: "Kamu tidak memiliki izin untuk menghapus komentar ini",
          data: {}
        };
      }
    
      await comment.destroy();
    
      return {
        success: true,
        message: "Komentar berhasil dihapus",
        data: {}
      };
    } catch (error) {
      throw error
    }
  },

  deleteCommentUser: async (id) => {
    try {
      const comment = await EventComment.findByPk(id);
      if (!comment) return { success: false, message: "Komentar tidak ditemukan", data: {} };

      await comment.destroy();
      return { success: true, message: "Komentar berhasil dihapus", data: {} };
    } catch (error) {
      throw error
    }
  }
  
};
