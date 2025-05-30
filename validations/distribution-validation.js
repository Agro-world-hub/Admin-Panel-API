const Joi = require('joi');

exports.getDistributionCenterDetailsSchema = Joi.object({
  name: Joi.string().required(),
  officerInCharge: Joi.string().required(),
  contact1: Joi.string().required(),
  contact1Code: Joi.string().required(),
  contact2: Joi.string().optional().allow(null, ''), // optional
  contact2Code: Joi.string().optional().allow(null, ''), // optional
  latitude: Joi.string().required(),
  longitude: Joi.string().required(),
  email: Joi.string().email().required(),
  country: Joi.string().required(),
  province: Joi.string().required(),
  district: Joi.string().required(),
  city: Joi.string().required()
});
