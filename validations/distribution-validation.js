const Joi = require("joi");

exports.getDistributionCenterDetailsSchema = Joi.object({
  name: Joi.string().required(),
  company: Joi.number().integer().required(),
  contact1: Joi.string().required(),
  contact1Code: Joi.string().required(),
  contact2: Joi.string().optional().allow(null, ""), // optional
  contact2Code: Joi.string().optional().allow(null, ""), // optional
  latitude: Joi.string().required(),
  longitude: Joi.string().required(),
  email: Joi.string().email().required(),
  country: Joi.string().required(),
  province: Joi.string().required(),
  district: Joi.string().required(),
  city: Joi.string().required(),
  regCode: Joi.string().required(),
});

exports.getAllDistributionCentreSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  company: Joi.string().optional(),
  district: Joi.string().optional(),
  province: Joi.string().optional(),
  searchItem: Joi.string().optional(),
  centerType: Joi.string().optional(),
  city: Joi.string().optional(),
});
