const cat = require("../services/category");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.getAllCategories = async function (req, res, next) {
  try {
    var categories = await cat.getAll();
    return res.status(200).json(
      { status: 200, data: categories, message: "Semua Kategori Berhasil Diambil" }
    );
  } catch (err) {
    return res
      .status(500)
      .send(
        { code: 500, success: false, message: err.message, data: { err } }
      );
  }
};

exports.addCategory = async function (req, res, next) {
  try {
    console.log("controller addCategory")
    const params = { name: req.body.name };

    if (!res.locals.auth.isAdmin) {
      return res.status(500).send({ success: false, message: "User Tidak Punya Otoritas Membuat Kategori", data: {} })
    } else {
      let insertCategory = await cat.findOrCreateCategory(params, req);
      return res.status(200).send(insertCategory);
    }
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.updateCategory = async function (req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { id: req.body.id };

    const findCategory = await cat.findCategory(params);
    console.log("findCategory :", findCategory)
    if (findCategory.success === true) {
      let updateCategory = await cat.updateCategory(params, req);
      return res.status(200).send(updateCategory);
    }

  } catch (err) {
    return res.status(500).send({ data: err });
  }
};
