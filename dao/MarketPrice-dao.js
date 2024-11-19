const db = require("../startup/database");
const Joi = require('joi');
const path = require('path');


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





exports.insertMarketPriceXLSXData = (xlindex, data, createdBy) => {
  return new Promise((resolve, reject) => {
    console.log('dfdfhdgh');

      // const schema = Joi.object({
      //   'Crop Name': Joi.number().required(),
      //   'Variety Name': Joi.string().required(),
      //   'Variety Id': Joi.required(),
      //   'Variety Id': Joi.required(),
      // }).required();
  
      // Validate all data
      // const validatedData = [];
      // for (let i = 0; i < data.length; i++) {
      //   const { error, value } = schema.validate(data[i]);
      //   if (error) {
      //     return reject(new Error(`Validation error in row ${i + 1}: ${error.details[0].message}`));
      //   }
      //   validatedData.push(value);
      // }
    
      const sql = `
        INSERT INTO marketprice 
        (varietyId , xlindex, grade, price, createdBy) 
        VALUES ?`;
  
      const values = data.map((row) => [
        row["Variety Id"],
        xlindex,
        row["Grade"],
        row["Price"],
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


  exports.getAllxlsxlist = (limit, offset) => {
    return new Promise((resolve, reject) => {
      const countSql = "SELECT COUNT(*) as total FROM xlsxhistory";
      const dataSql =
        `SELECT * FROM xlsxhistory  
  ORDER BY createdAt DESC 
  LIMIT ? OFFSET ?`;
  
      db.query(countSql, (countErr, countResults) => {
        if (countErr) {
          reject(countErr);
        } else {
          db.query(dataSql, [limit, offset], (dataErr, dataResults) => {
            if (dataErr) {
              reject(dataErr);
            } else {
              resolve({
                total: countResults[0].total,
                items: dataResults,
              });
            }
          });
        }
      });
    });
  };

  exports.deleteXl = (id) => {
    const sql = "DELETE FROM xlsxhistory WHERE id = ?";
  
    return new Promise((resolve, reject) => {
      db.query(sql, [id], (err, results) => {
        if (err) {
          reject("Error executing delete query: " + err);
        } else {
          resolve(results);
        }
      });
    });
  };



exports.getXLSXFilePath = async (fileName) => {
  try {
    // Assuming files are stored in a specific directory (e.g., 'uploads/xlsx')
    const filePath = path.join(__dirname, '../files', fileName);
    console.log(filePath);

    // Check if the file exists on the server (Optional)
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return null; // File does not exist
    }

    return filePath;
  } catch (error) {
    console.error('Error retrieving XLSX file path:', error);
    throw error;
  }
};


// exports.getAllMarketPriceDAO = (limit, offset, crop, grade) => {
//   return new Promise((resolve, reject) => {
//     const params = [];
//     const countParams = [];
    
//     let countSql = "SELECT COUNT(*) as total FROM marketprice m, cropCalender c WHERE m.cropId = c.id";
//     let sql = `
//       SELECT m.id, c.cropName, c.variety, m.grade, m.price, m.date, m.startTime, m.endTime
//       FROM marketprice m, cropCalender c
//       WHERE m.cropId = c.id
//     `;

//     if (crop) {
//       sql += " AND c.cropName = ?";
//       countSql += " AND c.cropName = ?";
//       params.push(crop);
//       countParams.push(crop);
//     }

//     if (grade) {
//       sql += " AND m.grade = ?";
//       countSql += " AND m.grade = ?";
//       params.push(grade);
//       countParams.push(grade);
//     }

//     sql += ` ORDER BY c.cropName, m.grade LIMIT ? OFFSET ?`;
//     params.push(parseInt(limit));
//     params.push(parseInt(offset));

//     console.log(sql, params);

//     db.query(countSql, countParams, (countErr, countResults) => {
//       if (countErr) {
//         reject(countErr);
//       } else {
//         db.query(sql, params, (dataErr, dataResults) => {
//           if (dataErr) {
//             reject(dataErr);
//           } else {
//             resolve({
//               results: dataResults,
//               total: countResults[0].total
//             });
//           }
//         });
//       }
//     });
//   });
// };


exports.getAllMarketPriceDAO = (limit, offset, crop, grade) => {
  return new Promise((resolve, reject) => {
    const params = [];
    const countParams = [];

    let countSql = `
      SELECT COUNT(*) as total
      FROM marketprice m
      JOIN cropvariety cv ON m.varietyId = cv.id
      JOIN cropgroup cg ON cv.cropGroupId = cg.id
      WHERE 1=1
    `;
    let sql = `
      SELECT 
        m.id,
        cg.cropNameEnglish AS cropName,
        cv.varietyNameEnglish AS varietyName,
        m.grade,
        m.price,
        m.createdAt
      FROM marketprice m
      JOIN cropvariety cv ON m.varietyId = cv.id
      JOIN cropgroup cg ON cv.cropGroupId = cg.id
      WHERE 1=1
    `;

    // Add filters if crop or grade is provided
    if (crop) {
      sql += " AND cg.id = ?";
      countSql += " AND cg.id = ?";
      params.push(crop);
      countParams.push(crop);
    }

    if (grade) {
      sql += " AND m.grade = ?";
      countSql += " AND m.grade = ?";
      params.push(grade);
      countParams.push(grade);
    }

    sql += ` ORDER BY cg.cropNameEnglish, cv.varietyNameEnglish, m.grade LIMIT ? OFFSET ?`;
    params.push(parseInt(limit));
    params.push(parseInt(offset));

    console.log("SQL Query:", sql);
    console.log("SQL Params:", params);

    // Execute the count query
    db.query(countSql, countParams, (countErr, countResults) => {
      if (countErr) {
        console.error("Count Query Error:", countErr.message || countErr);
        return reject(countErr);
      }

      // Execute the main query
      db.query(sql, params, (dataErr, dataResults) => {
        if (dataErr) {
          console.error("Data Query Error:", dataErr.message || dataErr);
          return reject(dataErr);
        }

        resolve({
          results: dataResults,
          total: countResults[0].total,
        });
      });
    });
  });
};











exports.getAllCropNameDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT id, cropNameEnglish
        FROM cropgroup  
        `;

    db.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

