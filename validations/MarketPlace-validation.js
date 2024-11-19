const Joi = require('joi');

exports.AddProductValidation = Joi.object({
    normalPrice: Joi.number().positive().required(),
    discountedPrice: Joi.number().positive().optional(),
    promo: Joi.boolean().required(),
    tags: Joi.string().min(1).max(50).optional(),
    salePrice: Joi.number().positive().optional(),
    displaytype: Joi.string().pattern(/^[A-Z&]+$/).required(),
    selectId: Joi.string().alphanum().required(),
    variety: Joi.string().alphanum().required(),
    unitType: Joi.string().valid('Kg', 'g').required(),
    startValue: Joi.number().positive().optional(),
    changeby: Joi.number().integer().required(),
    cropName: Joi.string().min(3).max(50).required()
})


exports.CreateCoupenValidation = Joi.object({
    code:Joi.string().required(),
    type:Joi.string().required(),
    percentage:Joi.number().min(0).max(100).required(),
    status:Joi.boolean().required(),
    checkLimit:Joi.boolean().required(),
    startDate:Joi.date().required(),
    endDate:Joi.date().required(),

})