var jwt = require("./lib/jwt")

module.exports  =
{
  isUserAuthenticated : async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(403).json({
        status: 403,
        message: 'FORBIDDEN'
      })
    } else {
      const token = authHeader

      if (token) {
        if (jwt.verify(token)){
          return jwt.decode(token)
            .then((decodedStore) => {
            // ------------------------------------
            // HI I'M THE UPDATED CODE BLOCK, LOOK AT ME
            // ------------------------------------
              const {storeid,id} = decodedStore
              
              res.locals.auth = {
                storeid,
                id
              }
              next()
            })
            .catch((err) => {
              console.log(err)

              return res.status(401).json({
                status: 401,
                message: 'UNAUTHORIZED'
              })
            })
          }
          else {
            return res.status(401).json({
              status: 401,
              message: 'UNAUTHORIZED'
            })
          }
      } else {
        return res.status(403).json({
          status: 403,
          message: 'FORBIDDEN'
        })
      }
    }
  }
}