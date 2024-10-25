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
      'Date': Joi.required(),
      'Start Time': Joi.required(),
      'End Time': Joi.required(),
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



exports.getAllMarketPriceDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT m.id, c.cropName,c.variety, m.grade, m.price, m.date, m.price, m.startTime, m.endTime
        FROM marketprice m, cropCalender c
        WHERE m.cropId = c.id
        ORDER BY c.cropName, m.grade
            
        `;

    db.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};


exports.getAllCropNameDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT id, cropName
        FROM cropCalender
        GROUP BY id, cropName
            
        `;

    db.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

