const { plantcare, collectionofficer } = require('../../startup/database');


const createCollectionCenter = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS collectioncenter (
      id INT AUTO_INCREMENT PRIMARY KEY,
      regCode VARCHAR(30) DEFAULT NULL,
      centerName VARCHAR(30) DEFAULT NULL,
      code1 VARCHAR(5) DEFAULT NULL,
      contact01 VARCHAR(13) DEFAULT NULL,
      code2 VARCHAR(5) DEFAULT NULL,
      contact02 VARCHAR(13) DEFAULT NULL,
      buildingNumber VARCHAR(50) DEFAULT NULL,
      street VARCHAR(50) DEFAULT NULL,
      city VARCHAR(50) DEFAULT NULL,
      district VARCHAR(30) DEFAULT NULL,
      province VARCHAR(30) DEFAULT NULL,
      country VARCHAR(30) DEFAULT NULL,
      companies VARCHAR(30) DEFAULT NULL,
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
      xlName VARCHAR(50) DEFAULT NULL,
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
      grade VARCHAR(1) DEFAULT NULL,
      price DECIMAL(15,2) DEFAULT NULL,
      averagePrice DECIMAL(15,2) DEFAULT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (varietyId) REFERENCES plant_care.cropvariety(id)
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
      regNumber VARCHAR(50) DEFAULT NULL,
      companyNameEnglish VARCHAR(50) DEFAULT NULL,
      companyNameSinhala VARCHAR(50) DEFAULT NULL,
      companyNameTamil VARCHAR(50) DEFAULT NULL,
      email VARCHAR(50) DEFAULT NULL,
      oicName VARCHAR(50) DEFAULT NULL,
      oicEmail VARCHAR(50) DEFAULT NULL,
      oicConCode1 VARCHAR(5) DEFAULT NULL,
      oicConNum1 VARCHAR(12) DEFAULT NULL,
      oicConCode2 VARCHAR(5) DEFAULT NULL,
      oicConNum2 VARCHAR(12) DEFAULT NULL,
      accHolderName VARCHAR(50) DEFAULT NULL,
      accNumber VARCHAR(30) DEFAULT NULL,
      bankName VARCHAR(30) DEFAULT NULL,
      branchName VARCHAR(30) DEFAULT NULL,
      foName VARCHAR(50) DEFAULT NULL,
      foConCode VARCHAR(5) DEFAULT NULL,
      foConNum VARCHAR(12) DEFAULT NULL,
      foEmail VARCHAR(50) DEFAULT NULL,
      status BOOLEAN DEFAULT NULL,
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
      centerId INT DEFAULT NULL,
      companyId INT DEFAULT NULL,
      irmId INT DEFAULT NULL,
      firstNameEnglish VARCHAR(50) DEFAULT NULL,
      firstNameSinhala VARCHAR(50) DEFAULT NULL,
      firstNameTamil VARCHAR(50) DEFAULT NULL,
      lastNameEnglish VARCHAR(50) DEFAULT NULL,
      lastNameSinhala VARCHAR(50) DEFAULT NULL,
      lastNameTamil VARCHAR(50) DEFAULT NULL,
      jobRole VARCHAR(50) DEFAULT NULL,
      empId VARCHAR(10) DEFAULT NULL,
      empType VARCHAR(10) DEFAULT NULL,
      phoneCode01 VARCHAR(5) DEFAULT NULL,
      phoneNumber01 VARCHAR(12) DEFAULT NULL,
      phoneCode02 VARCHAR(5) DEFAULT NULL,
      phoneNumber02 VARCHAR(12) DEFAULT NULL,
      nic VARCHAR(12) DEFAULT NULL,
      email VARCHAR(50) DEFAULT NULL,
      password VARCHAR(255) DEFAULT NULL,
      passwordUpdated BOOLEAN DEFAULT NULL,
      houseNumber VARCHAR(10) DEFAULT NULL,
      streetName VARCHAR(50) DEFAULT NULL,
      city VARCHAR(50) DEFAULT NULL,
      district VARCHAR(25) DEFAULT NULL,
      province VARCHAR(25) DEFAULT NULL,
      country VARCHAR(25) DEFAULT NULL,
      languages VARCHAR(255) DEFAULT NULL,
      accHolderName VARCHAR(75) DEFAULT NULL,
      accNumber VARCHAR(25) DEFAULT NULL,
      bankName VARCHAR(25) DEFAULT NULL,
      branchName VARCHAR(25) DEFAULT NULL,
      image TEXT DEFAULT NULL,
      QRcode TEXT DEFAULT NULL,
      status VARCHAR(25) DEFAULT NULL,
      claimStatus BOOLEAN DEFAULT 0,
      onlineStatus BOOLEAN DEFAULT 0,
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
      userId INT DEFAULT NULL,
      collectionOfficerId INT DEFAULT NULL,
      invNo VARCHAR(255) DEFAULT NULL,
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
      registerFarmerId INT DEFAULT NULL,
      cropId INT DEFAULT NULL,
      gradeAprice DECIMAL(15, 2) DEFAULT NULL,
      gradeBprice DECIMAL(15, 2) DEFAULT NULL,
      gradeCprice DECIMAL(15, 2) DEFAULT NULL,
      gradeAquan DECIMAL(15, 2) DEFAULT NULL,
      gradeBquan DECIMAL(15, 2) DEFAULT NULL,
      gradeCquan DECIMAL(15, 2) DEFAULT NULL,
      image TEXT DEFAULT NULL,
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
    farmerId INT DEFAULT NULL,
    coId INT DEFAULT NULL,
    refNo VARCHAR(20) DEFAULT NULL,
    language VARCHAR(50) DEFAULT NULL,
    complainCategory VARCHAR(50) DEFAULT NULL,
    complain TEXT DEFAULT NULL,
    reply TEXT DEFAULT NULL,
    status VARCHAR(20) DEFAULT NULL,
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
      status VARCHAR(20) DEFAULT NULL,
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


const createDailyTargetTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS dailytarget (
      id INT AUTO_INCREMENT PRIMARY KEY,
      centerId INT(11) DEFAULT NULL,
      companyId INT(11) DEFAULT NULL,
      fromDate DATE DEFAULT NULL,
      toDate DATE DEFAULT NULL,
      fromTime TIME DEFAULT NULL,
      toTime TIME DEFAULT NULL,
      createdBy INT(11) DEFAULT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (centerId) REFERENCES collectioncenter(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (companyId) REFERENCES company(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (createdBy) REFERENCES collectionofficer(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating Daily Target request table: ' + err);
            } else {
                resolve('Daily Target table created request successfully.');
            }
        });
    });
};


const createDailyTargetItemsTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS dailytargetitems (
      id INT AUTO_INCREMENT PRIMARY KEY,
      targetId INT(11) DEFAULT NULL,
      varietyId INT(11) DEFAULT NULL,
      qtyA DECIMAL(8,2) DEFAULT 0,
      qtyB DECIMAL(8,2) DEFAULT 0,
      qtC DECIMAL(8,2) DEFAULT 0,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (targetId) REFERENCES dailytarget(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (varietyId) REFERENCES plant_care.cropvariety(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating Daily Target Items request table: ' + err);
            } else {
                resolve('Daily Target Items table created request successfully.');
            }
        });
    });
};


const createOfficerComplainsTable  = () => {
    const sql = `
   CREATE TABLE IF NOT EXISTS officercomplains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    officerId INT DEFAULT NULL,
    refNo VARCHAR(20) DEFAULT NULL,
    language VARCHAR(50) DEFAULT NULL,
    complainCategory VARCHAR(50) DEFAULT NULL,
    complain TEXT DEFAULT NULL,
    reply TEXT DEFAULT NULL,
    status VARCHAR(20) DEFAULT NULL,
    complainAssign VARCHAR(20) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (officerId) REFERENCES collectionofficer(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating officercomplains table: ' + err);
            } else {
                resolve('officercomplains table created successfully.');
            }
        });
    });
};




const createOfficerDailyTargetTable  = () => {
    const sql = `
  CREATE TABLE officerdailytarget (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dailyTargetId INT DEFAULT NULL,
  varietyId INT DEFAULT NULL,
  officerId INT DEFAULT NULL,
  grade VARCHAR(10) DEFAULT NULL,
  target DECIMAL(10,2) DEFAULT NULL,
  complete DECIMAL(10,2) DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dailyTargetId) REFERENCES dailytarget(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  FOREIGN KEY (varietyId) REFERENCES plant_care.cropvariety(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  FOREIGN KEY (officerId) REFERENCES collectionofficer(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) 
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating officerdailytarget table: ' + err);
            } else {
                resolve('officerdailytarget table created successfully.');
            }
        });
    });
};




const createCompanyCenterTable = () => {
    const sql = `
  CREATE TABLE IF NOT EXISTS companycenter (
      id INT AUTO_INCREMENT PRIMARY KEY,
      centerId INT(11) DEFAULT NULL,
      companyId INT(11) DEFAULT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (centerId) REFERENCES collectioncenter(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (companyId) REFERENCES company(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        collectionofficer.query(sql, (err, result) => {
            if (err) {
                reject('Error creating companycenter table: ' + err);
            } else {
                resolve('companycenter table created successfully.');
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
    createDailyTargetTable,
    createDailyTargetItemsTable,
    createOfficerComplainsTable,
    createOfficerDailyTargetTable,
    createCompanyCenterTable
};