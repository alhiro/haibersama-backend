var jwt = require("./lib/jwt");
var admin = require('firebase-admin');
const HaiUser = require('./models/haiuser');

const Redis = require("ioredis");
const rateLimit = require("express-rate-limit");

module.exports = {
  isUserAuthenticated: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(403).json({
        status: 403,
        message: "FORBIDDEN"
      });
    } else {
      const token = authHeader;

      if (token) {
        jwt
          .verify(token)
          .then(() => {
            return jwt
              .decode(token)
              .then(decodedStore => {
                // ------------------------------------
                // HI I'M THE UPDATED CODE BLOCK, LOOK AT ME
                // ------------------------------------
                console.log("decodedStore : " + JSON.stringify(decodedStore));
                const { email, name, id, type, erp_role } = decodedStore;
                const erpRole = req.headers['x-erp-role'] || erp_role || (type == 2 ? 'Owner' : 'Customer');

                res.locals.auth = {
                  name,
                  email,
                  id,
                  type,
                  erpRole
                };
                next();
              })
              .catch(err => {
                console.log(err);

                return res.status(401).json({
                  status: 401,
                  message: "UNAUTHORIZED"
                });
              });
          })
          .catch(err => {
            return res.status(401).json({
              status: 401,
              message: "UNAUTHORIZED"
            });
          });
        // else {
        //   return res.status(401).json({
        //     status: 401,
        //     message: 'UNAUTHORIZED'
        //   })
        // }
      } else {
        return res.status(403).json({
          status: 403,
          message: "FORBIDDEN"
        });
      }
    }
  },
  
  isPartnerAuthenticated: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(403).json({
        status: 403,
        message: "FORBIDDEN"
      });
    } else {
      const token = authHeader;

      if (token) {
        jwt
          .verify(token)
          .then(() => {
            return jwt
              .decode(token)
              .then(decodedStore => {
                // ------------------------------------
                // HI I'M THE UPDATED CODE BLOCK, LOOK AT ME
                // ------------------------------------
                console.log("decodedStore : " + JSON.stringify(decodedStore));
                const { email, name, id, type, erp_role } = decodedStore;
                const erpRole = req.headers['x-erp-role'] || erp_role || (type == 2 ? 'Owner' : 'Customer');

                res.locals.auth = {
                  name,
                  email,
                  id,
                  type,
                  erpRole
                };

                if(type != 2){
                  return res.status(401).json({
                    status: 401,
                    message: "UNAUTHORIZED"
                  });
                }else{
                  next();
                }
              })
              .catch(err => {
                console.log(err);

                return res.status(401).json({
                  status: 401,
                  message: "UNAUTHORIZED"
                });
              });
          })
          .catch(err => {
            return res.status(401).json({
              status: 401,
              message: "UNAUTHORIZED"
            });
          });
        // else {
        //   return res.status(401).json({
        //     status: 401,
        //     message: 'UNAUTHORIZED'
        //   })
        // }
      } else {
        return res.status(403).json({
          status: 403,
          message: "FORBIDDEN"
        });
      }
    }
  },

  requireErpRoles: (roles = []) => (req, res, next) => {
    const currentRole = res.locals.auth && res.locals.auth.erpRole;
    if (!currentRole || !roles.includes(currentRole)) {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "ROLE_NOT_ALLOWED"
      });
    }
    return next();
  },

  isAdminAuthenticated: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(403).json({
        status: 403,
        message: "FORBIDDEN"
      });
    } else {
      const token = authHeader;

      if (token) {
        jwt
          .verify(token)
          .then(() => {
            return jwt
              .decode(token)
              .then(decodedStore => {
                // ------------------------------------
                // HI I'M THE UPDATED CODE BLOCK, LOOK AT ME
                // ------------------------------------
                console.log("decodedStore : " + JSON.stringify(decodedStore));
                const { email, name, id, type } = decodedStore;

                res.locals.auth = {
                  name,
                  email,
                  id,
                  type
                };

                if(email != 'haieventorganizer@gmail.com'){
                  return res.status(401).json({
                    status: 401,
                    message: "UNAUTHORIZED"
                  });
                }else{
                  next();
                }
              })
              .catch(err => {
                console.log(err);

                return res.status(401).json({
                  status: 401,
                  message: "UNAUTHORIZED"
                });
              });
          })
          .catch(err => {
            return res.status(401).json({
              status: 401,
              message: "UNAUTHORIZED"
            });
          });
        // else {
        //   return res.status(401).json({
        //     status: 401,
        //     message: 'UNAUTHORIZED'
        //   })
        // }
      } else {
        return res.status(403).json({
          status: 403,
          message: "FORBIDDEN"
        });
      }
    }
  },

  verifyFirebaseToken: async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[0];
    // console.log("req.headers : " + JSON.stringify(token));
  
    if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });
  
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      console.log("next decoded : ", decoded);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token tidak valid', error: err.message });
    }
  },

  updateFcmToken: async (req, res, next) => {
    try {
      const token = req.headers["fcm_token"];
      const userId = res.locals?.auth?.id;

      console.log("req fcm token");
      console.log(token);
      console.log(userId);
  
      if (!token || !userId) {
        return next(); // Lewatkan jika tidak ada value
      }

      // Hapus token dari user lain (hindari konflik FCM token ganda)
      await HaiUser.update(
        { fcm_token: null },
        {
          where: {
            fcm_token: token,
            id: { [require("sequelize").Op.ne]: userId }, // selain user yang sedang login
          },
        }
      );
  
      // Cari user
      const user = await HaiUser.findOne({ where: { id: userId } });
      if (user && (!user.fcm_token || user.fcm_token !== token)) {
        await user.update({ fcm_token: token });
        console.log(`✅ FCM token updated for user ID ${user.id}`);
      } else {
        console.log(`✅ FCM token exist user id ${user.id}`);
      }
    } catch (error) {
      console.warn("⚠️ Failed to update FCM token:", error.message);
      // Tidak menghalangi request meski update token gagal
    }
  
    return next();
  },

  limiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10,
    validate: { xForwardedForHeader: false },
    message: {
      success: false,
      message: "Terlalu banyak permintaan dari IP ini. Coba lagi nanti.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
  
};
