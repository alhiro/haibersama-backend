const joi = require("joi");
//.extend(require('@hapi/joi-date'));
const pattern = /^\d{4}-\d{2}-\d{2}$/;
const { validate } = require("../lib/validate");

module.exports = {
  login: () => {
    const schema = {
      body: joi.object().keys({
        email: joi.string().required(),
        password: joi
          .string()
          .required()
          .min(8)
      })
    };

    return validate(schema);
  },

  register: () => {
    const schema = {
      body: joi.object().keys({
        email: joi.string().required(),
        name: joi.string().required(),
        phone: joi
          .string()
          .required()
          .min(8),
        address: joi
          .string()
          .required()
          .min(8),
        dob: joi.string().required().regex(pattern),
        nation: joi.string().required(),
        password: joi
          .string()
          .required()
          .min(8)
      })
    };

    return validate(schema);
  }
};
