const cat = require("../services/category");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getAllCategories = async function (req, res, next) {
  console.log("controller category");

  const { body } = req;
  const { token } = body;
  try {

        var categories = await cat.getAll();
        console.log("controller test test");
        return res.status(200).json({ status: 200, data: categories, message: "Succesfully Categories Retrieved" });
    
        //return res.status(400).json({ status: 400, message: e.message });

    // if (categories.data.active === true) {
    //   return res.status(401).send({
    //     code: 401,
    //     success: false,
    //     message: "That Category is currently inactive",
    //     data: {}
    //   });
    // }
    // else
    // {
    //     categories.code = categories.success ? 200 : 500;
    //     return res.status(categories.code).send(categories);
    // }

  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};
