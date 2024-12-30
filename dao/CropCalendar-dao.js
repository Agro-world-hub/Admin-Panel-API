const { plantcare, collectionofficer, marketPlace, dash } = require('../startup/database');
const Joi = require('joi');
const path = require('path');



exports.allCropGroups = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, cropNameEnglish FROM cropgroup";

    plantcare.query(sql, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results); // No need to wrap in arrays, return results directly
    });
  });
};



exports.createCropGroup = async (
  cropNameEnglish,
  cropNameSinhala,
  cropNameTamil,
  category,
  image,
  bgColor
) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO cropgroup (cropNameEnglish, cropNameSinhala, cropNameTamil, category, image, bgColor) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [
      cropNameEnglish,
      cropNameSinhala,
      cropNameTamil,
      category,
      image,
      bgColor
    ];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};





exports.getAllCropGroups = (limit, offset) => {
  return new Promise((resolve, reject) => {
    const countSql = "SELECT COUNT(*) AS total FROM cropgroup";
    const dataSql = `
        SELECT 
          cg.*,
          COUNT(cv.id) as varietyCount,
          GROUP_CONCAT(DISTINCT cv.varietyNameEnglish) as varietyList
        FROM 
          cropgroup cg
        LEFT JOIN 
          cropvariety cv ON cg.id = cv.cropGroupId
        GROUP BY 
          cg.id
        ORDER BY 
          cg.createdAt DESC
        LIMIT ? OFFSET ?;
      `;

      plantcare.query(countSql, (countErr, countResults) => {
      if (countErr) {
        reject(countErr);
      } else {
        plantcare.query(dataSql, [limit, offset], (dataErr, dataResults) => {
          if (dataErr) {
            reject(dataErr);
          } else {
            // Process the results to convert varietyList from comma-separated string to array
            const processedResults = dataResults.map(row => ({
              ...row,
              varietyList: row.varietyList ? row.varietyList.split(',') : []
            }));

            resolve({
              total: countResults[0].total,
              items: processedResults,
            });
          }
        });
      }
    });
  });
};





exports.deleteCropGroup = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM cropgroup WHERE id = ?";
    plantcare.query(sql, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows);
      }
    });
  });
};



exports.createCropVariety = async (
  cropGroupId,
  varietyNameEnglish,
  varietyNameSinhala,
  varietyNameTamil,
  descriptionEnglish,
  descriptionSinhala,
  descriptionTamil,
  fileBuffer,
  bgColor
) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO cropvariety (cropGroupId, varietyNameEnglish, varietyNameSinhala, varietyNameTamil, descriptionEnglish, descriptionSinhala, descriptionTamil, image, bgColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      cropGroupId,
      varietyNameEnglish,
      varietyNameSinhala,
      varietyNameTamil,
      descriptionEnglish,
      descriptionSinhala,
      descriptionTamil,
      fileBuffer,
      bgColor
    ];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};


exports.allCropVariety = (cropGroupId) => {
  return new Promise((resolve, reject) => {

    const sql = "SELECT id, varietyNameEnglish FROM cropvariety WHERE cropGroupId = ?";  // Use parameterized query with "?"

    plantcare.query(sql, [cropGroupId], (err, results) => {  // Pass cropGroupId in an array as the second argument
      if (err) {
        console.error('Database error:', err);
        return reject(err); // Reject promise if an error occurs
      }
      console.log("hiiii", cropGroupId);
      console.log('Query results:', results);
      resolve(results); // Return results directly
    });
  });
};




exports.createCropCallender = async (
  cropVarietyId,
  method,
  natOfCul,
  cropDuration,
  suitableAreas
) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO cropcalender (cropVarietyId  , method, natOfCul, cropDuration, suitableAreas) VALUES (?, ?, ?, ?, ?)";
    const values = [
      cropVarietyId,
      method,
      natOfCul,
      cropDuration,
      suitableAreas
    ];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};




