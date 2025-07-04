const {
  plantcare,
  collectionofficer,
  marketPlace,
  dash,
} = require("../startup/database");
const { error } = require("console");
const Joi = require("joi");
const path = require("path");

exports.createDistributionCenter = (data) => {
  return new Promise((resolve, reject) => {
    const sql1 = `
      INSERT INTO distributedcenter 
      (centerName, OfficerName, contact01, code1, contact02, code2, latitude, longitude, email, country, province, district, city)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values1 = [
      data.name,
      data.officerInCharge,
      data.contact1,
      data.contact1Code,
      data.contact2,
      data.contact2Code,
      data.latitude,
      data.longitude,
      data.email,
      data.country,
      data.province,
      data.district,
      data.city,
    ];

    // First insert into distributedcenter
    collectionofficer.query(sql1, values1, (err, result1) => {
      if (err) {
        console.error("Error inserting distribution center:", err);
        return reject(err);
      }

      const centerId = result1.insertId; // Get the inserted center's ID
      const companyId = data.company; // Get the company ID from request data

      const sql2 = `
        INSERT INTO distributedcompanycenter (companyId, centerId)
        VALUES (?, ?)
      `;

      const values2 = [companyId, centerId];

      // Then insert into distributedcompanycenter
      collectionofficer.query(sql2, values2, (err, result2) => {
        if (err) {
          console.error("Error inserting into distributedcompanycenter:", err);
          return reject(err);
        }

        resolve({
          centerInsertResult: result1,
          companyMappingResult: result2,
        });
      });
    });
  });
};

exports.getAllDistributionCentre = (
  limit,
  offset,
  district,
  province,
  company,
  searchItem
) => {
  return new Promise((resolve, reject) => {
    let countSql = "SELECT COUNT(*) as total FROM distributedcenter dc";
    let sql = `
        SELECT 
            dc.id,
            dc.centerName,
            dc.officerName,
            dc.code1,
            dc.contact01,
            dc.code2,
            dc.contact02,
            dc.city,
            dc.district,
            dc.province,
            dc.country,
            dc.longitude,
            dc.latitude,
            c.companyNameEnglish AS companyName
            
            FROM collection_officer.distributedcenter dc
            LEFT JOIN collection_officer.distributedcompanycenter dcc ON dc.id = dcc.centerId
            JOIN collection_officer.company c ON dcc.companyId = c.id
      `;

    let whereClause = " WHERE 1=1";
    const searchParams = [];

    if (searchItem) {
      const searchQuery = `%${searchItem}%`;
      whereClause +=
        " AND (dc.centerName LIKE ? OR c.companyNameEnglish LIKE ?)";
      searchParams.push(searchQuery, searchQuery);
    }

    if (district) {
      whereClause += " AND dc.district = ?";
      searchParams.push(district);
    }

    if (province) {
      whereClause += " AND dc.province = ?";
      searchParams.push(province);
    }
    if (company) {
      whereClause += " AND c.companyNameEnglish = ?";
      searchParams.push(company);
    }

    // Add where clause to both count and main SQL
    countSql += whereClause;
    sql += whereClause + " ORDER BY dcc.createdAt ASC LIMIT ? OFFSET ?";
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

          resolve({
            total: total,
            items: dataResults,
          });
        });
      }
    );
  });
};

exports.getAllCompanyDAO = (companyId, centerId) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT 
        dcc.id,
        dcc.companyId,
        dcc.centerId,
        c.companyNameEnglish,
        c.email AS companyEmail,
        c.logo,
        c.status,
        c.favicon,
        c.foName,
        dc.code1,
        dc.contact01,
        dc.code2,
        dc.contact02,
        dc.centerName,
        dc.OfficerName AS centerOfficerName,
        (
          SELECT COUNT(*) 
          FROM distributedcompanycenter dcc2 
          WHERE dcc2.companyId = c.id
        ) AS ownedCentersCount,
        (
          SELECT COUNT(*) 
          FROM collectionofficer co 
          WHERE co.companyId = c.id 
          AND co.centerId = dc.id 
          AND co.jobRole = 'Distribution Center Manager'
        ) AS managerCount,
         (
          SELECT COUNT(*) 
          FROM collectionofficer co 
          WHERE co.companyId = c.id 
          AND co.centerId = dc.id 
          AND co.jobRole = 'Distribution Officer'
        ) AS officerCount
      FROM 
        distributedcompanycenter dcc
      LEFT JOIN 
        company c ON dcc.companyId = c.id
      LEFT JOIN 
        distributedcenter dc ON dcc.centerId = dc.id
      WHERE 1=1
    `;
    const params = [];

    if (companyId) {
      sql += " AND dcc.companyId = ?";
      params.push(companyId);
    }

    if (centerId) {
      sql += " AND dcc.centerId = ?";
      params.push(centerId);
    }

    sql += " ORDER BY dcc.id ASC";

    collectionofficer.query(sql, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      console.log("All companies retrieved successfully", results);
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

exports.getAllDistributionCentreHead = (
  companyId,
  limit,
  offset,
  searchText
) => {
  return new Promise((resolve, reject) => {
    let countSql = `SELECT COUNT(*) AS total FROM collectionofficer WHERE companyId = ? AND jobRole = 'Distribution Center Head'`;
    let dataSql = `SELECT 
        co.id,
        co.empId,
        co.firstNameEnglish,
        co.lastNameEnglish,
        co.email,
        co.status,
        co.phoneCode01,
        co.phoneNumber01,
        co.phoneCode02,
        co.phoneNumber02,
        co.createdAt FROM collectionofficer co WHERE co.companyId = ? AND co.jobRole = 'Distribution Center Head'`;
    const countParams = [companyId];
    const dataParams = [companyId];
    if (searchText) {
      const searchCondition = ` AND (co.firstNameEnglish LIKE ? OR co.lastNameEnglish LIKE ? OR co.email LIKE ?)`;
      countSql += searchCondition;
      dataSql += searchCondition;
      const searchValue = `%${searchText}%`;
      countParams.push(searchValue, searchValue, searchValue);
      dataParams.push(searchValue, searchValue, searchValue);
    }
    limit = parseInt(limit, 10) || 10;
    offset = parseInt(offset, 10) || 0;

    dataSql += ` ORDER BY co.createdAt DESC LIMIT ? OFFSET ?`;
    dataParams.push(limit, offset); // Add limit and offset to parameters

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

exports.getCompanyDAO = () => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT 
      c.id,
      c.companyNameEnglish
      FROM 
        company c
      WHERE c.status = 1
      ORDER BY c.companyNameEnglish ASC
    `;

    collectionofficer.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      console.log("Company names retrieved successfully");
      console.log(results);
      resolve(results);
    });
  });
};

exports.getCompanyDetails = () => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT 
        c.companyNameEnglish, c.id
      FROM 
        company c
      WHERE c.status = 1
      ORDER BY c.companyNameEnglish ASC
    `;

    collectionofficer.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      console.log("Company names retrieved successfully");
      console.log(results);
      resolve(results);
    });
  });
};

exports.createDistributionHeadPersonal = (officerData, profileImageUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      const imageUrl = profileImageUrl || null;

      const sql = `
                INSERT INTO collectionofficer (
                    centerId, companyId, irmId, firstNameEnglish, lastNameEnglish,
                    jobRole, empId, empType, phoneCode01, phoneNumber01, phoneCode02, phoneNumber02,
                    nic, email, houseNumber, streetName, city, district, province, country,
                    languages, accHolderName, accNumber, bankName, branchName, image, QRcode, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Approved')
            `;

      collectionofficer.query(
        sql,
        [
          officerData.centerId,
          officerData.companyId,
          officerData.irmId,
          officerData.firstNameEnglish,
          officerData.lastNameEnglish,
          officerData.jobRole,
          officerData.empId,
          officerData.empType,
          officerData.phoneCode01,
          officerData.phoneNumber01,
          officerData.phoneCode02,
          officerData.phoneNumber02,
          officerData.nic,
          officerData.email,
          officerData.houseNumber,
          officerData.streetName,
          officerData.city,
          officerData.district,
          officerData.province,
          officerData.country,
          officerData.languages,
          officerData.accHolderName,
          officerData.accNumber,
          officerData.bankName,
          officerData.branchName,
          imageUrl,
          null, // QRcode field set to null
        ],
        (err, results) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          resolve(results);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

exports.checkNICExist = (nic) => {
  return new Promise((resolve, reject) => {
    const sql = `
            SELECT COUNT(*) AS count 
            FROM collectionofficer 
            WHERE nic = ?
        `;

    collectionofficer.query(sql, [nic], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results[0].count > 0);
    });
  });
};

exports.checkEmailExist = (email) => {
  return new Promise((resolve, reject) => {
    const sql = `
            SELECT COUNT(*) AS count 
            FROM collectionofficer 
            WHERE email = ?
        `;

    collectionofficer.query(sql, [email], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results[0].count > 0); // Return true if either NIC or email exists
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

exports.GetDistributedCenterByCompanyIdDAO = (companyId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT dc.* 
      FROM distributedcenter dc
      JOIN distributedcompanycenter dcc ON dc.id = dcc.centerId
      WHERE dcc.companyId = ?
    `;
    collectionofficer.query(sql, [companyId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.DeleteDistributionHeadDao = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
            DELETE FROM collectionofficer
            WHERE id = ?
        `;
    collectionofficer.query(sql, [parseInt(id)], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.GetDistributionHeadDetailsByIdDao = (id) => {
  console.log("id", id);

  return new Promise((resolve, reject) => {
    let sql = `
      SELECT 
        id, companyId, irmId, firstNameEnglish, lastNameEnglish, jobRole, empId, empType,
        phoneCode01, phoneNumber01, phoneCode02, phoneNumber02, nic, email,
        houseNumber, streetName, city, district, province, country, languages,
        accHolderName, accNumber, bankName, branchName, image, status,
        claimStatus, onlineStatus
      FROM 
        collectionofficer
      WHERE id = ?
    `;

    collectionofficer.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      }
      console.log("Distribution Head details retrieved successfully");
      console.log("Details:", results[0]);
      resolve(results[0]);
    });
  });
};

exports.UpdateDistributionHeadDao = (id, updateData) => {
  console.log("id", id);
  console.log("updateData", updateData);

  return new Promise((resolve, reject) => {
    let sql = `
      UPDATE collectionofficer
      SET 
        companyId = ?, irmId = ?, firstNameEnglish = ?, lastNameEnglish = ?, 
        jobRole = ?, empId = ?, empType = ?, phoneCode01 = ?, phoneNumber01 = ?, 
        phoneCode02 = ?, phoneNumber02 = ?, nic = ?, email = ?, houseNumber = ?, 
        streetName = ?, city = ?, district = ?, province = ?, country = ?, 
        languages = ?, accHolderName = ?, accNumber = ?, bankName = ?, 
        branchName = ?, image = ?, status = ?, claimStatus = ?, onlineStatus = ?
      WHERE id = ?
    `;

    const values = [
      updateData.companyId,
      updateData.irmId,
      updateData.firstNameEnglish,
      updateData.lastNameEnglish,
      updateData.jobRole,
      updateData.empId,
      updateData.empType,
      updateData.phoneCode01,
      updateData.phoneNumber01,
      updateData.phoneCode02,
      updateData.phoneNumber02,
      updateData.nic,
      updateData.email,
      updateData.houseNumber,
      updateData.streetName,
      updateData.city,
      updateData.district,
      updateData.province,
      updateData.country,
      updateData.languages,
      updateData.accHolderName,
      updateData.accNumber,
      updateData.bankName,
      updateData.branchName,
      updateData.image,
      updateData.status,
      updateData.claimStatus,
      updateData.onlineStatus,
      id,
    ];

    collectionofficer.query(sql, values, (err, results) => {
      if (err) {
        return reject(err);
      }
      console.log("Collection Officer details updated successfully");
      console.log("Affected rows:", results.affectedRows);
      resolve(results);
    });
  });
};

exports.getDistributionCentreById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        dc.id,
        dc.centerName,
        dc.officerName,
        dc.code1,
        dc.contact01,
        dc.code2,
        dc.contact02,
        dc.city,
        dc.district,
        dc.province,
        dc.country,
        dc.longitude,
        dc.latitude,
        dc.email,
        dc.createdAt,
        c.companyNameEnglish
      FROM distributedcenter dc
      LEFT JOIN distributedcompanycenter dcc ON dc.id = dcc.centerId
      LEFT JOIN company c ON dcc.companyId = c.id
      WHERE dc.id = ?
    `;

    collectionofficer.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length === 0) {
        return resolve(null);
      }

      resolve(results[0]);
    });
  });
};

exports.updateDistributionCentreById = (id, updateData) => {
  return new Promise((resolve, reject) => {
    console.log("Starting update for distribution center ID:", id);
    console.log("Update data received:", updateData);

    // Extract fields from updateData
    const {
      centerName,
      officerName,
      code1,
      contact01,
      code2,
      contact02,
      city,
      district,
      province,
      country,
      longitude,
      latitude,
      email,
      companyNameEnglish,
      companyId,
    } = updateData;

    // Update distribution center SQL
    const updateCenterSql = `
      UPDATE distributedcenter 
      SET 
        centerName = ?,
        officerName = ?,
        code1 = ?,
        contact01 = ?,
        code2 = ?,
        contact02 = ?,
        city = ?,
        district = ?,
        province = ?,
        country = ?,
        longitude = ?,
        latitude = ?,
        email = ?
      WHERE id = ?
    `;

    const centerParams = [
      centerName,
      officerName,
      code1,
      contact01,
      code2,
      contact02,
      city,
      district,
      province,
      country,
      longitude,
      latitude,
      email,
      id,
    ];

    console.log("Executing center update with:", updateCenterSql, centerParams);

    // Execute distribution center update
    collectionofficer.query(
      updateCenterSql,
      centerParams,
      (err, centerResults) => {
        if (err) {
          console.error("Error updating distribution center:", err);
          return reject(err);
        }

        console.log("Center update results:", centerResults);

        if (centerResults.affectedRows === 0) {
          console.log("No rows affected in center update");
          return resolve(null);
        }

        // Update company if information is provided
        if (companyNameEnglish && companyId) {
          const updateCompanySql = `
          UPDATE company
          SET companyNameEnglish = ?
          WHERE id = ?
        `;

          console.log("Executing company update with:", updateCompanySql, [
            companyNameEnglish,
            companyId,
          ]);

          collectionofficer.query(
            updateCompanySql,
            [companyNameEnglish, companyId],
            (err, companyResults) => {
              if (err) {
                console.error("Error updating company:", err);
                return reject(err);
              }

              console.log("Company update results:", companyResults);

              if (companyResults.affectedRows === 0) {
                console.log("No rows affected in company update");
                return resolve(null);
              }

              console.log("Updates completed successfully");
              exports
                .getDistributionCentreById(id)
                .then((updatedCenter) => resolve(updatedCenter))
                .catch((error) => reject(error));
            }
          );
        } else {
          console.log("No company update needed");
          exports
            .getDistributionCentreById(id)
            .then((updatedCenter) => resolve(updatedCenter))
            .catch((error) => reject(error));
        }
      }
    );
  });
};
