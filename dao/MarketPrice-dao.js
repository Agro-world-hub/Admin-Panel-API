const db = require("../startup/database");
const db2 = require("../startup/marketPrice");
const Joi = require('joi');

exports.insertMarketPriceXLSXData = (cropId, data) => {
    return new Promise((resolve, reject) => {
      // Define validation schema
      const schema = Joi.object({
        'Task index': Joi.number().required(),
        'Day': Joi.number().integer().required(),
        'Task type (English)': Joi.string().required(),
        'Task type (Sinhala)': Joi.string().required(),
        'Task type (Tamil)': Joi.string().required(),
        'Task Category (English)': Joi.string().required(),
        'Task Category (Sinhala)': Joi.string().required(),
        'Task Category (Tamil)': Joi.string().required(),
        'Task (English)': Joi.string().required(),
        'Task (Sinhala)': Joi.string().required(),
        'Task (Tamil)': Joi.string().required(),
        'Task description (English)': Joi.string().required(),
        'Task description (Sinhala)': Joi.string().required(),
        'Task description (Tamil)': Joi.string().required(),
      }).required();
  
      // Validate all data
      const validatedData = [];
      for (let i = 0; i < data.length; i++) {
        const { error, value } = schema.validate(data[i]);
        if (error) {
          return reject(new Error(`Validation error in row ${i + 1}: ${error.details[0].message}`));
        }
        validatedData.push(value);
      }
  
      const sql = `
        INSERT INTO cropcalendardays 
        (cropId, taskIndex, days, taskTypeEnglish, taskTypeSinhala, taskTypeTamil, 
        taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil, 
        taskEnglish, taskSinhala, taskTamil, 
        taskDescriptionEnglish, taskDescriptionSinhala, taskDescriptionTamil) 
        VALUES ?`;
  
      const values = validatedData.map((row) => [
        cropId,
        row["Task index"],
        row.Day,
        row["Task type (English)"],
        row["Task type (Sinhala)"],
        row["Task type (Tamil)"],
        row["Task Category (English)"],
        row["Task Category (Sinhala)"],
        row["Task Category (Tamil)"],
        row["Task (English)"],
        row["Task (Sinhala)"],
        row["Task (Tamil)"],
        row["Task description (English)"],
        row["Task description (Sinhala)"],
        row["Task description (Tamil)"],
      ]);
  
      db.query(sql, [values], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            message: "All data validated and inserted successfully",
            totalRows: data.length,
            insertedRows: result.affectedRows
          });
        }
      });
    });
  };