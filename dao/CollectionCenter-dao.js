const db = require("../startup/database")
const Joi = require('joi')

exports.addCollectionCenter = (regCode, centerName, contact01, contact02, buildingNumber, street, district, province, contact01Code, contact02Code) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO collectioncenter 
      (regCode, centerName, contact01, contact02, buildingNumber, street, district, province) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [regCode, centerName, contact01Code + contact01, contact02Code + contact02, buildingNumber, street, district, province];

    db.query(sql, values, (err, results) => {
      if (err) {
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

exports.GetAllComplainDAO = (page, limit, status, searchText) => {
  return new Promise((resolve, reject) => {
    const Sqlparams = [];
    const Counterparams = [];
    const offset = (page - 1) * limit;

    let countSql = "SELECT COUNT(*) as total FROM farmercomplains fc, collectionofficer c, users u WHERE fc.farmerId = u.id AND fc.coId = c.id  ";
    let sql = ` 
    SELECT fc.id, fc.refNo, fc.createdAt, fc.status, fc.language, u.firstName as farmerName, c.firstNameEnglish as officerName , cc.centerName, cc.contact01
    FROM farmercomplains fc, collectionofficer c, users u , collectioncenter cc
    WHERE fc.farmerId = u.id AND fc.coId = c.id AND c.centerId = cc.id`;

    if (status) {
      countSql += " AND fc.status = ? ";
      sql += " AND fc.status = ? ";
      Sqlparams.push(status);
      Counterparams.push(status);
    }

    if (searchText) {
      countSql += " AND fc.refNo LIKE ? OR c.firstNameEnglish LIKE ? OR u.firstName LIKE ? ";
      sql += " AND fc.refNo LIKE ? OR c.firstNameEnglish LIKE ? OR u.firstName LIKE ? ";
      const searchQuery = `%${searchText}%`;
      Sqlparams.push(searchQuery, searchQuery, searchQuery);
      Counterparams.push(searchQuery, searchQuery, searchQuery);

    }

    sql += " LIMIT ? OFFSET ?";
    Sqlparams.push(parseInt(limit));
    Sqlparams.push(parseInt(offset));

    db.query(countSql, Counterparams, (countErr, countResults) => {
      if (countErr) {
        return reject(countErr);
      }

      const total = countResults[0].total;

      db.query(sql, Sqlparams, (dataErr, results) => {
        if (dataErr) {
          return reject(dataErr);
        }

        resolve({ results, total });
      });
    });
  });
};


exports.getComplainById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = ` 
    SELECT fc.id, fc.refNo, fc.createdAt, fc.status, fc.language, fc.complain, u.firstName AS farmerName, u.phoneNumber AS farmerPhone, c.firstNameEnglish as officerName, c.phoneNumber01 AS officerPhone, cc.centerName, cc.contact01 AS CollectionContact
    FROM farmercomplains fc, collectionofficer c, users u , collectioncenter cc
    WHERE fc.farmerId = u.id AND c.centerId = cc.id AND fc.coId = c.id AND fc.id = ? 
    `;
    db.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};



exports.CheckRegCodeExistDAO = (regCode) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM collectioncenter WHERE regCode = ?";
    db.query(sql,[regCode], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};