const db = require('../startup/database');

const insertRoles = async () => {
  const roles = ['Super Admin', 
    'Agriculture Executive', 
    'Agriculture Officer', 
    'Finance Officer', 
    'Market Place Manager', 
    'Demand Supply Manager', 
    'System Admin', 
    'Transport and Logistic Executive', 
    'Call Centre Officer',
    'Colection Center Admin'];

  // Construct the SQL query for inserting multiple roles
  const sql = `
    INSERT INTO adminroles (role) 
    VALUES ${roles.map(() => '(?)').join(', ')}
  `;

  try {
    return new Promise((resolve, reject) => {
      db.query(sql, roles, (err, result) => {
        if (err) {
          reject('Error inserting roles: ' + err);
        } else {
          resolve('Roles inserted successfully.');
        }
      });
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  insertRoles
};
