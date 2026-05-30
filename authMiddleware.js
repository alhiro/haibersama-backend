var jwt = require("./lib/jwt");
var admin = require('firebase-admin');
const HaiUser = require('./models/haiuser');
const ErpEmployeeRole = require('./models/erpEmployeeRole');

const Redis = require("ioredis");
const rateLimit = require("express-rate-limit");

const adminRoles = ['Super Admin', 'Admin', 'Finance Admin', 'Support Admin'];
const configuredAdminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const resolveAuthContext = async (decodedStore, req) => {
  const { email, name, id, type, erp_role, is_admin, admin_role } = decodedStore;
  const user = await HaiUser.findOne({
    where: { id },
    attributes: ['id', 'email', 'name', 'type', 'is_admin', 'admin_role'],
  }).catch(() => null);

  const userEmail = (user && user.email) || email;
  const userType = (user && user.type) || type;
  const userName = (user && user.name) || name;
  const adminRole = (user && user.admin_role) || admin_role || null;
  const isAdmin = Boolean((user && user.is_admin) || is_admin || adminRoles.includes(adminRole) || configuredAdminEmails.includes(String(userEmail).toLowerCase()));

  let employeeRole = await ErpEmployeeRole.findOne({
    where: { user_id: id, active: true, status: 'Aktif' },
    order: [['updated_at', 'DESC']],
  }).catch(() => null);

  if (!employeeRole && userEmail) {
    employeeRole = await ErpEmployeeRole.findOne({
      where: { email: userEmail, active: true, status: 'Aktif' },
      order: [['updated_at', 'DESC']],
    }).catch(() => null);

    if (employeeRole && !employeeRole.user_id) {
      await ErpEmployeeRole.update({
        user_id: id,
        joined_at: new Date(),
        updated_by: userEmail,
      }, { where: { id: employeeRole.id } }).catch(() => null);
      employeeRole.user_id = id;
    }
  }

  const headerRole = req.headers['x-erp-role'];
  const erpRole = employeeRole
    ? employeeRole.role
    : headerRole || erp_role || (userType == 2 ? 'Owner' : 'Customer');

  return {
    name: userName,
    email: userEmail,
    id,
    type: userType,
    partnerId: employeeRole ? employeeRole.partner_id : id,
    erpRole,
    erpEmployeeRoleId: employeeRole ? employeeRole.id : null,
    isAdmin,
    adminRole,
  };
};

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
              .then(async decodedStore => {
                console.log("decodedStore : " + JSON.stringify(decodedStore));
                res.locals.auth = await resolveAuthContext(decodedStore, req);
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
              .then(async decodedStore => {
                console.log("decodedStore : " + JSON.stringify(decodedStore));
                res.locals.auth = await resolveAuthContext(decodedStore, req);
                const { type } = res.locals.auth;

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

  isErpAuthenticated: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(403).json({
        status: 403,
        message: "FORBIDDEN"
      });
    }

    const token = authHeader;
    if (!token) {
      return res.status(403).json({
        status: 403,
        message: "FORBIDDEN"
      });
    }

    try {
      await jwt.verify(token);
      const decodedStore = await jwt.decode(token);
      res.locals.auth = await resolveAuthContext(decodedStore, req);
      if (res.locals.auth.type != 2 && !res.locals.auth.erpEmployeeRoleId) {
        return res.status(401).json({
          status: 401,
          message: "UNAUTHORIZED"
        });
      }
      return next();
    } catch (err) {
      return res.status(401).json({
        status: 401,
        message: "UNAUTHORIZED"
      });
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
              .then(async decodedStore => {
                console.log("decodedStore : " + JSON.stringify(decodedStore));
                res.locals.auth = await resolveAuthContext(decodedStore, req);

                if(!res.locals.auth.isAdmin){
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
