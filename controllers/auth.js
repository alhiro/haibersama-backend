const jwt = require("../lib/jwt");
const auth = require("../services/haiuser");

const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.login = async function (req, res, next) {
  console.log("controller login")

  const { body } = req;
  const { email, phone_number } = body;

  try {
    console.log("email : "+email)
    var users = await auth.findUser({ email });

    if (!users.success) {
      users.responseCode = 404;
      return res.status(users.responseCode).send(users);
    }
    
    console.log(users)

    if (users.data.active === 0) {
      return res.status(401).send({
        code: 401,
        success: false,
        message: "That Username is currently inactive",
        data: {}
      });
    }
    else
    {
        users.code = users.success ? 200 : 500;
        return res.status(users.code).send(users);
      }

    /* jwt.compare(password, users.data.password)
    .then(async function (done) {
        let response = await auth.login(users.data, false, 1);
        response.code = response.success ? 200 : 500;
        return res.status(response.code).send(response);
      })
      .catch(function (error) {
        return res.status(400).send({
          code: 400,
          success: false,
          message: "Invalid Username / Password",
          data: {}
        });
      }); */
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};