exports.insertXLSXData = (cropId, data) => {
  return new Promise((resolve, reject) => {
    // Define validation schema
    const schema = Joi.object({
      "Task index": Joi.number().required(),
      Day: Joi.number().integer().required(),
      "Task type (English)": Joi.string().required(),
      "Task type (Sinhala)": Joi.string().required(),
      "Task type (Tamil)": Joi.string().required(),
      "Task Category (English)": Joi.string().required(),
      "Task Category (Sinhala)": Joi.string().required(),
      "Task Category (Tamil)": Joi.string().required(),
      "Task (English)": Joi.string().required(),
      "Task (Sinhala)": Joi.string().required(),
      "Task (Tamil)": Joi.string().required(),
      "Task description (English)": Joi.string().required(),
      "Task description (Sinhala)": Joi.string().required(),
      "Task description (Tamil)": Joi.string().required(),
      "Image Link": Joi.string().required(),
      "Video Link": Joi.string().required(),
      "Required Images": Joi.number().required(),
      "Require Geo": Joi.number().required(),
    }).required();

    // Validate all data
    const validatedData = [];
    for (let i = 0; i < data.length; i++) {
      const { error, value } = schema.validate(data[i]);
      if (error) {
        return reject(
          new Error(
            `Validation error in row ${i + 1}: ${error.details[0].message}`
          )
        );
      }
      validatedData.push(value);
    }

    const sql = `
        INSERT INTO cropcalendardays 
        (cropId, taskIndex, days, taskTypeEnglish, taskTypeSinhala, taskTypeTamil, 
        taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil, 
        taskEnglish, taskSinhala, taskTamil, 
        taskDescriptionEnglish, taskDescriptionSinhala, taskDescriptionTamil, imageLink, videoLink, reqImages, reqGeo) 
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
      row["Image Link"],
      row["Video Link"],
      row["Required Images"],
      row["Require Geo"],
    ]);

    plantcare.query(sql, [values], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          message: "All data validated and inserted successfully",
          totalRows: data.length,
          insertedRows: result.affectedRows,
        });
      }
    });
  });
};



exports.getAllVarietyByGroup = (cropGroupId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM cropvariety WHERE cropGroupId = ?";

    plantcare.query(sql, [cropGroupId], (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }
      const processedDataResults = results.map((variety) => {
        if (variety.image) {
          const base64Image = Buffer.from(variety.image).toString(
            "base64"
          );
          const mimeType = "image/png"; // Adjust the MIME type if needed
          variety.image = `data:${mimeType};base64,${base64Image}`;
        }
        return variety;
      });

      resolve(processedDataResults); // No need to wrap in arrays, return results directly
    });
  });
};




exports.deleteCropVariety = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM cropvariety WHERE id = ?";
    plantcare.query(sql, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows);
      }
    });
  });
};



exports.getGroupById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM cropgroup WHERE id = ?";

    plantcare.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }
      const processedDataResults = results.map((variety) => {
        if (variety.image) {
          const base64Image = Buffer.from(variety.image).toString(
            "base64"
          );
          const mimeType = "image/png"; // Adjust the MIME type if needed
          variety.image = `data:${mimeType};base64,${base64Image}`;
        }
        return variety;
      });
      resolve(processedDataResults); // No need to wrap in arrays, return results directly
    });
  });
};

exports.getVarietyById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM cropvariety WHERE id = ?";

    plantcare.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }
      const processedDataResults = results.map((variety) => {
        if (variety.image) {
          const base64Image = Buffer.from(variety.image).toString(
            "base64"
          );
          const mimeType = "image/png"; // Adjust the MIME type if needed
          variety.image = `data:${mimeType};base64,${base64Image}`;
        }
        return variety;
      });
      resolve(processedDataResults); // No need to wrap in arrays, return results directly
    });
  });
};



// exports.updateGroup = (updates, id) => {
//   return new Promise((resolve, reject) => {

//     const { cropNameEnglish, cropNameSinhala, cropNameTamil, category, bgColor, image } = newsData;
//     const fields = [];
//     const values = [];

//     for (const [key, value] of Object.entries(updates)) {
//       fields.push(`${key} = ?`);
//       values.push(value);
//     }

//     const sql = `UPDATE cropgroup SET ${fields.join(', ')} WHERE id = ?`;
//     values.push(id); // Add ID as the last parameter

//     db.query(sql, values, (err, result) => {
//       if (err) return reject(err);
//       resolve(result);
//     });
//   });
// };



exports.updateGroup = (newsData, id) => {
  return new Promise((resolve, reject) => {
    const { cropNameEnglish, cropNameSinhala, cropNameTamil, category, bgColor, image } = newsData;
    console.log(newsData);

    let sql = `
            UPDATE cropgroup 
            SET 
                cropNameEnglish = ?, 
                cropNameSinhala = ?, 
                cropNameTamil = ?, 
                category = ?, 
                bgColor = ?
        `;

    let values = [
      cropNameEnglish,
      cropNameSinhala,
      cropNameTamil,
      category,
      bgColor,
    ];

    if (image) {
      sql += `, image = ?`;  // Update the image field with binary data
      values.push(image);
    }

    sql += ` WHERE id = ?`;
    values.push(id);

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.updateCropVariety = (id, updates) => {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    const sql = `UPDATE cropvariety SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id); // Add ID as the last parameter

    plantcare.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};






exports.getAllCropCalendars = (limit, offset) => {
  return new Promise((resolve, reject) => {
    const countSql = "SELECT COUNT(*) AS total FROM cropcalender";
    const dataSql = `
      SELECT 
      cropcalender.id,
        cropcalender.method,
        cropcalender.natOfCul,
        cropcalender.cropDuration,
        cropgroup.cropNameEnglish,
        cropgroup.category,
        cropvariety.varietyNameEnglish
      FROM 
        cropcalender
      LEFT JOIN 
        cropvariety ON cropcalender.cropVarietyId = cropvariety.id
      LEFT JOIN 
        cropgroup ON cropvariety.cropGroupId = cropgroup.id
      ORDER BY 
        cropcalender.createdAt DESC
      LIMIT ? OFFSET ?;
    `;

    plantcare.query(countSql, (countErr, countResults) => {
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



exports.updateCropCalender = async (id, updateData) => {
  return new Promise((resolve, reject) => {
    let sql = `
            UPDATE cropcalender 
            SET 
                method = ?,
                natOfCul = ?, 
                cropDuration = ?,
                suitableAreas = ?
        `;

    // Update the values based on the provided data
    let values = [
      updateData.method,
      updateData.natOfCul,
      updateData.cropDuration,
      updateData.suitableAreas,
    ];


    // Complete the SQL query with the WHERE clause
    sql += ` WHERE id = ?`;
    values.push(id);

    // Execute the query
    plantcare.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows);
      }
    });
  });
};



exports.deleteCropCalender = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM cropcalender WHERE id = ?";
    plantcare.query(sql, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows);
      }
    });
  });
};



