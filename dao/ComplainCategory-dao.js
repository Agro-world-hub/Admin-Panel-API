const { admin, plantcare, collectionofficer, marketPlace, dash, } = require("../startup/database");
const { Upload } = require("@aws-sdk/lib-storage");
const Joi = require("joi");

exports.getAllSystemApplicationData = () => {
  return new Promise((resolve, reject) => {
    const sql = `
          SELECT 
          sa.id AS systemAppId,
          sa.appName AS systemAppName,
          COUNT(cc.id) AS categoryCount
          FROM systemapplications sa
          LEFT JOIN complaincategory cc ON sa.id = cc.appId AND cc.roleId = 2
          GROUP BY sa.id, sa.appName;
          `;
    admin.query(sql, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }
      console.log('result', results);

      resolve(results); // Resolve the promise with the query results
    });
  });
};


exports.getComplainCategoryData = (systemAppId) => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT 
        cc.categoryEnglish
        
        FROM complaincategory cc
        WHERE cc.appId = ?
        `;

    admin.query(sql, [systemAppId], (err, results) => {
      if (err) {
        return reject(err);
      }

      resolve(results);
    });
  });
};


exports.getAdminRolesDao = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, role
      FROM adminroles
      `;

    admin.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};


exports.getSystemApplicationDao = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, appName
      FROM systemapplications
      `;

    admin.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};


exports.AddNewComplainCategoryDao = (data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO complaincategory (roleId, appId, categoryEnglish, categorySinhala, categoryTamil)
      VALUES (?, ?, ?, ?, ?)
      `;

    admin.query(sql, [
      data.roleId,
      data.appId,
      data.categoryEnglish,
      data.categorySinhala,
      data.categoryTamil
    ],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
  });
};