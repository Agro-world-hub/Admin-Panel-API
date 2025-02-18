const Joi = require('joi');

exports.deleteReloFeature = Joi.object({
    id: Joi.number().integer().required(),
});
exports.editFeatureNameSchema = Joi.object({
    id: Joi.number().integer().required(),
    name: Joi.string().required(),
});