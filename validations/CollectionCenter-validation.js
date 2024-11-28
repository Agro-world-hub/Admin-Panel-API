const Joi = require('joi');

exports.createCollectionCenterValidation = Joi.object({
    regCode: Joi.string().required(),
    centerName: Joi.string().required(),
    contact01Code: Joi.string().required(),
    contact01: Joi.string().required(),
    contact02: Joi.string().required(),
    contact02Code: Joi.string().required(),
    buildingNumber: Joi.string().required(),
    street: Joi.string().required(),
    district: Joi.string().required(),
    province: Joi.string().required()
});

exports.getAllUsersSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    searchItem: Joi.string().allow('')
});
