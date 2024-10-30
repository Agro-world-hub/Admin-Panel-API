const db = require("../startup/database")
const Joi = require('joi')

exports.addCollectionCenter = (regCode, centerName, contact01, contact02, buildingNumber, street, district, province) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO collectioncenter 
      (regCode, centerName, contact01, contact02, buildingNumber, street, district, province) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [regCode, centerName, contact01, contact02, buildingNumber, street, district, province];

    // Log the SQL query and values for debugging
    console.log("SQL Query:", sql);
    console.log("SQL Values:", values);

    db.query(sql, values, (err, results) => {
      if (err) {
        // Log the complete error details, not just the error message
        console.error("Database error details:", err);
        return reject(err);
      }
      console.log("Insert successful:", results);
      resolve(results);
    });
  });
};


exports.GetAllCenterDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM collectioncenter";
    db.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

//delete collection center
exports.deleteCollectionCenterDAo = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM collectioncenter WHERE id = ?";
    db.query(sql, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows);
      }
    });
  });
};

exports.GetAllComplainDAO = (page, limit) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    let countSql = "SELECT COUNT(*) as total FROM farmercomplains";
    let sql = `SELECT * FROM farmercomplains LIMIT ? OFFSET ?`;
    db.query(countSql, (countErr, countResults) => {
      if (countErr) {
        return reject(countErr);
      }

      const total = countResults[0].total;

      // Execute data query
      db.query(sql, [parseInt(limit), parseInt(offset)], (dataErr, results) => {
        if (dataErr) {
          return reject(dataErr);
        }

        resolve({ results, total });
      });
    });
  });
};