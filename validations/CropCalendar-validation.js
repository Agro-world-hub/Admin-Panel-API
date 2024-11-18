const Joi = require('joi');

exports.getAllCropCalendarSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
});


exports.deleteCropCalenderSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});


exports.uploadXLSXSchema = Joi.object({
    id: Joi.string().required(),
});


exports.getAllCropCalendarSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
});