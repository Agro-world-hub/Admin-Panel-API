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
        cc.id,
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


exports.addNewApplicationData = (applicationName) => {
  return new Promise((resolve, reject) => {
      const sql = `INSERT INTO systemapplications (appName) VALUES (?)`;

      admin.query(sql, [applicationName], (err, results) => {  
          if (err) {
              return reject(err); 
          }
          
          resolve(results); 
      });
  });
};

exports.editApplicationData = (systemAppId, applicationName) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE systemapplications SET appName = ? WHERE id = ?`;

      admin.query(sql, [applicationName, systemAppId], (err, results) => {  
          if (err) {
              return reject(err); 
          }
          
          resolve(results); 
      });
  });
};

exports.deleteApplicationData = (systemAppId) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM systemapplications WHERE id = ?`; // Use DELETE instead of UPDATE

    admin.query(sql, [systemAppId], (err, results) => {  
        if (err) {
            return reject(err); 
        }
        
        // Check if any row was deleted
        if (results.affectedRows === 0) {
          return reject(new Error('No application found with the provided systemAppId'));
        }

        resolve(results); 
    });
  });
};



exports.getCategoriDetailsByIdDao = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT *
        FROM complaincategory 
        WHERE id = ?
        `;

    admin.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      }

      resolve(results[0]);
    });
  });
};



exports.EditComplainCategoryDao = (data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE complaincategory 
      SET 
        roleId = ?, 
        appId = ?, 
        categoryEnglish = ?, 
        categorySinhala = ?, 
        categoryTamil = ?
      WHERE id = ?
      `;

    admin.query(sql, [
      data.roleId,
      data.appId,
      data.categoryEnglish,
      data.categorySinhala,
      data.categoryTamil,
      data.id
    ],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
  });
};