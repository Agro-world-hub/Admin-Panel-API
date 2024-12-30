const { plantcare, collectionofficer } = require('../../startup/database');


const createCollectionCenter = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS collectioncenter (
      id INT AUTO_INCREMENT PRIMARY KEY,
      regCode VARCHAR(30) NOT NULL,
      centerName VARCHAR(30) NOT NULL,
      code1 VARCHAR(5) NOT NULL,
      contact01 VARCHAR(13) NOT NULL,
      code2 VARCHAR(5) NOT NULL,
      contact02 VARCHAR(13) NOT NULL,
      buildingNumber VARCHAR(50) NOT NULL,
      street VARCHAR(50) NOT NULL,
      city VARCHAR(50) NOT NULL,
      district VARCHAR(30) NOT NULL,
      province VARCHAR(30) NOT NULL,
      country VARCHAR(30) NOT NULL,
      companies VARCHAR(30) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating collectioncenter table: ' + err);
            } else {
                resolve('collectioncenter table created successfully.');
            }
        });
    });
};


const createXlsxHistoryTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS xlsxhistory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      xlName VARCHAR(50) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating xlsxhistory table: ' + err);
            } else {
                resolve('xlsxhistory table created successfully.');
            }
        });
    });
};






const createMarketPriceTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS marketprice (
      id INT AUTO_INCREMENT PRIMARY KEY,
      varietyId INT(11) DEFAULT NULL,
      xlindex INT(11) DEFAULT NULL,
      grade VARCHAR(1) NOT NULL,
      price DECIMAL(15,2) DEFAULT NULL,
      averagePrice DECIMAL(15,2) DEFAULT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      createdBy INT(11) DEFAULT NULL,
      FOREIGN KEY (varietyId) REFERENCES plant_care.cropvariety(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (createdBy) REFERENCES plant_care.adminUsers(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (xlindex) REFERENCES xlsxhistory(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating market-price table: ' + err);
            } else {
                resolve('market-price table created successfully.');
            }
        });
    });
};





const createMarketPriceServeTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS marketpriceserve (
      id INT AUTO_INCREMENT PRIMARY KEY,
      marketPriceId INT(11) DEFAULT NULL,
      xlindex INT(11) DEFAULT NULL,
      price DECIMAL(15,2) DEFAULT NULL,
      updatedPrice DECIMAL(15,2) DEFAULT NULL,
      collectionCenterId INT(11) DEFAULT NULL,
      FOREIGN KEY (marketPriceId) REFERENCES marketprice(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (collectionCenterId) REFERENCES collectioncenter(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating marketpriceserve table: ' + err);
            } else {
                resolve('mmarketpriceserve table created successfully.');
            }
        });
    });
};





const createCompany = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS company (
      id INT AUTO_INCREMENT PRIMARY KEY,
      regNumber VARCHAR(50) NOT NULL,
      companyNameEnglish VARCHAR(50) NOT NULL,
      companyNameSinhala VARCHAR(50) NOT NULL,
      companyNameTamil VARCHAR(50) NOT NULL,
      email VARCHAR(50) NOT NULL,
      oicName VARCHAR(50) NULL,
      oicEmail VARCHAR(50) NULL,
      oicConCode1 VARCHAR(5) NULL,
      oicConNum1 VARCHAR(12) NULL,
      oicConCode2 VARCHAR(5) NULL,
      oicConNum2 VARCHAR(12) NULL,
      accHolderName VARCHAR(50) NULL,
      accNumber VARCHAR(30) NULL,
      bankName VARCHAR(30) NULL,
      branchName VARCHAR(30) NULL,
      foName VARCHAR(50) NULL,
      foConCode VARCHAR(5) NULL,
      foConNum VARCHAR(12) NULL,
      foEmail VARCHAR(50) NULL,
      status BOOLEAN NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating ccompany: ' + err);
            } else {
                resolve('company table created successfully.');
            }
        });
    });
};



//Collection officer tables

