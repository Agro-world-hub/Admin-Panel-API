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
    const sql = `
        INSERT INTO distribution_centers 
        (name, officerInCharge, contact1, contact1Code, contact2, contact2Code, latitude, longitude, email, country, province, district, city)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

    const values = [
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

    dash.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting distribution center:", err);
        return reject(err);
      }
      resolve(result);
    });
  });
};

exports.getAllDistributionCentre = (
  limit,
  offset,
  district,
  province,
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
      whereClause += " AND (C.regCode LIKE ? OR C.centerName LIKE ?)";
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
