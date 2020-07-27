const ser = require("../services/service");
const sequelizeTransaction = require("../config/sequelizeTransaction");

exports.getAllServices = async function(req, res, next) {
  console.log("controller service");

  const { body } = req;
  const { token } = body;
  try {
    var services = await ser.getAll();
    return res
      .status(200)
      .json({ status: 200, data: services, message: "Succesfully Retrieved" });
  } catch (err) {
    return res
      .status(500)
      .send({ code: 500, success: false, message: err.message, data: { err } });
  }
};

exports.addService = async function(req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { name: req.body.name };

    let insertService = await ser.findOrCreateService(params, req);
    return res.status(200).send(insertService);
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.updateService = async function(req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { id: req.body.id };

    const findService = await ser.findService(params);
    console.log("findService :", findService)
    if (findService.success=== true){
      let insertService = await ser.updateService(params, req);
      return res.status(200).send(insertService);
    }
    
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};
