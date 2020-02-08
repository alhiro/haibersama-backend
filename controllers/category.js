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

exports.addCategory = async function(req, res, next) {
  try {
    console.log("controller addCategory")
    const params = { name: req.body.name };

    let insertCategory = await cat.findOrCreateCategory(params, req);
    return res.status(200).send(insertCategory);
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.updateCategory = async function(req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { id: req.body.id };

    const findCategory = await cat.findCategory(params);
    console.log("findCategory :", findCategory)
    if (findCategory.success=== true){
      let updateCategory = await cat.updateCategory(params, req);
      return res.status(200).send(updateCategory);
    }
    
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};
