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

    // SQL to count total records
    let countSql = `
      SELECT COUNT(*) AS total
      FROM farmercomplains fc
      LEFT JOIN collectionofficer cf ON fc.coId = cf.id
      LEFT JOIN collectioncenter cc ON cf.centerId = cc.id
      LEFT JOIN users u ON fc.farmerId = u.id
      WHERE 1 = 1
    `;

    // SQL to fetch paginated data
    let sql = `
      SELECT 
        fc.id, 
        fc.refNo, 
        fc.createdAt, 
        fc.status, 
        fc.language, 
        u.firstName AS farmerName, 
        cf.id AS officerId, 
        cf.firstNameEnglish AS officerName, 
        cc.centerName AS centerName
      FROM farmercomplains fc
      LEFT JOIN collectionofficer cf ON fc.coId = cf.id
      LEFT JOIN collectioncenter cc ON cf.centerId = cc.id
      LEFT JOIN users u ON fc.farmerId = u.id
      WHERE 1 = 1
    `;

    // Add filter for status
    if (status) {
      countSql += " AND fc.status = ? ";
      sql += " AND fc.status = ? ";
      Sqlparams.push(status);
      Counterparams.push(status);
    }

    // Add search functionality
    if (searchText) {
      countSql += `
        AND (fc.refNo LIKE ? OR cc.centerName LIKE ? OR u.firstName LIKE ? OR cf.firstNameEnglish LIKE ?)
      `;
      sql += `
        AND (fc.refNo LIKE ? OR cc.centerName LIKE ? OR u.firstName LIKE ? OR cf.firstNameEnglish LIKE ?)
      `;
      const searchQuery = `%${searchText}%`;
      Sqlparams.push(searchQuery, searchQuery, searchQuery, searchQuery);
      Counterparams.push(searchQuery, searchQuery, searchQuery, searchQuery);
    }

    // Add pagination
    sql += " LIMIT ? OFFSET ?";
    Sqlparams.push(parseInt(limit), parseInt(offset));

    // Execute count query to get total records
    db.query(countSql, Counterparams, (countErr, countResults) => {
      if (countErr) {
        return reject(countErr); // Handle count query error
      }

      const total = countResults[0]?.total || 0;

      // Execute main query to get paginated results
      db.query(sql, Sqlparams, (dataErr, results) => {
        if (dataErr) {
          return reject(dataErr); // Handle data query error
        }

        resolve({ results, total });
      });
    });
  });
};



