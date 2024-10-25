const db = require("../startup/database");
const db2 = require("../startup/marketPrice");
const Joi = require('joi');


exports.createxlhistory = (xlName) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO xlsxhistory (`xlName`) VALUES (?)";
    const values = [xlName];

    db.query(sql, [values], (err, results) => {
      if (err) {
        reject(err);
      } else {
        // Resolve with the inserted ID (xlindex)
        resolve(results.insertId);
        console.log(results.insertId);
      }
    });
  });
};





exports.insertMarketPriceXLSXData = (xlindex, data, createdBy, date, startTime, endTime) => {
    return new Promise((resolve, reject) => {
      console.log('dfdfhdgh');

      const schema = Joi.object({
        'Crop Id': Joi.number().required(),
        'Grade': Joi.string().required(),
        'Price': Joi.required(),
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
        INSERT INTO marketprice 
        (cropId, xlindex, grade, price, date, startTime, 
        endTime, createdBy) 
        VALUES ?`;
  
      const values = validatedData.map((row) => [
        row["Crop Id"],
        xlindex,
        row["Grade"],
        row["Price"],
        date,
        startTime,
        endTime,
        createdBy
      ]);
  
      db.query(sql, [values], (err, result) => {
        if (err) {
          reject(err);
          console.log('ttttt');
        } else {
          console.log('xxx');
          resolve({
            message: "All data validated and inserted successfully",
            totalRows: data.length,
            insertedRows: result.affectedRows
          });
        }
      });
    });
  };