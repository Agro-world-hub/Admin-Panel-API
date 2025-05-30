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
        data.city
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



  exports.getAllDistributionCentre = (limit, offset, district, province, searchItem) => {
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
  