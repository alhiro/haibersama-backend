const follower = require('../models/partnerFollower');
const user = require('../models/haiuser');

const sequelize = require("../config/sequelize");

module.exports =
  {        
    getAll: async () => {
      try {
        return await follower.findAll({
            // where:{
            //     user_id : 12
            // },
            order:[
              ["partner_id", "ASC"]
            ],
            include: [
              {
                model: user
              }
            ]
        });
      } catch (error) {
        throw error
      }
    },

    getById: async (res, limitItem, page) => {
      try {
        const user_id = res.locals.auth.id;

        // var queryFollower = await sequelize.query(
        //   `SELECT * FROM partner_follower part
        //     WHERE part.user_id = `+ user_id + `;`,
        //   {
        //     raw: true,
        //     type: sequelize.QueryTypes.SELECT,
        //     model: user,
        //     mapToModel: true,
        //     nest: true,
        //     raw: true,
        //   }
        // );

        // console.log('queryFollower');
        // console.log(queryFollower);

        // const qry = 'select count(*) from hai_user';

        var result = await follower.findAll({
          where: {
            user_id: user_id
          },
          order: [
            ["partner_id", "ASC"]
          ],
          include: [
            {
              model: user,
              attributes: [
                "id",
                "email",
                "name",
                "picture",
                "phone_number",
                "active",
                "address",
                "city",
                "title",
                "description",
                "is_verified",
                // [
                //   sequelize.literal(`(${queryFollower[0].user_id})`), 'counter',
                // ],
              ],
            }
          ]
        });

        const pageCount = Math.ceil(result.length / limitItem);
        let pages = parseInt(page);
        if (!pages) { pages }
        if (pages > pageCount) {
          pages = pageCount
        }

        if (result.length > 0) {
          return (!result) ? {
            success: false,
            message: "Follower Tidak Ditemukan",
            data: {},
            page: pages,
            pageCount: pageCount
          } : {
            success: true,
            message: "Follower Ditemukan",
            data: result.slice(pages * limitItem - limitItem, pages * limitItem),
            page: pages,
            pageCount: pageCount
          }
        } else {
          return { success: false, message: "Follower Tidak Ada", data: {}, page: pages, pageCount: pageCount }
        }
      } catch (error) {
        throw error
      }
    },

    findFollower: async (params) => {
      return await follower.findOne({ where: params })
        .then((follower) => {
          return (!follower) ? { success: false, message: "Follower No Data!", data: {} } : { success: true, message: "Follower Found", data: follower }
        })
        .catch((err) => { return { success: false, message: "Follower No Data, Something Wrong!", data: err } });
    },

    findOrCreateFollower: async (params, data) => {
      try {
        const { user_id, partner_id, is_delete, created_by } = data;
        var objData = {
          partner_id: partner_id,
          user_id: user_id,
          is_delete: is_delete == 1 ? true : false,
          created_by: created_by
        };

        console.log("data add follower");
        console.log(objData);

        const insertFollower = await follower.findOrCreate({ where: params, defaults: objData })
  
        // check name already registered or not
        if (!insertFollower[1]) {
          throw ({ success: false, message: "Follower Partner Exist! Add Another Partner To Follow", data: {} })
        }
        
        return { success: true, message: "Follower Success Added", data: insertFollower[0].dataValues }
      } catch (error) {
        throw (error)
      }
    },

    updateFollower: async (params, req) => {
        try {
          const { name, description, id, active, order_no } = req.body

          var objFollower = {
            name: name,
            description: description, 
            order_no: order_no,
            active: active == 1 ? true : false
          }
          console.log(JSON.stringify(objFollower), "objFollower")

          return follower.update(objFollower,{where: params} )
          .then(async (updated) => { 
              const upService = await follower.findOne({ where: { id: id } })
              console.log(JSON.stringify(upService), "upService")
              return { success: true, message: "Follower Success Updated", data: upService } })
          .catch((err) => { return { success: false, message: "Follower Fail Updated", data: err } });
        } catch (error) {
          throw (error)
        }
      },

      delete: async (data) => {
        try {
          const { user_id, partner_id } = data;
  
          return follower.destroy({
            where: {
              user_id: user_id,
              partner_id: partner_id
            },
          })
            .then(async (deleted) => {
              return { success: true, message: "Follower Success Remove", data: [] }
            })
            .catch((err) => {
              console.log(err);
              return { success: false, message: "Follower Fail Remove", data: err }
            });
        } catch (error) {
          console.log(error);
          throw (error)
        }
      },
  }
