const Event = require('../models/event');
const sequelize = require("../config/sequelize");
const Sequelize = require('sequelize')

module.exports =
  {        
    getAll: async () => {
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
                ["created_at", "ASC"]
            ]
        });
      } catch (error) {
        throw error
      }
    },

    find: async (params) => {
      return await Event.findOne({ where: params })
        .then((value) => {
          return (!value) ? { success: false, message: "Event Belum Ada!", data: {} } : { success: true, message: "Event Ditemukan", data: value }
        })
        .catch((err) => { return { success: false, message: "Event Belum Ada, Ada Kesalahan Server!", data: err } });
    },

    findAll: async (params) => {
      try {
        return await Event.findAll({
          where: {
            partner_id : JSON.stringify(params) 
          },
          order: [["created_at", "ASC"]],
        });
      } catch (error) {
        throw error;
      }
    },

    search: async (params) => {
      try {
        // search any word in table event column title with %foo%
        return await Event.findAll({
          where: {
            title :  { [Sequelize.Op.like]: `%${params.title}%` },
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
          created_by: created_by
        }
        const insertEvent = await Event.findOrCreate({ where: params, defaults: object })
  
        // check title already registered or not
        if (!insertEvent[1]) {
          throw ({ success: false, message: "Event Dengan Nama Yang Sama Sudah Ada", data: {} })
        }
        
        return { success: true, message: "Event Berhasil Dibuat", data: insertEvent[0].dataValues }
      } catch (error) {
        console.log(error);
        throw (error)
      }
    },

    update: async (params, req) => {
        try {
          const { id, partner_id, title, description, image_url, link_url, event_date, order_no, active, ticket, approval, updated_by } = req

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
            updated_by: updated_by
          }
          console.log(JSON.stringify(object), "object event")

          return Event.update(object,{where: params} )
          .then(async (updated) => { 
              const upService = await Event.findOne({ where: { id: id } })
              console.log(JSON.stringify(upService), "upService")
              return { success: true, message: "Event Berhasil Diubah", data: upService } })
          .catch((err) => { return { success: false, message: "Event Gagal Diubah", data: err } });
        } catch (error) {
          throw (error)
        }
      },
  }