exports.getComplainById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = ` 
    SELECT fc.id, fc.refNo, fc.createdAt, fc.status, fc.language, fc.complain, fc.reply, u.firstName AS farmerName, u.phoneNumber AS farmerPhone, c.firstNameEnglish as officerName, c.phoneNumber01 AS officerPhone, cc.centerName, cc.contact01 AS CollectionContact
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
    db.query(sql, [regCode], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};




exports.getAllCenterPage = (limit, offset, searchItem) => {
  return new Promise((resolve, reject) => {
    let countSql = "SELECT COUNT(*) as total FROM collectioncenter";
    let sql = "SELECT * FROM collectioncenter";
    const searchParams = [];
    const dataParams = [];

    if (searchItem) {
      console.log(searchItem);
      const searchQuery = `%${searchItem}%`;
      countSql += " WHERE regCode LIKE ? OR centerName LIKE ?";
      sql += " WHERE regCode LIKE ? OR centerName LIKE ?";
      searchParams.push(searchQuery, searchQuery);
    }

    sql += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    dataParams.push(...searchParams, limit, offset);

    // Count total matching records
    db.query(countSql, searchParams, (countErr, countResults) => {
      if (countErr) {
        return reject(countErr);
      }

      const total = countResults[0].total;

      // Fetch the paginated records
      db.query(sql, dataParams, (dataErr, dataResults) => {
        if (dataErr) {
          return reject(dataErr);
        }

        // Process results (no profileImage in collectioncenter schema)
        const processedDataResults = dataResults.map((center) => ({
          id: center.id,
          regCode: center.regCode,
          centerName: center.centerName,
          contact01: center.contact01,
          contact02: center.contact02,
          buildingNumber: center.buildingNumber,
          street: center.street,
          district: center.district,
          province: center.province,
          createdAt: center.createdAt,
        }));

        // Resolve with total count and processed results
        resolve({
          total: total,
          items: processedDataResults,
        });
      });
    });
  });
};


exports.getCenterByIdDAO = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM collectioncenter WHERE id = ?";
    db.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};


exports.updateCollectionCenter = (regCode, centerName, buildingNumber, street, district, province, collectionID) => {
  return new Promise((resolve, reject) => {
    const sql = `
    UPDATE collectioncenter SET 
      regCode = ?,
      centerName = ?,
      buildingNumber = ?,
      street = ?,
      district = ?,
      province  = ?
     WHERE id = ?
      `;

    const values = [regCode, centerName, buildingNumber, street, district, province, collectionID];

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



exports.sendComplainReply = (complainId, reply) => {
  return new Promise((resolve, reject) => {
    // Input validation
    if (!complainId) {
      return reject(new Error("Complain ID is required"));
    }

    if (reply === undefined || reply === null || reply.trim() === "") {
      return reject(new Error("Reply cannot be empty"));
    }

    const sql = `
      UPDATE farmercomplains 
      SET reply = ?, status = ? 
      WHERE id = ?
    `;

    const status = 'Answered';
    const values = [reply, status, complainId];

    db.query(sql, values, (err, results) => {
      if (err) {
        console.error("Database error details:", err);
        return reject(err);
      }

      if (results.affectedRows === 0) {
        console.warn(`No record found with id: ${complainId}`);
        return reject(new Error(`No record found with id: ${complainId}`));
      }

      console.log("Update successful:", results);
      resolve({
        message: "Reply sent successfully",
        affectedRows: results.affectedRows
      });
    });
  });
};





exports.getForCreateIdDao = (role) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT empId FROM collectionofficercompanydetails WHERE empId LIKE ? ORDER BY empId DESC LIMIT 1";
    db.query(sql, [`${role}%`], (err, results) => {
      if (err) {
        return reject(err);
      }
      
      if (results.length > 0) {
        const numericPart = parseInt(results[0].empId.substring(3), 10);
      
        const incrementedValue = numericPart + 1;
      
        results[0].empId = incrementedValue.toString().padStart(5, '0');
      }
      
      

      resolve(results);
    });
  });
};







exports.createCompany = async (
  regNumber,
  companyNameEnglish,
  companyNameSinhala,
  companyNameTamil,
  email,
  oicName,
  oicEmail,
  oicConCode1,
  oicConNum1,
  oicConCode2,
  oicConNum2,
  accHolderName,
  accNumber,
  bankName,
  branchName,
  foName,
  foConCode,
  foConNum,
  foEmail
) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO company (regNumber, companyNameEnglish, companyNameSinhala, companyNameTamil, email, oicName, oicEmail, oicConCode1, oicConNum1, oicConCode2, oicConNum2, accHolderName, accNumber, bankName, branchName, foName, foConCode, foConNum, foEmail) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const values = [
      regNumber,
      companyNameEnglish,
      companyNameSinhala,
      companyNameTamil,
      email,
      oicName,
      oicEmail,
      oicConCode1,
      oicConNum1,
      oicConCode2,
      oicConNum2,
      accHolderName,
      accNumber,
      bankName,
      branchName,
      foName,
      foConCode,
      foConNum,
      foEmail
    ];

    db.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};

exports.GetAllCompanyDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT c.companyNameEnglish, c.email, c.oicName, c.oicEmail, c.oicConCode1, c.oicConNum1, c.oicConCode2, c.oicConNum2  FROM company c";
    db.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};
