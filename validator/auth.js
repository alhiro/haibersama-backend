const joi = require("joi");

const { validate } = require("../lib/validate");

module.exports = {
  login: () => {
    const schema = {
      body: joi.object().keys({
        email: joi.string().required(),
        phone: joi
          .string()
          .required()
          .min(8)
      })
    };

    return validate(schema);
  },
};
