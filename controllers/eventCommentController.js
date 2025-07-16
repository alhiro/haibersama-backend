const service = require("../services/eventComment");

exports.getById = async function (req, res) {
  try {
    const result = await service.getById(req.query.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllByEvent = async function (req, res) {
  try {
    const params = {
      page: req.query.page,
      limit: req.query.limit,
      event_id: req.query.event_id,
      parent_comment_id: req.query.parent_comment_id,
    };

    const result = await service.getAllByEvent(params);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async function (req, res) {
  try {
    const result = await service.addComment(req.body, res);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.editComment = async function (req, res, next) {
  try {
    const result = await service.editComment(req.body, res);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
  

exports.deleteComment = async function (req, res) {
  try {
    const result = await service.deleteComment(req.body, res);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCommentUser = async function (req, res) {
    try {
      const result = await service.deleteCommentUser(req.body.id);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
};
