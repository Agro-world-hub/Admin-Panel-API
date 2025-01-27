const { plantcare, collectionofficer, marketPlace, dash } = require('../startup/database');

exports.getAllFeatures = () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM features";
  
      plantcare.query(sql, (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
  
        resolve(results); // No need to wrap in arrays, return results directly
      });
    });
  };



  exports.getAllRoleFeatures = (roleId) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM role_features WHERE role_id = ?";
  
      plantcare.query(sql,roleId, (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
  
        resolve(results); // No need to wrap in arrays, return results directly
      });
    });
  };



  exports.createRoleFeature = async (
    role_id,
    position_id,
    feature_id
  ) => {
    return new Promise((resolve, reject) => {
      const sql =
        "INSERT INTO role_features (role_id, position_id, feature_id) VALUES (?, ?, ?)";
      const values = [
        role_id,
        position_id,
        feature_id
      ];
  
      plantcare.query(sql, values, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.insertId);
        }
      });
    });
  };



  exports.deleteRoleFeature = (id) => {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM role_features WHERE id = ?";
      plantcare.query(sql, [id], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  };