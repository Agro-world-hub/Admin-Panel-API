const {
  plantcare,
  collectionofficer,
  marketPlace,
  dash,
} = require("../startup/database");
const Joi = require("joi");

exports.addCollectionCenter = (
  regCode,
  centerName,
  contact01,
  contact02,
  buildingNumber,
  street,
  city,
  district,
  province,
  country,
  contact01Code,
  contact02Code,
  companies
) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO collectioncenter 
      (regCode, centerName,code1, contact01, code2, contact02, buildingNumber, street, city, district, province, country, companies) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`;

    const values = [
      regCode,
      centerName,
      contact01Code,
      contact01,
      contact02Code,
      contact02,
      buildingNumber,
      street,
      city,
      district,
      province,
      country,
      companies,
    ];

    collectionofficer.query(sql, values, (err, results) => {
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
    collectionofficer.query(sql, (err, results) => {
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
    collectionofficer.query(sql, [id], (err, results) => {
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
      LEFT JOIN plant_care.users u ON fc.farmerId = u.id
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
      LEFT JOIN plant_care.users u ON fc.farmerId = u.id
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
    collectionofficer.query(
      countSql,
      Counterparams,
      (countErr, countResults) => {
        if (countErr) {
          return reject(countErr); // Handle count query error
        }

        const total = countResults[0]?.total || 0;

        // Execute main query to get paginated results
        collectionofficer.query(sql, Sqlparams, (dataErr, results) => {
          if (dataErr) {
            return reject(dataErr); // Handle data query error
          }

          resolve({ results, total });
        });
      }
    );
  });
};

exports.getComplainById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = ` 
    SELECT fc.id, fc.refNo, fc.createdAt, fc.status, fc.language, fc.complain, fc.reply, u.firstName AS farmerName, u.phoneNumber AS farmerPhone, c.firstNameEnglish as officerName, c.phoneNumber01 AS officerPhone, cc.centerName, cc.contact01 AS CollectionContact
    FROM farmercomplains fc, collectionofficer c, plant_care.users u , collectioncenter cc
    WHERE fc.farmerId = u.id AND c.centerId = cc.id AND fc.coId = c.id AND fc.id = ? 
    `;
    collectionofficer.query(sql, [id], (err, results) => {
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
    collectionofficer.query(sql, [regCode], (err, results) => {
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
    collectionofficer.query(
      countSql,
      searchParams,
      (countErr, countResults) => {
        if (countErr) {
          return reject(countErr);
        }

        const total = countResults[0].total;

        // Fetch the paginated records
        collectionofficer.query(sql, dataParams, (dataErr, dataResults) => {
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
      }
    );
  });
};

exports.getCenterByIdDAO = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM collectioncenter WHERE id = ?";
    collectionofficer.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.updateCollectionCenter = (
  regCode,
  centerName,
  code1,
  contact01,
  code2,
  contact02,
  buildingNumber,
  street,
  city,
  district,
  province,
  country,
  companies,
  collectionID
) => {
  return new Promise((resolve, reject) => {
    const sql = `
    UPDATE collectioncenter SET 
      regCode = ?,
      centerName = ?,
      code1 = ?,
      contact01 = ?,
      code2 = ?,
      contact02 = ?,
      buildingNumber = ?,
      street = ?,
      city	 = ?,
      district = ?,
      province  = ?,
      country = ?,
      companies = ?
     WHERE id = ?
      `;

    const values = [
      regCode,
      centerName,
      code1,
      contact01,
      code2,
      contact02,
      buildingNumber,
      street,
      city,
      district,
      province,
      country,
      companies,
      collectionID,
    ];

    collectionofficer.query(sql, values, (err, results) => {
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

    const status = "Answered";
    const values = [reply, status, complainId];

    collectionofficer.query(sql, values, (err, results) => {
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
        affectedRows: results.affectedRows,
      });
    });
  });
};

exports.getForCreateId = (role) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT empId FROM collectionofficer WHERE empId LIKE ? ORDER BY empId DESC LIMIT 1";
    collectionofficer.query(sql, [`${role}%`], (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length > 0) {
        const numericPart = parseInt(results[0].empId.substring(3), 10);

        const incrementedValue = numericPart + 1;

        results[0].empId = incrementedValue.toString().padStart(5, "0");
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
      foEmail,
    ];

    collectionofficer.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};

exports.GetAllCompanyList = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, companyNameEnglish FROM company";
    collectionofficer.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.GetAllManagerList = (companyId, centerId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, firstNameEnglish, lastNameEnglish FROM collectionofficer WHERE companyId=? AND centerId=?";
    collectionofficer.query(sql,[companyId, centerId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.generateRegCode = (province, district, city, callback) => {
  // Generate the prefix based on province and district
  const prefix =
    province.slice(0, 2).toUpperCase() +
    district.slice(0, 1).toUpperCase() +
    city.slice(0, 1).toUpperCase();

  // SQL query to get the latest regCode
  const query = `SELECT regCode FROM collectioncenter WHERE regCode LIKE ? ORDER BY regCode DESC LIMIT 1`;

  // Execute the query
  collectionofficer.execute(query, [`${prefix}-%`], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return callback(err);
    }

    let newRegCode = `${prefix}-01`; // Default to 01 if no regCode found

    if (results.length > 0) {
      // Get the last regCode and extract the number
      const lastRegCode = results[0].regCode;
      const lastNumber = parseInt(lastRegCode.split("-")[1]);
      const newNumber = lastNumber + 1;
      newRegCode = `${prefix}-${String(newNumber).padStart(2, "0")}`;
    }

    // Return the new regCode
    callback(null, newRegCode);
  });
};

exports.getAllCompanyDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT c.id, c.companyNameEnglish, c.email, c.status, c.oicName, c.oicEmail, c.oicConCode1, c.oicConNum1, c.oicConCode2, c.oicConNum2, co.jobRole, COUNT(co.jobRole) as jobRoleCount FROM company c LEFT JOIN collectionofficer co ON c.id = co.companyId GROUP BY  c.id, co.jobRole`;
    collectionofficer.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.getCompanyDAO = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM company WHERE id = ?`; 
    collectionofficer.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err); 
      }
      resolve(results);
    });
  });
};


exports.updateCompany = (
  id,
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
  foEmail,
  status
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE company SET 
        regNumber = ?,
        companyNameEnglish = ?,
        companyNameSinhala = ?,
        companyNameTamil = ?,
        email = ?,
        oicName = ?,
        oicEmail = ?,
        oicConCode1 = ?,
        oicConNum1 = ?,
        oicConCode2 = ?,
        oicConNum2 = ?,
        accHolderName = ?,
        accNumber = ?,
        bankName = ?,
        branchName = ?,
        foName = ?,
        foConCode = ?,
        foConNum = ?,
        foEmail = ?,
        status = ?
      WHERE id = ?
    `;

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
      foEmail,
      status,
      id,
    ];

    collectionofficer.query(sql, values, (err, results) => {
      if (err) {
        console.error("Database error details:", err);
        return reject(err);
      }
      console.log("Update successful:", results);
      resolve(results);
    });
  });
};

exports.deleteCompanyById = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM company WHERE id = ?";
    collectionofficer.query(sql, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows); // Return the number of affected rows
      }
    });
  });
};

