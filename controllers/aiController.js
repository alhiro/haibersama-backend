const AI = require("../services/aiService");
const sequelizeTransaction = require('../config/sequelizeTransaction')

exports.searchAi = async function (body, req, res) {
  try {
    var ai = await AI.search(body, req, res);
    return res.status(200).json(
      {
        success: ai.success,
        // data: ai.data,
        message: ai.message,
        ai: ai.aiMessage,
      });
  } catch (err) {
    return res
      .status(500)
      .send(
        { code: 500, success: false, message: err.message, data: { err } }
      );
  }
};

exports.searchAiPartner = async function (body, req, res) {
  try {
    var ai = await AI.searchApiPartner(body, req, res);
    return res.status(200).json(
      {
        success: ai.success,
        // data: ai.data,
        message: ai.message,
        ai: ai.aiMessage,
      });
  } catch (err) {
    return res
      .status(500)
      .send(
        { code: 500, success: false, message: err.message, data: { err } }
      );
  }
};

exports.searchAiApi = async function (body, req, res) {
  try {
    var ai = await AI.searchApi(body, req, res);
    return res.status(200).json(
      {
        success: ai.success,
        data: ai.data,
        message: ai.message,
        ai: ai.aiMessage,
      });
  } catch (err) {
    return res
      .status(500)
      .send(
        { code: 500, success: false, message: err.message, data: { err } }
      );
  }
};
