const Joi = require('joi');

// Validation schema for deleting news
exports.deleteNewsSchema = Joi.object({
    id: Joi.string().required() // Assuming id is a string, adjust if necessary
});

exports.editNewsSchema = Joi.object({
    titleEnglish: Joi.string().required(),
    titleSinhala: Joi.string().required(),
    titleTamil: Joi.string().required(),
    descriptionEnglish: Joi.string().required(),
    descriptionSinhala: Joi.string().required(),
    descriptionTamil: Joi.string().required(),
    image: Joi.object().optional() // Assuming the image will be uploaded as a file
});