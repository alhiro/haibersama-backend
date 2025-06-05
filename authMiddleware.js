var jwt = require("./lib/jwt");
var admin = require('firebase-admin');

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
                const { email, id, type } = decodedStore;

                res.locals.auth = {
                  email,
                  id,
                  type
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
                const { email, id, type } = decodedStore;

                res.locals.auth = {
                  email,
                  id,
                  type
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
                const { email, id, type } = decodedStore;

                res.locals.auth = {
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
  }
};