const createCollectionOfficer = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS collectionofficer (
      id INT AUTO_INCREMENT PRIMARY KEY,
      centerId INT NOT NULL,
      companyId INT NOT NULL,
      irmId INT NULL,
      firstNameEnglish VARCHAR(50) NOT NULL,
      firstNameSinhala VARCHAR(50) NOT NULL,
      firstNameTamil VARCHAR(50) NOT NULL,
      lastNameEnglish VARCHAR(50) NOT NULL,
      lastNameSinhala VARCHAR(50) NOT NULL,
      lastNameTamil VARCHAR(50) NOT NULL,
      jobRole VARCHAR(50) NULL,
      empId VARCHAR(10) NOT NULL,
      enpType VARCHAR(10) NULL,
      phoneCode01 VARCHAR(5) NOT NULL,
      phoneNumber01 VARCHAR(12) NOT NULL,
      phoneCode02 VARCHAR(5) NULL,
      phoneNumber02 VARCHAR(12) NULL,
      nic VARCHAR(12) NOT NULL,
      email VARCHAR(50) NOT NULL,
      password VARCHAR(20) NULL,
      passwordUpdated BOOLEAN NULL,
      houseNumber VARCHAR(10) NOT NULL,
      streetName VARCHAR(50) NOT NULL,
      city VARCHAR(50) NOT NULL,
      district VARCHAR(25) NOT NULL,
      province VARCHAR(25) NOT NULL,
      country VARCHAR(25) NOT NULL,
      languages VARCHAR(255) NOT NULL,
      accHolderName VARCHAR(75) NOT NULL,
      accNumber VARCHAR(25) NOT NULL,
      bankName VARCHAR(25) NOT NULL,
      branchName VARCHAR(25) NOT NULL,
      image LONGBLOB NULL,
      QRcode LONGBLOB,
      status VARCHAR(25) NULL,
      claimStatus BOOLEAN DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (centerId) REFERENCES collectioncenter(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (companyId) REFERENCES company(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (irmId) REFERENCES collectionofficer(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating collection officer table: ' + err);
            } else {
                resolve('collection officer table created successfully.');
            }
        });
    });
};





const createRegisteredFarmerPayments = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS registeredfarmerpayments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      collectionOfficerId INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES plant_care.users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (collectionOfficerId) REFERENCES collectionofficer(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
      
    )
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating registeredfarmerpayments table: ' + err);
            } else {
                resolve('registeredfarmerpayments table created successfully.');
            }
        });
    });
};


const createFarmerPaymensCrops = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS farmerpaymentscrops (
      id INT AUTO_INCREMENT PRIMARY KEY,
      registerFarmerId INT,
      cropId INT,
      gradeAprice DECIMAL(15, 2) NULL,
      gradeBprice DECIMAL(15, 2) NULL,
      gradeCprice DECIMAL(15, 2) NULL,
      gradeAquan DECIMAL(15, 2) NULL,
      gradeBquan DECIMAL(15, 2) NULL,
      gradeCquan DECIMAL(15, 2) NULL,
      image LONGBLOB,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (registerFarmerId) REFERENCES registeredfarmerpayments(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (cropId) REFERENCES plant_care.cropvariety(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating farmerpaymentscrops table: ' + err);
            } else {
                resolve('farmerpaymentscrops table created successfully.');
            }
        });
    });
};



const createFarmerComplains  = () => {
    const sql = `
   CREATE TABLE IF NOT EXISTS farmercomplains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmerId INT,
    coId INT,
    refNo VARCHAR(20) NOT NULL,
    language VARCHAR(50) NOT NULL,
    complainCategory VARCHAR(50) NOT NULL,
    complain TEXT NOT NULL,
    reply TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmerId) REFERENCES plant_care.users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (coId) REFERENCES collectionofficer(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating market place users table: ' + err);
            } else {
                resolve('market place users table created successfully.');
            }
        });
    });
};






const createMarketPriceRequestTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS marketpricerequest (
      id INT AUTO_INCREMENT PRIMARY KEY,
      marketPriceId INT(11) DEFAULT NULL,
      centerId INT(11) DEFAULT NULL,
      requestPrice DECIMAL(10,2) DEFAULT NULL,
      status VARCHAR(20) NOT NULL,
      empId INT(11) DEFAULT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (marketPriceId) REFERENCES marketprice(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (centerId) REFERENCES collectioncenter(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (empId) REFERENCES collectionofficer(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating market-price request table: ' + err);
            } else {
                resolve('market-price table created request successfully.');
            }
        });
    });
};



module.exports = {
    createXlsxHistoryTable,
    createMarketPriceTable,
    createMarketPriceServeTable,
    createCompany,
    createCollectionOfficer,
    createRegisteredFarmerPayments,
    createFarmerPaymensCrops,
    createCollectionCenter,
    createFarmerComplains,
    createMarketPriceRequestTable,
};