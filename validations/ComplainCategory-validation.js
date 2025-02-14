const Joi = require('joi');

exports.getComplainCategoriesSchema = Joi.object({
    systemAppId: Joi.number().integer().required(),
});