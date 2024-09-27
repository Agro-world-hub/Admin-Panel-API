const db = require('../startup/database');

const createSuperAdmin = () => {
    const sql = `
      INSERT INTO adminUsers (mail, userName, password, role)
      VALUES ('admin@agroworld.com', 'superadmin123', 'Admin123@', 'SUPER_ADMIN')
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, (err, result) => {
        if (err) {
          reject('Error creating Super Admin: ' + err);
        } else {
          resolve('Super Admin created successfully.');
        }
      });
    });
  };

  module.exports = {
    createSuperAdmin
  };