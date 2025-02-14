const Joi = require('joi');

exports.getComplainCategoriesSchema = Joi.object({
    systemAppId: Joi.number().integer().required(),
});

exports.editApplicationSchema = Joi.object({
    systemAppId: Joi.number().integer().required(),
    applicationName: Joi.string().required(),
});

exports.deleteApplicationSchema = Joi.object({
    systemAppId: Joi.number().integer().required(),

});


exports.addNewApplicationSchema = Joi.object({
    applicationName: Joi.string().required(),

});

