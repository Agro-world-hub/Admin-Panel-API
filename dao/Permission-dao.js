const {
  admin,
  plantcare,
  collectionofficer,
  marketPlace,
  dash,
} = require("../startup/database");

exports.getAllFeatures = () => {
  return new Promise((resolve, reject) => {
    const sql = `
                  SELECT 
                    fe.id, 
                    fe.name,
                    fc.category
                  FROM 
                    features fe
                  JOIN 
                    featurecategory fc ON fe.category = fc.id`;

    admin.query(sql, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results); // No need to wrap in arrays, return results directly
    });
  });
};

exports.getAllRoleFeatures = (roleId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM rolefeatures WHERE roleId = ?";

    admin.query(sql, roleId, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results); // No need to wrap in arrays, return results directly
    });
  });
};

exports.createRoleFeature = async (role_id, position_id, feature_id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO rolefeatures (roleId, positionId, featureId) VALUES (?, ?, ?)";
    const values = [role_id, position_id, feature_id];

    admin.query(sql, values, (err, results) => {
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
    const sql = "DELETE FROM rolefeatures WHERE id = ?";
    admin.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.createAdminRole = async (role, email) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO adminroles (role, email) VALUES (?, ?)";
    const values = [role, email];

    admin.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId); // Return the ID of the newly inserted row
      }
    });
  });
};
