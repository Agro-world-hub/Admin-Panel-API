const Joi = require('joi');

exports.deleteReloFeature = Joi.object({
    id: Joi.number().integer().required(),
});