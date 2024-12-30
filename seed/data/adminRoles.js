const {  plantcare } = require('../../startup/database');

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

  const sql = `
    INSERT INTO adminroles (role) 
    VALUES ${roles.map(() => '(?)').join(', ')}
  `;

  try {
    return new Promise((resolve, reject) => {
      plantcare.query(sql, roles, (err, result) => {
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
