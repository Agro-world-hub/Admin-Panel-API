const Joi = require("joi");

exports.getAllAdminUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.number().integer().optional(),
  search: Joi.string().optional(),
});