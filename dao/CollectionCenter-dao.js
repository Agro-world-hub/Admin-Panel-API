const db = require("../startup/database");


exports.GetAllCenterDAO = () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM collectioncenter";
      db.query(sql, (err, results) => {
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
      db.query(sql, [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.affectedRows);
        }
      });
    });
  };