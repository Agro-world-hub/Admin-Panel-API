const { admin, plantcare, collectionofficer, marketPlace, dash, } = require("../startup/database");
const { Upload } = require("@aws-sdk/lib-storage");
const Joi = require("joi");


exports.getAdminUsersByPosition = () => {
    return new Promise((resolve, reject) => {
      const sql = `
            SELECT p.positions AS positionName, COUNT(a.id) AS adminUserCount
            FROM adminusers a
            JOIN adminposition p ON a.position = p.id
            GROUP BY p.positions
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


  exports.getNewAdminUsers = () => {
    return new Promise((resolve, reject) => {
      const sql = `
              SELECT COUNT(*) AS newAdminUserCount FROM adminusers WHERE DATE(created_at) = CURDATE();

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


  exports.getAllAdminUsers = () => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT COUNT(*) AS TotalAdminUserCount FROM adminusers;
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


  exports.getCollectionOfficersByPosition = () => {
    return new Promise((resolve, reject) => {
      const sql = `
            SELECT CO.jobRole AS positionName, COUNT(CO.id) AS officerCount
            FROM collectionofficer CO
            GROUP BY CO.jobRole
            `;
      collectionofficer.query(sql, (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
        console.log('result', results);
  
        resolve(results); // Resolve the promise with the query results
      });
    });
  };


  exports.getNewCollectionOfficers = () => {
    return new Promise((resolve, reject) => {
      const sql = `
              SELECT COUNT(*) AS newOfficersCount FROM collectionofficer WHERE DATE(createdAt) = CURDATE();

            `;
      collectionofficer.query(sql, (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
        console.log('result', results);
  
        resolve(results); // Resolve the promise with the query results
      });
    });
  };


  exports.getAllCollectionOfficers = () => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT COUNT(*) AS totalOfficerCount FROM collectionofficer;
            `;
      collectionofficer.query(sql, (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
        console.log('result', results);
  
        resolve(results); // Resolve the promise with the query results
      });
    });
  };

  exports.getPlantCareUserByQrRegistration = () => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT 
        CASE 
            WHEN farmerQr IS NOT NULL AND farmerQr <> '' THEN 'With QR Code'
            ELSE 'Without QR Code'
        END AS qr_status,
        COUNT(*) AS user_count
      FROM users
      GROUP BY qr_status;
            `;
      plantcare.query(sql, (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
        console.log('result', results);
  
        resolve(results); // Resolve the promise with the query results
      });
    });
  };


  exports.getNewPlantCareUsers = () => {
    return new Promise((resolve, reject) => {
      const sql = `
         SELECT COUNT(*) AS newPlantCareUserCount FROM users WHERE DATE(created_at) = CURDATE()

            `;
      plantcare.query(sql, (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
        console.log('result', results);
  
        resolve(results); // Resolve the promise with the query results
      });
    });
  };


  exports.getAllPlantCareUsers = () => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT COUNT(*) AS totalPlantCareUserCount FROM users
            `;
      plantcare.query(sql, (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
        console.log('result', results);
  
        resolve(results); // Resolve the promise with the query results
      });
    });
  };

  exports.getActivePlantCareUsers = () => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT COUNT(*) AS activePlantCareUserCount FROM users WHERE activeStatus = 'active'
            `;
      plantcare.query(sql, (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
        console.log('result', results);
  
        resolve(results); // Resolve the promise with the query results
      });
    });
  };

  

  exports.getActiveSalesAgents = () => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT COUNT(*) AS activeSalesAgents FROM salesagent WHERE status = 'active'
            `;
      dash.query(sql, (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
        console.log('result', results);
  
        resolve(results); // Resolve the promise with the query results
      });
    });
  };


  exports.getNewSalesAgents = () => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT COUNT(*) AS newSalesAgents FROM salesagent WHERE DATE(createdAt) = CURDATE() 

            `;
      dash.query(sql, (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
        console.log('result', results);
  
        resolve(results); // Resolve the promise with the query results
      });
    });
  };


  exports.getAllSalesAgents = () => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT COUNT(*) AS totalSaleAgents FROM salesagent
            `;
      dash.query(sql, (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
        console.log('result', results);
  
        resolve(results); // Resolve the promise with the query results
      });
    });
  };

  