exports.getAllTaskByCropId = (cropId, limit, offset) => {
  return new Promise((resolve, reject) => {
    const countSql =
      "SELECT COUNT(*) as total FROM cropcalender cc, cropcalendardays cd WHERE cc.id = cd.cropId AND cc.id = ?";
    const sql = `
            SELECT * 
            FROM cropcalender cc 
            JOIN cropcalendardays cd ON cc.id = cd.cropId 
            WHERE cc.id = ?
            ORDER BY cd.taskIndex 
            LIMIT ? OFFSET ?`;
    const values = [cropId];

    plantcare.query(countSql, [cropId], (countErr, countResults) => {
      if (countErr) {
        reject(countErr);
      } else {
        plantcare.query(
          sql,
          [cropId, parseInt(limit), parseInt(offset)],
          (dataErr, dataResults) => {
            if (dataErr) {
              reject(dataErr);
            } else {
              resolve({
                results: dataResults,
                total: countResults[0].total,
              });
            }
          }
        );
      }
    });
  });
};



exports.updateVariety = (newsData, id) => {
  return new Promise((resolve, reject) => {
    const { varietyNameEnglish, varietyNameSinhala, varietyNameTamil, descriptionEnglish, descriptionSinhala, descriptionTamil, bgColor, image } = newsData;
    console.log(newsData);



    let sql = `
          UPDATE cropvariety 
          SET 
              varietyNameEnglish = ?, 
              varietyNameSinhala = ?, 
              varietyNameTamil = ?, 
               descriptionEnglish = ?, 
              descriptionSinhala = ?, 
              descriptionTamil = ?, 
              bgColor = ?
      `;

    let values = [
      varietyNameEnglish,
      varietyNameSinhala,
      varietyNameTamil,
      descriptionEnglish,
      descriptionSinhala,
      descriptionTamil,
      bgColor,
    ];

    if (image) {
      sql += `, image = ?`;  // Update the image field with binary data
      values.push(image);
    }

    sql += ` WHERE id = ?`;
    values.push(id);

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};



exports.checkCropGroup = (engName) => {
  return new Promise((resolve, reject) => {

    const sql = "SELECT * FROM cropgroup WHERE cropNameEnglish LIKE ?";

    plantcare.query(sql, [engName], (err, results) => {
      console.log(sql);
      
      if (err) {
        console.error('Database error:', err);
        return reject(err);
      }
      console.log('Query results:', results);
      resolve(results);
    });
  });
};


exports.checkCropVerity = (id, engName) => {
  return new Promise((resolve, reject) => {

    const sql = "SELECT * FROM cropvariety WHERE cropGroupId = ? AND varietyNameEnglish LIKE ?";

    plantcare.query(sql, [id, engName], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return reject(err);
      }
      console.log('Query results:', results);
      resolve(results);
    });
  });
};


exports.checkExistanceCropCalander = async (id, cultivationMethod, natureOfCultivation) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM cropcalender WHERE cropVarietyId = ? AND method = ? AND natOfCul = ? ";
    plantcare.query(sql, [id, cultivationMethod, natureOfCultivation], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};