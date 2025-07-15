const {
  admin,
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
  contact02Code
) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO collectioncenter 
      (regCode, centerName,code1, contact01, code2, contact02, buildingNumber, street, city, district, province, country) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`;

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

exports.addCompaniesToCenter = (centerId, companies) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO companycenter (centerId, companyId) VALUES (?, ?)`;

    companies.forEach((companyId) => {
      const values = [centerId, companyId];
      collectionofficer.query(sql, values, (err, results) => {
        if (err) {
          console.error("Error associating company with center:", err);
          return reject(err);
        }
        console.log("Company associated successfully:", results);
      });
    });

    resolve();
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

exports.GetCentersByCompanyIdDAO = (companyId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT c.* 
      FROM collectioncenter c
      JOIN companycenter cc ON c.id = cc.centerId
      WHERE cc.companyId = ?
    `;
    collectionofficer.query(sql, [companyId], (err, results) => {
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

// exports.GetAllComplainDAO = (page, limit, status,category, searchText) => {
//   return new Promise((resolve, reject) => {
//     const Sqlparams = [];
//     const Counterparams = [];
//     const offset = (page - 1) * limit;

//     // SQL to count total records
//     let countSql = `
//       SELECT COUNT(*) AS total
//       FROM farmercomplains fc
//       LEFT JOIN plant_care.users u ON fc.farmerId = u.id
//       LEFT JOIN agro_world_admin.complaincategory cc ON fc.complainCategory = cc.id
//       LEFT JOIN agro_world_admin.adminroles ar ON cc.roleId = ar.id
//       WHERE 1 = 1
//     `;

//     // SQL to fetch paginated data
//     let sql = `
//       SELECT
//         fc.id,
//         fc.refNo,
//         u.NICnumber AS NIC,
//         u.firstName AS farmerName,
//         u.lastName AS lastName,
//         cc.categoryEnglish AS complainCategory,
//         ar.role,
//         fc.createdAt,
//         fc.adminStatus AS status,
//         fc.reply
//       FROM farmercomplains fc
//       LEFT JOIN plant_care.users u ON fc.farmerId = u.id
//       LEFT JOIN agro_world_admin.complaincategory cc ON fc.complainCategory = cc.id
//       LEFT JOIN agro_world_admin.adminroles ar ON cc.roleId = ar.id
//       WHERE 1 = 1
//     `;

//     // Add filter for status
//     if (status) {
//       countSql += " AND fc.adminStatus = ? ";
//       sql += " AND fc.adminStatus = ? ";
//       Sqlparams.push(status);
//       Counterparams.push(status);
//     }

//     if (category) {
//       countSql += " AND ar.role = ? ";  // Referencing ar.role now works
//       sql += " AND ar.role = ? ";
//       Sqlparams.push(category);
//       Counterparams.push(category);
//     }

//     // Add search functionality
//     if (searchText) {
//       countSql += `
//         AND (fc.refNo LIKE ?  OR u.firstName LIKE ?)
//       `;
//       sql += `
//         AND (fc.refNo LIKE ? OR u.firstName LIKE ?)
//       `;
//       const searchQuery = `%${searchText}%`;
//       Sqlparams.push(searchQuery, searchQuery, searchQuery, searchQuery);
//       Counterparams.push(searchQuery, searchQuery, searchQuery, searchQuery);
//     }

//     // Add pagination
//     sql += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
//     Sqlparams.push(parseInt(limit), parseInt(offset));

//     // Execute count query to get total records
//     collectionofficer.query(
//       countSql,
//       Counterparams,
//       (countErr, countResults) => {
//         if (countErr) {
//           return reject(countErr); // Handle count query error
//         }

//         const total = countResults[0]?.total || 0;

//         // Execute main query to get paginated results
//         collectionofficer.query(sql, Sqlparams, (dataErr, results) => {
//           if (dataErr) {
//             return reject(dataErr); // Handle data query error
//           }

//           resolve({ results, total });
//         });
//       }
//     );
//   });
// };

exports.GetAllComplainDAO = (
  page,
  limit,
  status,
  category,
  comCategory,
  searchText,
  rpstatus
) => {
  return new Promise((resolve, reject) => {
    const Sqlparams = [];
    const Counterparams = [];
    const offset = (page - 1) * limit;

    // SQL to count total records - Added missing JOINs
    let countSql = `
      SELECT COUNT(*) AS total
      FROM farmercomplains fc
      LEFT JOIN plant_care.users u ON fc.farmerId = u.id
      LEFT JOIN agro_world_admin.complaincategory cc ON fc.complainCategory = cc.id
      LEFT JOIN agro_world_admin.adminroles ar ON cc.roleId = ar.id
      WHERE 1 = 1
    `;

    // SQL to fetch paginated data
    let sql = `
      SELECT 
        fc.id, 
        fc.refNo,
        u.NICnumber AS NIC,
        u.firstName AS farmerName,
        u.lastName AS lastName,
        u.language AS language,
        cc.categoryEnglish AS complainCategory,
        ar.role,
        fc.createdAt,
        fc.adminStatus AS status,
        fc.reply
      FROM farmercomplains fc
      LEFT JOIN plant_care.users u ON fc.farmerId = u.id
      LEFT JOIN agro_world_admin.complaincategory cc ON fc.complainCategory = cc.id
      LEFT JOIN agro_world_admin.adminroles ar ON cc.roleId = ar.id
      WHERE 1 = 1
    `;

    // Add filter for status
    if (status) {
      countSql += " AND fc.adminStatus = ? ";
      sql += " AND fc.adminStatus = ? ";
      Sqlparams.push(status);
      Counterparams.push(status);
    }

    // Fixed category filter to use the correct alias
    if (category) {
      countSql += " AND ar.role = ? ";
      sql += " AND ar.role = ? ";
      Sqlparams.push(category);
      Counterparams.push(category);
    }

    if (comCategory) {
      countSql += " AND fc.complainCategory = ? ";
      sql += " AND fc.complainCategory = ? ";
      Sqlparams.push(comCategory);
      Counterparams.push(comCategory);
    }

    // Add search functionality
    if (searchText) {
      countSql += `
        AND (fc.refNo LIKE ? OR u.firstName LIKE ? OR u.lastName LIKE ? OR u.NICnumber LIKE ?)
      `;
      sql += `
        AND (fc.refNo LIKE ? OR u.firstName LIKE ? OR u.lastName LIKE ? OR u.NICnumber LIKE ?)
      `;
      const searchQuery = `%${searchText}%`;
      Sqlparams.push(searchQuery, searchQuery, searchQuery, searchQuery);
      Counterparams.push(searchQuery, searchQuery, searchQuery, searchQuery);
    }

    if (rpstatus) {
      if (rpstatus === "Yes") {
        countSql += " AND fc.reply IS NOT NULL ";
        sql += " AND fc.reply IS NOT NULL ";
      } else {
        countSql += " AND fc.reply IS NULL ";
        sql += " AND fc.reply IS NULL ";
      }
    }

    // Add pagination
    sql += " ORDER BY fc.createdAt DESC LIMIT ? OFFSET ?";
    Sqlparams.push(parseInt(limit), parseInt(offset));

    // Execute count query to get total records
    collectionofficer.query(
      countSql,
      Counterparams,
      (countErr, countResults) => {
        if (countErr) {
          return reject(countErr);
        }

        const total = countResults[0]?.total || 0;

        // Execute main query to get paginated results
        collectionofficer.query(sql, Sqlparams, (dataErr, results) => {
          if (dataErr) {
            return reject(dataErr);
          }

          resolve({ results, total });
        });
      }
    );
  });
};

exports.GetAllCenterComplainDAO = (
  page,
  limit,
  status,
  category,
  comCategory,
  filterCompany,
  searchText,
  rpstatus
) => {
  return new Promise((resolve, reject) => {
    const Sqlparams = [];
    const Counterparams = [];
    const offset = (page - 1) * limit;

    // SQL to count total records - Added missing JOINs
    let countSql = `
      SELECT COUNT(*) AS total
      FROM officercomplains oc
      LEFT JOIN collectionofficer co ON oc.officerId = co.id
      LEFT JOIN agro_world_admin.complaincategory cc ON oc.complainCategory = cc.id
      LEFT JOIN  company c ON co.companyId = c.id
      LEFT JOIN  collectioncenter coc ON co.centerId = coc.id
      LEFT JOIN agro_world_admin.adminroles ar ON cc.roleId = ar.id
      WHERE complainAssign = 'Admin'
    `;

    // SQL to fetch paginated data
    let sql = `
      SELECT 
        oc.id, 
        oc.refNo,
        co.empId AS empId,
        co.firstNameEnglish AS officerName,
        c.companyNameEnglish AS companyName,
        cc.categoryEnglish AS complainCategory,
        ar.role,
        oc.createdAt,
        oc.complain,
        oc.AdminStatus AS status,
        oc.reply,
        coc.regCode
      FROM officercomplains oc
     LEFT JOIN collectionofficer co ON oc.officerId = co.id
      LEFT JOIN agro_world_admin.complaincategory cc ON oc.complainCategory = cc.id
      LEFT JOIN  company c ON co.companyId = c.id
      LEFT JOIN  collectioncenter coc ON co.centerId = coc.id
      LEFT JOIN agro_world_admin.adminroles ar ON cc.roleId = ar.id
      WHERE complainAssign = 'Admin'
    `;

    // Add filter for status
    if (status) {
      countSql += " AND oc.AdminStatus = ? ";
      sql += " AND oc.AdminStatus = ? ";
      Sqlparams.push(status);
      Counterparams.push(status);
    }

    // Fixed category filter to use the correct alias
    if (category) {
      countSql += " AND ar.role = ? ";
      sql += " AND ar.role = ? ";
      Sqlparams.push(category);
      Counterparams.push(category);
    }

    if (comCategory) {
      countSql += " AND oc.complainCategory = ? ";
      sql += " AND oc.complainCategory = ? ";
      Sqlparams.push(comCategory);
      Counterparams.push(comCategory);
    }

    if (filterCompany) {
      countSql += " AND c.id = ? ";
      sql += " AND c.id = ? ";
      Sqlparams.push(filterCompany);
      Counterparams.push(filterCompany);
    }

    // Add search functionality
    if (searchText) {
      countSql += `
        AND (oc.refNo LIKE ? OR co.empId LIKE ? OR coc.regCode LIKE ?)
      `;
      sql += `
        AND (oc.refNo LIKE ? OR co.empId LIKE ? OR coc.regCode LIKE ?)
      `;
      const searchQuery = `%${searchText}%`;
      Sqlparams.push(searchQuery, searchQuery);
      Counterparams.push(searchQuery, searchQuery);
    }

    if (rpstatus) {
      if (rpstatus === "Yes") {
        countSql += " AND oc.reply IS NOT NULL ";
        sql += " AND oc.reply IS NOT NULL ";
      } else {
        countSql += " AND oc.reply IS NULL ";
        sql += " AND oc.reply IS NULL ";
      }
    }

    // Add pagination
    sql += " ORDER BY oc.createdAt DESC LIMIT ? OFFSET ?";
    Sqlparams.push(parseInt(limit), parseInt(offset));

    // Execute count query to get total records
    collectionofficer.query(
      countSql,
      Counterparams,
      (countErr, countResults) => {
        if (countErr) {
          return reject(countErr);
        }

        const total = countResults[0]?.total || 0;

        // Execute main query to get paginated results
        collectionofficer.query(sql, Sqlparams, (dataErr, results) => {
          if (dataErr) {
            return reject(dataErr);
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
    SELECT fc.id, fc.refNo, fc.createdAt, fc.language, fc.complain,fc.complainCategory,fc.reply, u.firstName AS firstName, u.lastName AS lastName, u.phoneNumber AS farmerPhone, cc.categoryEnglish AS complainCategory
    FROM farmercomplains fc
    LEFT JOIN plant_care.users u ON fc.farmerId = u.id
    LEFT JOIN agro_world_admin.complaincategory cc ON fc.complainCategory = cc.id
    WHERE fc.id = ? 
    `;
    collectionofficer.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.getCenterComplainById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = ` 
    SELECT oc.id, oc.refNo, oc.createdAt, oc.language, oc.complain, oc.complainCategory, oc.reply, cof.firstNameEnglish AS firstName, cof.lastNameEnglish AS lastName, cof.phoneCode01, cof.phoneNumber01,  cc.categoryEnglish AS complainCategory, cof.empId AS empId, cof.jobRole AS jobRole
    FROM officercomplains oc
    LEFT JOIN collectionofficer cof ON oc.officerId = cof.id
    LEFT JOIN agro_world_admin.complaincategory cc ON oc.complainCategory = cc.id
    WHERE oc.id = ? 
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

exports.getAllCenterPage = (limit, offset, district, province, searchItem) => {
  return new Promise((resolve, reject) => {
    let countSql = "SELECT COUNT(*) as total FROM collectioncenter C";
    let sql = `
      SELECT 
          C.id,
          C.regCode,
          C.centerName,
          C.code1,
          C.contact01,
          C.code2,
          C.contact02,
          C.buildingNumber,
          C.street,
          C.city,
          C.district,
          C.province,
          C.country,
          (
              SELECT GROUP_CONCAT(
                  CONCAT(COM.id, ':', COM.companyNameEnglish) SEPARATOR '; '
              )
              FROM company COM
              JOIN companycenter CMC ON CMC.companyId = COM.id
              WHERE CMC.centerId = C.id
          ) AS companies
      FROM collectioncenter C
    `;

    let whereClause = " WHERE 1=1";
    const searchParams = [];

    if (searchItem) {
      const searchQuery = `%${searchItem}%`;
      whereClause += " AND (C.regCode LIKE ? OR C.centerName LIKE ?)";
      searchParams.push(searchQuery, searchQuery);
    }

    if (district) {
      whereClause += " AND C.district = ?";
      searchParams.push(district);
    }

    if (province) {
      whereClause += " AND C.province = ?";
      searchParams.push(province);
    }

    // Add where clause to both count and main SQL
    countSql += whereClause;
    sql += whereClause + " ORDER BY C.regCode ASC LIMIT ? OFFSET ?";
    const dataParams = [...searchParams, limit, offset];

    collectionofficer.query(
      countSql,
      searchParams,
      (countErr, countResults) => {
        if (countErr) {
          return reject(countErr);
        }

        const total = countResults[0].total;

        collectionofficer.query(sql, dataParams, (dataErr, dataResults) => {
          if (dataErr) {
            return reject(dataErr);
          }

          const processedDataResults = dataResults.map((center) => ({
            ...center,
            companies: center.companies
              ? center.companies.split("; ").map((company) => {
                const [id, name] = company.split(":");
                return { id: parseInt(id, 10), companyNameEnglish: name };
              })
              : [],
          }));

          resolve({
            total: total,
            items: processedDataResults,
          });
        });
      }
    );
  });
};

// exports.getCenterByIdDAO = (id) => {
//   return new Promise((resolve, reject) => {
//     const sql = "SELECT *,  FROM collectioncenter JOIN  WHERE id = ?";
//     collectionofficer.query(sql, [id], (err, results) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve(results);
//     });
//   });
// };

exports.getCenterByIdDAO = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        c.*, 
        GROUP_CONCAT(co.companyNameEnglish) AS companies
      FROM collectioncenter c
      LEFT JOIN companycenter cc ON c.id = cc.centerId
      LEFT JOIN company co ON cc.companyId = co.id
      WHERE c.id = ?
      GROUP BY c.id
    `;

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
      country = ?
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

exports.deleteCompaniesFromCompanyCenter = (collectionID) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM companycenter WHERE centerId = ?";
    collectionofficer.query(sql, [collectionID], (err, results) => {
      if (err) {
        console.error("Error deleting companies from companycenter:", err);
        return reject(err);
      }
      console.log(
        "Deleted companies successfully from companycenter:",
        results
      );
      resolve(results);
    });
  });
};

exports.insertCompaniesIntoCompanyCenter = (companyIds, collectionID) => {
  return new Promise((resolve, reject) => {
    const values = companyIds.map((companyId) => [collectionID, companyId]);
    const sql = "INSERT INTO companycenter (centerId, companyId) VALUES ?";

    collectionofficer.query(sql, [values], (err, results) => {
      if (err) {
        console.error("Error inserting companies into companycenter:", err);
        return reject(err);
      }
      console.log(
        "Inserted companies successfully into companycenter:",
        results
      );
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
      SET reply = ?, status = ?, adminStatus = ? 
      WHERE id = ?
    `;

    const status = "Closed";
    const adminStatus = "Closed";
    const values = [reply, status, adminStatus, complainId];

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

exports.sendCenterComplainReply = (complainId, reply) => {
  return new Promise((resolve, reject) => {
    // Input validation
    if (!complainId) {
      return reject(new Error("Complain ID is required"));
    }

    if (reply === undefined || reply === null || reply.trim() === "") {
      return reject(new Error("Reply cannot be empty"));
    }

    const sql = `
      UPDATE officercomplains 
      SET reply = ?, COOStatus = ?, CCMStatus = ? , CCHStatus = ? , AdminStatus = ?
      WHERE id = ?
    `;

    const status = "Closed";
    const adminStatus = "Closed";
    const values = [reply, status, status, status, status, complainId];

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
  foEmail,
  logo,
  favicon,
  companyType
) => {
  return new Promise((resolve, reject) => {
    let sql;
    if (companyType === 'distribution') {
      sql =
        "INSERT INTO company (regNumber, companyNameEnglish, companyNameSinhala, companyNameTamil, email, oicName, oicEmail, oicConCode1, oicConNum1, oicConCode2, oicConNum2, accHolderName, accNumber, bankName, branchName, foName, foConCode, foConNum, foEmail, logo, favicon, isDistributed) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 1)";
    } else {
      sql =
        "INSERT INTO company (regNumber, companyNameEnglish, companyNameSinhala, companyNameTamil, email, oicName, oicEmail, oicConCode1, oicConNum1, oicConCode2, oicConNum2, accHolderName, accNumber, bankName, branchName, foName, foConCode, foConNum, foEmail, logo, favicon, isCollection) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 1)";

    }
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
      logo,
      favicon,
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
    const sql = "SELECT id, companyNameEnglish FROM company WHERE company.isCollection = true";
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
    const sql =
      "SELECT id, firstNameEnglish, lastNameEnglish FROM collectionofficer WHERE companyId=? AND centerId=?";
    collectionofficer.query(sql, [companyId, centerId], (err, results) => {
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

// exports.getAllCompanyDAO = () => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//       SELECT
//         c.companyNameEnglish AS companyName,
//         c.email AS companyEmail,
//         c.status,
//         SUM(CASE WHEN co.jobRole = 'Collection Center Head' THEN 1 ELSE 0 END) AS numOfHeads,
//         SUM(CASE WHEN co.jobRole = 'Collection Center Manager' THEN 1 ELSE 0 END) AS numOfManagers,
//         SUM(CASE WHEN co.jobRole = 'Collection Officer' THEN 1 ELSE 0 END) AS numOfOfficers
//       FROM
//         company c
//       LEFT JOIN
//         collectionofficer co
//       ON
//         c.id = co.companyId
//       GROUP BY
//         c.id
//     `;
//     collectionofficer.query(sql, (err, results) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve(results);
//     });
//   });
// };

exports.getAllCompanyDAO = (search) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT 
        c.id,
        c.companyNameEnglish AS companyName,
        c.email AS companyEmail,
        c.status,
        SUM(CASE WHEN co.jobRole = 'Collection Center Head' THEN 1 ELSE 0 END) AS numOfHead,
        SUM(CASE WHEN co.jobRole = 'Collection Center Manager' THEN 1 ELSE 0 END) AS numOfManagers,
        SUM(CASE WHEN co.jobRole = 'Collection Officer' THEN 1 ELSE 0 END) AS numOfOfficers,
        SUM(CASE WHEN co.jobRole = 'Customer Officer' THEN 1 ELSE 0 END) AS numOfCustomerOfficers,
        (
          SELECT 
            COUNT(*) 
          FROM 
            companycenter cc 
          WHERE 
            c.id = cc.companyId
        ) AS numOfCenters
      FROM 
        company c
      LEFT JOIN 
        collectionofficer co 
      ON 
        c.id = co.companyId
      WHERE c.isCollection = true
    `;
    const params = [];

    if (search) {
      sql += " WHERE c.companyNameEnglish LIKE ?";
      const searchQuery = `%${search}%`;
      params.push(searchQuery);
    }

    sql += " GROUP BY c.id ORDER BY companyName ASC";

    collectionofficer.query(sql, params, (err, results) => {
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
  status,
  logo,
  favicon
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
        status = ?,
        logo = ?,
      favicon = ?
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
      logo,
      favicon,
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

exports.getAllCropNameDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `
          SELECT cg.id AS cropId, cv.id AS varietyId, cg.cropNameEnglish, cv.varietyNameEnglish AS varietyEnglish 
          FROM cropvariety cv, cropgroup cg
          WHERE cg.id = cv.cropGroupId
      `;

    plantcare.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }

      const groupedData = {};

      results.forEach((item) => {
        const { cropNameEnglish, varietyEnglish, varietyId, cropId } = item;

        if (!groupedData[cropNameEnglish]) {
          groupedData[cropNameEnglish] = {
            cropId: cropId,
            variety: [],
          };
        }

        groupedData[cropNameEnglish].variety.push({
          id: varietyId,
          varietyEnglish: varietyEnglish,
        });
      });

      const formattedResult = Object.keys(groupedData).map((cropName) => ({
        cropId: groupedData[cropName].cropId,
        cropNameEnglish: cropName,
        variety: groupedData[cropName].variety,
      }));

      resolve(formattedResult);
    });
  });
};

exports.createDailyTargetDao = (target) => {
  return new Promise((resolve, reject) => {
    const sql = `
         INSERT INTO dailytarget (centerId, companyId, fromDate, toDate, fromTime, toTime)
         VALUES (?, ?, ?, ?, ?, ?)
      `;
    collectionofficer.query(
      sql,
      [
        parseInt(target.centerId),
        parseInt(target.companyId),
        target.fromDate,
        target.toDate,
        target.fromTime,
        target.toTime,
      ],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results.insertId);
      }
    );
  });
};

exports.createDailyTargetItemsDao = (data, targetId) => {
  return new Promise((resolve, reject) => {
    const sql = `
         INSERT INTO dailytargetitems (targetId, varietyId, qtyA, qtyB, qtyC)
         VALUES (?, ?, ?, ?, ?)
      `;
    collectionofficer.query(
      sql,
      [parseInt(targetId), data.varietyId, data.qtyA, data.qtyB, data.qtyC],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results.insertId);
      }
    );
  });
};

exports.getTransactionCountDao = (centerId) => {
  return new Promise((resolve, reject) => {
    const sql = `
          SELECT COUNT(RFP.id) AS transactionCount
          FROM registeredfarmerpayments RFP, collectionofficer COF
          WHERE DATE(RFP.createdAt) = '2024-12-31' AND RFP.collectionOfficerId = COF.id AND COF.centerId = ?
          GROUP BY DATE(RFP.createdAt);

      `;
    collectionofficer.query(sql, [centerId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results[0]);
    });
  });
};

exports.getTransactionAmountCountDao = (centerId) => {
  return new Promise((resolve, reject) => {
    const sql = `
          SELECT SUM(gradeAprice)+SUM(gradeBprice)+SUM(gradeCprice) AS transAmountCount
          FROM registeredfarmerpayments RFP, farmerpaymentscrops FPC, collectionofficer COF
          WHERE DATE(RFP.createdAt) = '2024-12-31' AND RFP.collectionOfficerId = COF.id AND RFP.id = FPC.registerFarmerId AND COF.centerId = ?
          GROUP BY DATE(RFP.createdAt);

      `;
    collectionofficer.query(sql, [centerId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results[0]);
    });
  });
};

exports.getReseantCollectionDao = (centerId) => {
  return new Promise((resolve, reject) => {
    const sql = `
          SELECT CG.cropNameEnglish, CV.varietyNameEnglish, 
                 SUM(FPC.gradeAprice) AS totAprice, SUM(FPC.gradeBprice) AS totBprice, SUM(FPC.gradeCprice) AS totCprice, 
                 SUM(FPC.gradeAquan) AS totAqty, SUM(FPC.gradeBquan) AS totBqty, SUM(FPC.gradeCquan) AS totCqty, 
                 DATE(RFP.createdAt) AS date 
          FROM registeredfarmerpayments RFP
          JOIN farmerpaymentscrops FPC ON RFP.id = FPC.registerFarmerId
          JOIN collectionofficer COF ON RFP.collectionOfficerId = COF.id
          JOIN plant_care.cropvariety CV ON FPC.cropId = CV.id
          JOIN plant_care.cropgroup CG ON CV.cropGroupId = CG.id
          WHERE DATE(RFP.createdAt) = '2024-12-31' 
          AND COF.centerId = ?
          GROUP BY CG.cropNameEnglish, CV.varietyNameEnglish, DATE(RFP.createdAt)
          ORDER BY DATE(RFP.createdAt)
          LIMIT 5
      `;

    collectionofficer.query(sql, [centerId], (err, results) => {
      if (err) {
        return reject(err);
      }

      // Corrected transformation of data
      const transformData = results.flatMap((item) => {
        const entries = [];

        if (item.totAqty !== undefined) {
          entries.push({
            cropNameEnglish: item.cropNameEnglish,
            varietyNameEnglish: item.varietyNameEnglish,
            totPrice: item.totAprice,
            totQty: item.totAqty,
            grade: "A",
            date: item.date,
          });
        }

        if (item.totBqty !== undefined) {
          entries.push({
            cropNameEnglish: item.cropNameEnglish,
            varietyNameEnglish: item.varietyNameEnglish,
            totPrice: item.totBprice,
            totQty: item.totBqty,
            grade: "B",
            date: item.date,
          });
        }

        if (item.totCqty !== undefined) {
          entries.push({
            cropNameEnglish: item.cropNameEnglish,
            varietyNameEnglish: item.varietyNameEnglish,
            totPrice: item.totCprice,
            totQty: item.totCqty,
            grade: "C",
            date: item.date,
          });
        }

        return entries;
      });

      resolve(transformData);
    });
  });
};

exports.getTotExpencesDao = (centerId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
          SUM(FPC.gradeAprice) + SUM(FPC.gradeBprice) + SUM(FPC.gradeCprice) AS totExpences
      FROM registeredfarmerpayments RFP
      JOIN farmerpaymentscrops FPC ON RFP.id = FPC.registerFarmerId
      JOIN collectionofficer COF ON RFP.collectionOfficerId = COF.id
      WHERE RFP.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
      AND COF.centerId = ?
      `;
    collectionofficer.query(sql, [centerId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results[0]);
    });
  });
};

exports.differenceBetweenExpences = (centerId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
          YEAR(RFP.createdAt) AS year,
          MONTH(RFP.createdAt) AS month,
          SUM(FPC.gradeAprice) + SUM(FPC.gradeBprice) + SUM(FPC.gradeCprice) AS monthexpences
      FROM registeredfarmerpayments RFP
      JOIN farmerpaymentscrops FPC ON RFP.id = FPC.registerFarmerId
      JOIN collectionofficer COF ON RFP.collectionOfficerId = COF.id
      WHERE COF.centerId = ?
      GROUP BY YEAR(RFP.createdAt), MONTH(RFP.createdAt)
      ORDER BY YEAR(RFP.createdAt) DESC, MONTH(RFP.createdAt) DESC
      LIMIT 2;
      `;
    collectionofficer.query(sql, [centerId], (err, results) => {
      if (err) {
        return reject(err);
      }

      let roundedDifExpences = 100;

      if (results.length < 2) {
        // return reject(new Error("Not enough data to compare two months."));
        return resolve(roundedDifExpences);
      }

      const difExpences =
        ((results[0].monthexpences - results[1].monthexpences) /
          results[0].monthexpences) *
        100;
      roundedDifExpences = parseFloat(difExpences.toFixed(2));

      resolve(roundedDifExpences);
    });
  });
};

exports.getCenterNameAndOficerCountDao = (centerId) => {
  return new Promise((resolve, reject) => {
    const sql = `
         SELECT CC.id, CC.centerName, COUNT(COF.id) AS officerCount
         FROM collectioncenter CC, collectionofficer COF
         WHERE CC.id = ? AND CC.id = COF.centerId AND COF.companyId = 1
         GROUP BY CC.id, CC.centerName
      `;
    collectionofficer.query(sql, [centerId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results[0]);
    });
  });
};

exports.getcompanyHeadData = (companyId, limit, offset, searchText) => {
  return new Promise((resolve, reject) => {
    let countSql = `
      SELECT COUNT(*) AS total 
      FROM collectionofficer
      WHERE companyId = ? AND jobRole = 'Collection Center Head'
    `;

    let dataSql = `
      SELECT 
        collectionofficer.id,
        collectionofficer.empId,
        collectionofficer.firstNameEnglish,
        collectionofficer.lastNameEnglish,
        collectionofficer.email,
        collectionofficer.status,
        collectionofficer.phoneCode01,
        collectionofficer.phoneNumber01,
        collectionofficer.phoneCode02,
        collectionofficer.phoneNumber02,
        collectionofficer.createdAt
      FROM 
        collectionofficer
      WHERE companyId = ? AND jobRole = 'Collection Center Head'
    `;

    const countParams = [companyId];
    const dataParams = [companyId];

    if (searchText) {
      const searchCondition = `
          AND (
            collectionofficer.empID LIKE ?
              OR collectionofficer.firstNameEnglish LIKE ?
              OR collectionofficer.lastNameEnglish LIKE ?
              OR collectionofficer.email LIKE ?
              OR collectionofficer.status LIKE ?
              OR collectionofficer.phoneNumber01 LIKE ?
              OR collectionofficer.phoneNumber02 LIKE ?
              OR collectionofficer.createdAt LIKE ?
          )
      `;
      countSql += searchCondition;
      dataSql += searchCondition;
      const searchValue = `%${searchText}%`;
      countParams.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
      dataParams.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    limit = parseInt(limit, 10) || 10; // Default limit to 10 if not provided
    offset = parseInt(offset, 10) || 0; // Default offset to 0 if not provided

    // Add ORDER BY before LIMIT
    dataSql += ` ORDER BY collectionofficer.createdAt DESC LIMIT ? OFFSET ?`;
    dataParams.push(limit, offset);

    collectionofficer.query(countSql, countParams, (countErr, countResults) => {
      if (countErr) {
        reject(countErr);
      } else {
        collectionofficer.query(dataSql, dataParams, (dataErr, dataResults) => {
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

exports.deleteCompanyHeadData = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM collectionofficer WHERE id = ?";
    collectionofficer.query(sql, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows);
      }
    });
  });
};

exports.GetComplainCategoriesByRole = (roleId, appId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT id, categoryEnglish FROM complaincategory WHERE roleId=? AND appId=?";
    admin.query(sql, [roleId, appId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.GetComplainCategoriesByRoleSuper = (appId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT id, categoryEnglish FROM complaincategory WHERE appId=?";
    admin.query(sql, [appId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.GetAllCompanyForOfficerComplain = () => {
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

exports.getAllCenterPageAW = (
  limit,
  offset,
  district,
  province,
  searchItem,
  companyId
) => {
  return new Promise((resolve, reject) => {
    let countSql = "SELECT COUNT(*) as total FROM collectioncenter C";
    let sql = `
      SELECT 
          C.id,
          C.regCode,
          C.centerName,
          C.code1,
          C.contact01,
          C.code2,
          C.contact02,
          C.buildingNumber,
          C.street,
          C.city,
          C.district,
          C.province,
          C.country,
          (
              SELECT GROUP_CONCAT(
                  CONCAT(COM.id, ':', COM.companyNameEnglish) SEPARATOR '; '
              )
              FROM company COM
              JOIN companycenter CMC ON CMC.companyId = COM.id
              WHERE CMC.centerId = C.id
          ) AS companies
      FROM collectioncenter C
    `;

    const searchParams = [];
    const dataParams = [];

    // Add JOIN with companycenter when filtering by companyId
    if (companyId) {
      countSql +=
        " JOIN companycenter CMC ON C.id = CMC.centerId WHERE CMC.companyId = ?";
      sql +=
        " JOIN companycenter CMC ON C.id = CMC.centerId WHERE CMC.companyId = ?";
      searchParams.push(companyId);

      // If we also have a search term, use AND instead of WHERE
      if (searchItem) {
        const searchQuery = `%${searchItem}%`;
        countSql += " AND (C.regCode LIKE ? OR C.centerName LIKE ?)";
        sql += " AND (C.regCode LIKE ? OR C.centerName LIKE ?)";
        searchParams.push(searchQuery, searchQuery);
      }

      if (district) {
        countSql += " AND C.district LIKE ? ";
        sql += " AND C.district LIKE ? ";
        // countParams.push(district);
        searchParams.push(district);
      }

      if (province) {
        countSql += " AND C.province LIKE ? ";
        sql += " AND C.province LIKE ? ";
        // countParams.push(district);
        searchParams.push(province);
      }
    } else {
      let whereClause = " WHERE 1=1";

      if (searchItem) {
        // Only searchItem, no companyId
        const searchQuery = `%${searchItem}%`;
        whereClause += " AND C.regCode LIKE ? OR C.centerName LIKE ?";
        countSql += whereClause;
        sql += whereClause;
        searchParams.push(searchQuery, searchQuery);
      }

      if (district) {
        whereClause += " AND C.district LIKE ? ";
        countSql += whereClause;
        sql += whereClause;
        // countParams.push(district);
        searchParams.push(district);
      }

      if (province) {
        whereClause += " AND C.province LIKE ? ";
        countSql += whereClause;
        sql += whereClause;
        // countParams.push(district);
        searchParams.push(province);
      }
    }

    sql += " GROUP BY C.id ORDER BY C.regCode ASC LIMIT ? OFFSET ?";
    dataParams.push(...searchParams, limit, offset);

    collectionofficer.query(
      countSql,
      searchParams,
      (countErr, countResults) => {
        if (countErr) {
          return reject(countErr);
        }

        const total = countResults[0].total;

        collectionofficer.query(sql, dataParams, (dataErr, dataResults) => {
          if (dataErr) {
            return reject(dataErr);
          }

          const processedDataResults = dataResults.map((center) => ({
            ...center,
            companies: center.companies
              ? center.companies.split("; ").map((company) => {
                const [id, name] = company.split(":");
                return { id: parseInt(id, 10), companyNameEnglish: name };
              })
              : [],
          }));

          resolve({
            total: total,
            items: processedDataResults,
          });
        });
      }
    );
  });
};
