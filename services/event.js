const Event = require('../models/event');
const EventComment = require('../models/eventComment');
const sequelize = require("../config/sequelize");
const Sequelize = require('sequelize');
const auth = require("../services/haiuser");
const { findAndCountAll } = require('sequelize/lib/model');
const Sequelizes = require('sequelize');
const { includes } = require('lodash');

module.exports =
  {       
    getListSelayang: async (params, res) => {
      const Op = Sequelizes.Op;

      const { page, limit, search, startDate, endDate} = params;
      console.log(params);

      const partner_id = res.locals.auth.id;
  
      let paramsFilter = {};

      if (search && search.trim() !== '') {
        paramsFilter = {
          ...paramsFilter,
          title: {
            [Op.iLike]: `%${search}%`
          }
        };
      }

      if (startDate && endDate) {
        paramsFilter.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      } else if (startDate) {
        paramsFilter.created_at = {
          [Op.gte]: new Date(startDate),
        };
      } else if (endDate) {
        paramsFilter.created_at = {
          [Op.lte]: new Date(endDate),
        };
      }

      console.log("paramsFilter all")
      console.log(paramsFilter)
      
      try {
        return await Event.findAndCountAll({
          where: paramsFilter,
          attributes: {
            include: [
              [
                Sequelize.literal(`(
                  SELECT COUNT(*) 
                  FROM event_comment AS ec 
                  WHERE ec.event_id = event.id
                    AND ec.parent_comment_id IS NULL
                )`),
                'total_comments'
              ],
              [
                Sequelize.literal(`(
                  CASE 
                    WHEN event.partner_id = ${partner_id} THEN true
                    ELSE false
                  END
                )`),
                'owner'
              ]
            ]
          },
          order: [
            ["created_at", "DESC"]
          ],
          limit: parseInt(limit),
          offset: (parseInt(page) - 1) * parseInt(limit),
          distinct: true,
        }).then((resp) => {
          console.log("resp");
          console.log(Math.ceil(resp.count / limit));
          // console.log(resp);
  
          return {
            success: true,
            message: resp.rows.length > 0
              ? "Semua data selayang berhasil diambil!"
              : "Data selayang kosong!",
            data: resp.rows,
            page: parseInt(page),
            count: Math.ceil(resp.count / limit),
            length: resp.count
          };
        });
      } catch (error) {
        console.error("Error getListSelayang:", error);
        throw error
      }
    },

    findListSelayangPartner: async (partner_id, params) => {
      const Op = Sequelizes.Op;

      const { page, limit, search, startDate, endDate} = params;
      console.log(params);
  
      let paramsFilter = {};

      if (search && search.trim() !== '') {
        paramsFilter = {
          ...paramsFilter,
          title: {
            [Op.iLike]: `%${search}%`
          }
        };
      }

      if (startDate && endDate) {
        paramsFilter.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      } else if (startDate) {
        paramsFilter.created_at = {
          [Op.gte]: new Date(startDate),
        };
      } else if (endDate) {
        paramsFilter.created_at = {
          [Op.lte]: new Date(endDate),
        };
      }

      paramsFilter.partner_id = partner_id;
      console.log("paramsFilter own")
      console.log(paramsFilter)
  
      try {
        return await Event.findAndCountAll({
          where: paramsFilter,
          attributes: {
            include: [
              [
                Sequelize.literal(`(
                  SELECT COUNT(*) 
                  FROM event_comment AS ec 
                  WHERE ec.event_id = event.id
                    AND ec.parent_comment_id IS NULL
                )`),
                'total_comments'
              ],
              [
                Sequelize.literal(`(
                  CASE 
                    WHEN event.partner_id = ${partner_id} THEN true
                    ELSE false
                  END
                )`),
                'owner'
              ]
            ]
          },
          order: [
            ["created_at", "DESC"]
          ],
          limit: parseInt(limit),
          offset: (parseInt(page) - 1) * parseInt(limit),
          distinct: true,
        }).then((resp) => {
          console.log("resp");
          console.log(Math.ceil(resp.count / limit));
          // console.log(resp);
  
          return {
            success: true,
            message: resp.rows.length > 0
              ? "Semua data selayang berhasil diambil!"
              : "Data selayang kosong!",
            data: resp.rows,
            page: parseInt(page),
            count: Math.ceil(resp.count / limit),
            length: resp.count
          };
        });
      } catch (error) {
        console.error("Error getListSelayang:", error);
        throw error
      }
    },

    getAllPublic: async () => {
      try {
        return await Event.findAll({
            where:{
                approval : true
            },
            // attributes: ['id',
            //             'title',
            //             'description',
            //             'image_url'
            // ],
            order:[
                ["created_at", "DESC"]
            ]
        });
      } catch (error) {
        throw error
      }
    },

    getAll: async () => {
      try {
        return await Event.findAll({
            // attributes: ['id',
            //             'title',
            //             'description',
            //             'image_url'
            // ],
            order:[
                ["created_at", "DESC"]
            ]
        });
      } catch (error) {
        throw error
      }
    },

    find: async (params, res) => {
      const partner_id = res.locals.auth.id;
      console.log("get id");

      try {
        return await Event.findOne({ 
          where: params,
          attributes: {
            include: [
              [
                Sequelize.literal(`(
                  SELECT COUNT(*) 
                  FROM event_comment AS ec 
                  WHERE ec.event_id = event.id
                    AND ec.parent_comment_id IS NULL
                )`),
                'total_comments'
              ],
              [
                Sequelize.literal(`(
                  CASE 
                    WHEN event.partner_id = ${partner_id} THEN true
                    ELSE false
                  END
                )`),
                'owner'
              ]
            ]
          },
        })
          .then((value) => {
            return (!value) ? { success: false, message: "Event Belum Ada!", data: {} } : { success: true, message: "Event Ditemukan", data: value }
          })
          .catch((err) => { return { success: false, message: "Event Belum Ada, Ada Kesalahan Server!", data: err } });
      } catch (error) {
        console.log(error)
        throw error
      }
    },

    search: async (params) => {
      const Op = Sequelize.Op;

      try {
        // search multi word in table event column title with %foo%
        return await Event.findAll({
          where: {
            [Op.or]: [
              {title :  { [Sequelize.Op.iLike]: `%${params.title}%` }}, 
              {description :  { [Sequelize.Op.iLike]: `%${params.description}%` }}, 
            ]
          },
          order: [["created_at", "ASC"]],
        });
      } catch (error) {
        console.log(error);
        throw error
      }
    },

    findOrCreate: async (params, req) => {
      try {
        const { partner_id, title, description, image_url, link_url, event_date, order_no, active, ticket, approval, created_by} = req

        if (!title || title.trim() === "" || !description || description.trim() === "") {
          return {
            code: 400,
            success: false,
            message: "Title dan deskripsi tidak boleh kosong.",
            data: {}
          };
        }

        var idUser = partner_id;
        var usersDetail = await auth.findUser({ id: idUser });
        const getname = usersDetail.data.name;
        console.log(JSON.stringify("data user own"), usersDetail.data.name);

        if (!getname) {
          return { success: false, message: "Ada kesalahan. Silahkan ulangi kembali", data: {} };
        }

        var object = {
          partner_id: partner_id,
          title: title,
          description: description,
          image_url: image_url,
          link_url: link_url,
          event_date: event_date == null || event_date == "" ? "0" : event_date, 
          ticket: ticket,
          approval: approval == 1 ? true : false,
          order_no: order_no,
          active: active == 1 ? true : false,
          created_by: getname
        }
        const insertEvent = await Event.findOrCreate({ where: params, defaults: object })
  
        // check title already registered or not
        // if (!insertEvent[1]) {
        //   throw ({ success: false, message: "Selayang Dengan Nama Yang Sama Sudah Ada", data: {} })
        // }
        
        return { success: true, message: "Selayang Berhasil Dibuat", data: insertEvent[0].dataValues }
      } catch (error) {
        console.log(error);
        throw (error)
      }
    },

    update: async (data, req, params, findEvent) => {
        try {
          const { id, partner_id, title, description, image_url, link_url, event_date, order_no, active, ticket, approval, updated_by } = data
          console.log(data);
          console.log(findEvent);

          // var idUser = partner_id;
          // var usersDetail = await auth.findUser({ id: idUser });
          // const getname = usersDetail.data.name;
          // console.log(JSON.stringify("data user own event"), usersDetail.data.name);
  
          // if (!getname) {
          //   return { success: false, message: "User tidak bisa update event. Silahkan ulangi kembali", data: {} };
          // }

          // ✅ Cek apakah user ini pemiliknya
          if (findEvent.partner_id !== partner_id) {
            return { success: false, message: 'Unauthorized: You are not the owner of this event', data: {} };
          }

          var object = {
            // partner_id: partner_id,
            title: title,
            description: description, 
            image_url: image_url != undefined ? image_url : null,
            link_url: link_url,
            event_date: event_date == null || event_date == "" ? "0" : event_date, 
            ticket: ticket,
            approval: approval,
            order_no: order_no,
            active: active == 1 ? true : false,
            updated_by: updated_by
          }
          console.log(JSON.stringify(object), "object event")

          return Event.update(object,{where: params} )  
            .then(async (updated) => { 
              const upService = await Event.findOne({ 
                where: { id: id, partner_id: partner_id },
                attributes: {
                  include: [
                    [
                      Sequelize.literal(`(
                        SELECT COUNT(*) 
                        FROM event_comment AS ec 
                        WHERE ec.event_id = event.id
                          AND ec.parent_comment_id IS NULL
                      )`),
                      'total_comments'
                    ],
                    [
                      Sequelize.literal(`(
                        CASE 
                          WHEN event.partner_id = ${partner_id} THEN true
                          ELSE false
                        END
                      )`),
                      'owner'
                    ]
                  ]
                }
              });
            
              console.log("upService")
              console.log(upService)
              return { success: true, message: "Event Berhasil Diubah", data: upService ? upService.get({ plain: true }) : {}  } })
          .catch((err) => { return { success: false, message: "Event Gagal Diubah", data: err } });
        } catch (error) {
          throw (error)
        }
      },

      delete: async (data) => {
        try {
          const { partner_id, id } = data;
  
          return Event.destroy({
            where: {
              id: id,
              partner_id: partner_id
            },
          })
            .then(async (deleted) => {
              return { success: true, message: "Event Berhasil Dihapus", data: [] }
            })
            .catch((err) => {
              console.log(err);
              return { success: false, message: "Event Gagal Dihapus", data: err }
            });
        } catch (error) {
          console.log(error);
          throw (error)
        }
      },
  }
