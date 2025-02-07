const { admin, plantcare, dash } = require('../../startup/database');


const createAdminUserRolesTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS adminroles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role VARCHAR(100) DEFAULT NULL
    )
  `;
    return new Promise((resolve, reject) => {
        admin.query(sql, (err, result) => {
            if (err) {
                reject('Error creating adminUserRoles table: ' + err);
            } else {
                resolve('adminUserRoles table created successfully.');
            }
        });
    });
};


const createAdminUserPositionTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS adminposition (
      id INT AUTO_INCREMENT PRIMARY KEY,
      positions VARCHAR(100) DEFAULT NULL
    )
  `;
    return new Promise((resolve, reject) => {
        admin.query(sql, (err, result) => {
            if (err) {
                reject('Error creating adminposition table: ' + err);
            } else {
                resolve('adminposition table created successfully.');
            }
        });
    });
};


const createFeaturesCategoryTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS featurecategory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(100) DEFAULT NULL
    )
  `;
    return new Promise((resolve, reject) => {
        admin.query(sql, (err, result) => {
            if (err) {
                reject('Error creating featurecategory table: ' + err);
            } else {
                resolve('featurecategory table created successfully.');
            }
        });
    });
};


const createFeaturesTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS features (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) DEFAULT NULL,
      category INT(11) DEFAULT NULL,
      FOREIGN KEY (category) REFERENCES featurecategory(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        admin.query(sql, (err, result) => {
            if (err) {
                reject('Error creating adminposition table: ' + err);
            } else {
                resolve('adminposition table created successfully.');
            }
        });
    });
};



const createAdminUsersTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS adminusers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mail VARCHAR(50) DEFAULT NULL,
      userName VARCHAR(30) DEFAULT NULL,
      password TEXT DEFAULT NULL,
      role INT DEFAULT NULL,
      position INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role) REFERENCES adminroles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (position) REFERENCES adminposition(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        admin.query(sql, (err, result) => {
            if (err) {
                reject('Error creating adminUsers table: ' + err);
            } else {
                resolve('adminUsers table created successfully.');
            }
        });
    });
};

const createRoleFeatures = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS rolefeatures (
      id INT AUTO_INCREMENT PRIMARY KEY,
      roleId INT DEFAULT NULL,
      positionId INT DEFAULT NULL,
      featureId INT DEFAULT NULL,
      FOREIGN KEY (roleId) REFERENCES adminroles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (positionId) REFERENCES adminposition(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (featureId) REFERENCES features(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        admin.query(sql, (err, result) => {
            if (err) {
                reject('Error creating adminUsers table: ' + err);
            } else {
                resolve('adminUsers table created successfully.');
            }
        });
    });
};


const createComplainCategoryTypeTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS complaincategorytype (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(100) DEFAULT NULL
    )
  `;
    return new Promise((resolve, reject) => {
        admin.query(sql, (err, result) => {
            if (err) {
                reject('Error creating complaincategorytype table: ' + err);
            } else {
                resolve('complaincategorytype table created successfully.');
            }
        });
    });
};



const createComplainCategoryTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS complaincategory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type INT(11) DEFAULT NULL,
      ctegory VARCHAR(100) DEFAULT NULL,
      FOREIGN KEY (type) REFERENCES complaincategorytype(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        admin.query(sql, (err, result) => {
            if (err) {
                reject('Error creating adminposition table: ' + err);
            } else {
                resolve('adminposition table created successfully.');
            }
        });
    });
};







module.exports = {
    createAdminUserRolesTable,
    createAdminUserPositionTable,
    createFeaturesCategoryTable,
    createFeaturesTable,
    createAdminUsersTable,
    createRoleFeatures,
    createComplainCategoryTypeTable,
    createComplainCategoryTable
};