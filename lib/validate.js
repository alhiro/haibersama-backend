const joi = require('joi');

exports.validate = (schema) => {
    return async (req, res, next) => {
        try {
            const keys = Object.keys(schema);
            for (var i = 0; i < keys.length; i += 1) {
                const key = keys[i];
                req[key] = await joi.validate(req[key], schema[key]);
            }
            next();
        } catch (err) {
            res.status(400).send({ err, message: err.details[0].message });
            return;
        }
    }
}