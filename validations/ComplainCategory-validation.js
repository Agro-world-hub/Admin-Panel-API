const Joi = require('joi');

exports.getComplainCategoriesSchema = Joi.object({
    systemAppId: Joi.number().integer().required(),
});

exports.AddNewComplainCategorySchema = Joi.object({
    roleId: Joi.number().integer().required(),
    appId: Joi.number().integer().required(),
    categoryEnglish: Joi.string().required(),
    categorySinhala: Joi.string().required(),
    categoryTamil: Joi.string().required()
});