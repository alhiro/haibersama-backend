const ser = require("../services/subservice");
const sequelizeTransaction = require("../config/sequelizeTransaction");

exports.getAllSubServices = async function(req, res, next) {
  console.log("controller subservice");

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

exports.addSubService = async function(req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { name: req.body.name };

    let insertSubService = await ser.findOrCreateService(params, req);
    return res.status(200).send(insertSubService);
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};

exports.updateSubService = async function(req, res, next) {
  try {
    //const transaction = await sequelizeTransaction.transaction();
    const params = { id: req.body.id };
    const findSubService = await ser.findService(params);
    console.log("findSubService :",findSubService)
    if (findSubService.success=== true){
      let insertSubService = await ser.updateService(params, req);
      return res.status(200).send(insertSubService);
    }
    
  } catch (err) {
    return res.status(500).send({ data: err });
  }
};
