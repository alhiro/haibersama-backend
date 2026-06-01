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
const normalizeRole = (role) => String(role || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const erpModuleAccess = {
  supplier: ['Owner', 'Admin', 'Supervisor'],
  purchaseorder: ['Owner', 'Admin', 'Supervisor', 'Warehouse Staff'],
  warehouse: ['Owner', 'Admin', 'Supervisor', 'Warehouse Staff', 'Driver'],
  production: ['Owner', 'Admin', 'Supervisor', 'Penjahit', 'Karyawan', 'Staff'],
  inventory: ['Owner', 'Admin', 'Supervisor', 'Warehouse Staff'],
  product: ['Owner', 'Admin', 'Supervisor', 'Marketplace Admin', 'Kasir'],
  transaction: ['Owner', 'Admin', 'Supervisor', 'Marketplace Admin', 'Kasir', 'Driver'],
  invoice: ['Owner', 'Admin', 'Supervisor', 'Marketplace Admin', 'Kasir'],
  cashflow: ['Owner', 'Admin'],
  report: ['Owner', 'Admin', 'Supervisor'],
  expense: ['Owner', 'Admin', 'Supervisor'],
  returnrefund: ['Owner', 'Admin', 'Supervisor', 'Warehouse Staff', 'Marketplace Admin', 'Kasir'],
  settlement: ['Owner', 'Admin', 'Marketplace Admin'],
  employeerole: ['Owner'],
  stockledger: ['Owner', 'Supervisor', 'Warehouse Staff'],
  attendance: ['Owner', 'Admin', 'Supervisor', 'Warehouse Staff', 'Penjahit', 'Kasir', 'Driver', 'Marketplace Admin', 'Karyawan', 'Staff'],
  leaverequest: ['Owner', 'Admin', 'Supervisor', 'Warehouse Staff', 'Penjahit', 'Kasir', 'Driver', 'Marketplace Admin', 'Karyawan', 'Staff'],
  overtime: ['Owner', 'Admin', 'Supervisor', 'Warehouse Staff', 'Penjahit', 'Kasir', 'Driver', 'Marketplace Admin', 'Karyawan', 'Staff'],
  employeetask: ['Owner', 'Admin', 'Supervisor', 'Warehouse Staff', 'Penjahit', 'Kasir', 'Driver', 'Marketplace Admin', 'Karyawan', 'Staff'],
  workschedule: ['Owner', 'Admin', 'Supervisor', 'Warehouse Staff', 'Penjahit', 'Kasir', 'Driver', 'Marketplace Admin', 'Karyawan', 'Staff'],
  announcement: ['Owner', 'Admin', 'Supervisor', 'Warehouse Staff', 'Penjahit', 'Kasir', 'Driver', 'Marketplace Admin', 'Karyawan', 'Staff'],
  payslip: ['Owner', 'Admin', 'Supervisor', 'Warehouse Staff', 'Penjahit', 'Kasir', 'Driver', 'Marketplace Admin', 'Karyawan', 'Staff'],
};

const canAccessErpModule = (role, module, isAdmin = false) => {
  if (isAdmin) return true;
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === 'owner') return true;
  const allowedRoles = erpModuleAccess[String(module || '').toLowerCase()];
  if (!allowedRoles) return false;
  return allowedRoles.map(normalizeRole).includes(normalizedRole);
};

const erpModuleWriteAccess = {
  employeetask: ['Owner', 'Admin', 'Supervisor'],
  workschedule: ['Owner', 'Admin', 'Supervisor'],
  announcement: ['Owner', 'Admin', 'Supervisor'],
  payslip: ['Owner', 'Admin', 'Supervisor'],
};

const canWriteErpModule = (role, module, isAdmin = false) => {
  if (isAdmin) return true;
  const writeRoles = erpModuleWriteAccess[String(module || '').toLowerCase()];
  if (!writeRoles) return canAccessErpModule(role, module, isAdmin);
  const normalizedRole = normalizeRole(role);
  return writeRoles.map(normalizeRole).includes(normalizedRole);
};

const resolveAuthContext = async (decodedStore, req) => {
  const { email, name, id, type, is_admin, admin_role } = decodedStore;
  const user = await HaiUser.findOne({
    where: { id },
    attributes: ['id', 'email', 'name', 'type', 'is_admin', 'admin_role', 'partner_status'],
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

  const partnerUser = employeeRole && employeeRole.partner_id !== id
    ? await HaiUser.findOne({
        where: { id: employeeRole.partner_id },
        attributes: ['id', 'partner_status'],
      }).catch(() => null)
    : null;
  const ownPartnerStatus = (user && user.partner_status) || (userType == 2 ? 'pending' : 'none');
  const partnerStatus = employeeRole
    ? ((partnerUser && partnerUser.partner_status) || ownPartnerStatus)
    : ownPartnerStatus;

  const erpRole = employeeRole ? employeeRole.role : null;

  return {
    name: userName,
    email: userEmail,
    id,
    type: userType,
    partnerId: employeeRole ? employeeRole.partner_id : id,
    partnerStatus,
    erpRole,
    erpDepartment: employeeRole ? employeeRole.department : null,
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

                if(type != 2 || res.locals.auth.partnerStatus !== 'approved'){
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
      if (res.locals.auth.partnerStatus !== 'approved' || !res.locals.auth.erpEmployeeRoleId) {
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

  requireErpModuleAccess: (moduleResolver) => (req, res, next) => {
    const currentRole = res.locals.auth && res.locals.auth.erpRole;
    const module = typeof moduleResolver === 'function'
      ? moduleResolver(req)
      : (moduleResolver || req.params.module);
    const isAdmin = res.locals.auth && res.locals.auth.isAdmin;

    if (!canAccessErpModule(currentRole, module, isAdmin)) {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "ROLE_NOT_ALLOWED"
      });
    }
    return next();
  },

  requireErpModuleWriteAccess: (moduleResolver) => (req, res, next) => {
    const currentRole = res.locals.auth && res.locals.auth.erpRole;
    const module = typeof moduleResolver === 'function'
      ? moduleResolver(req)
      : (moduleResolver || req.params.module);
    const isAdmin = res.locals.auth && res.locals.auth.isAdmin;
    const normalizedModule = String(module || '').toLowerCase();
    const isTaskProgressUpdate =
      normalizedModule === 'employeetask' &&
      ['POST', 'PATCH'].includes(req.method) &&
      String(req.path || '').toLowerCase().includes('/update');

    if (isTaskProgressUpdate && canAccessErpModule(currentRole, module, isAdmin)) {
      return next();
    }

    if (!canWriteErpModule(currentRole, module, isAdmin)) {
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
