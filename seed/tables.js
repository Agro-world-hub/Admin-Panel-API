const db = require('../startup/database');

const createUsersTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(50) NOT NULL,
      lastName VARCHAR(50) NOT NULL,
      phoneNumber VARCHAR(12) NOT NULL,
      NICnumber VARCHAR(12) NOT NULL,
      profileImage LONGBLOB,
      farmerQr LONGBLOB,
      membership VARCHAR(25) NOT NULL,
      houseNo VARCHAR(10) NOT NULL,
      streetName VARCHAR(25) NULL,
      city VARCHAR(25) NOT NULL,
      district VARCHAR(25) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating users table: ' + err);
            } else {
                resolve('Users table created successfully.');
            }
        });
    });
};

const createAdminUserRolesTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS adminroles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role VARCHAR(100) NOT NULL
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating adminUserRoles table: ' + err);
            } else {
                resolve('adminUserRoles table created successfully.');
            }
        });
    });
};

const createAdminUsersTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS adminusers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mail VARCHAR(50) NOT NULL,
      userName VARCHAR(30) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role) REFERENCES adminroles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating adminUsers table: ' + err);
            } else {
                resolve('adminUsers table created successfully.');
            }
        });
    });
};


const createContentTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS content (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titleEnglish TEXT NOT NULL,
      titleSinhala TEXT NOT NULL,
      titleTamil TEXT NOT NULL,
      descriptionEnglish  TEXT NOT NULL,
      descriptionSinhala TEXT NOT NULL,
      descriptionTamil TEXT NOT NULL,
      image LONGBLOB,
      status VARCHAR(15) NOT NULL,
      publishDate TIMESTAMP,
      expireDate TIMESTAMP NULL DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      createdBy INT,
      FOREIGN KEY (createdBy) REFERENCES adminusers(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating content table: ' + err);
            } else {
                resolve('Content table created successfully.');
            }
        });
    });
};

const createCropGroup = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS cropgroup (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cropNameEnglish VARCHAR(50) NOT NULL,
      cropNameSinhala VARCHAR(50) NOT NULL,
      cropNameTamil VARCHAR(50) NOT NULL,
      category VARCHAR(255) NOT NULL,
      image LONGBLOB,
      bgColor VARCHAR(10),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating cropgroup table: ' + err);
            } else {
                resolve('cropgroup table created successfully.');
            }
        });
    });
};


const createCropVariety = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS cropvariety (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cropGroupId INT(11) NULL,
      varietyNameEnglish VARCHAR(50) NOT NULL,
      varietyNameSinhala VARCHAR(50) NOT NULL,
      varietyNameTamil VARCHAR(50) NOT NULL,
      descriptionEnglish TEXT NOT NULL,
      descriptionSinhala TEXT NOT NULL,
      descriptionTamil TEXT NOT NULL,
      image LONGBLOB,
      bgColor VARCHAR(10),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cropGroupId) REFERENCES cropgroup(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating cropvariety table: ' + err);
            } else {
                resolve('cropvariety table created successfully.');
            }
        });
    });
};


const createCropCalenderTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS cropcalender (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cropVarietyId INT(11) NULL,
      method VARCHAR(25) NOT NULL,
      natOfCul VARCHAR(25) NOT NULL,
      cropDuration VARCHAR(3) NOT NULL,
      suitableAreas TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cropVarietyId) REFERENCES cropvariety(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating cropCalender table: ' + err);
            } else {
                resolve('CropCalender table created successfully.');
            }
        });
    });
};



const createCropCalenderDaysTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS cropcalendardays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cropId INT(11) NOT NULL,
    taskIndex INT(255) NOT NULL,
    days INT(11) NOT NULL,
    taskTypeEnglish TEXT COLLATE latin1_swedish_ci NOT NULL,
    taskTypeSinhala TEXT COLLATE utf8_unicode_ci NOT NULL,
    taskTypeTamil TEXT COLLATE utf8_unicode_ci NOT NULL,
    taskCategoryEnglish TEXT COLLATE latin1_swedish_ci NOT NULL,
    taskCategorySinhala TEXT COLLATE utf8_unicode_ci NOT NULL,
    taskCategoryTamil TEXT COLLATE utf8_unicode_ci NOT NULL,
    taskEnglish TEXT COLLATE latin1_swedish_ci NOT NULL,
    taskSinhala TEXT COLLATE utf8_unicode_ci NOT NULL,
    taskTamil TEXT COLLATE utf8_unicode_ci NOT NULL,
    taskDescriptionEnglish TEXT COLLATE latin1_swedish_ci NOT NULL,
    taskDescriptionSinhala TEXT COLLATE utf8_unicode_ci NOT NULL,
    taskDescriptionTamil TEXT COLLATE utf8_unicode_ci NOT NULL,
    imageLink TEXT NOT NULL,
    videoLink TEXT NOT NULL,
    reqImages INT(11) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cropId) REFERENCES cropCalender(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating cropCalenderDays table: ' + err);
            } else {
                resolve('CropCalenderDays table created successfully.');
            }
        });
    });
};

const createOngoingCultivationsTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS ongoingcultivations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating ongoingCultivations table: ' + err);
            } else {
                resolve('OngoingCultivations table created successfully.');
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
        db.query(sql, (err, result) => {
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
      FOREIGN KEY (varietyId) REFERENCES cropvariety(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (createdBy) REFERENCES adminUsers(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (xlindex) REFERENCES xlsxhistory(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
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
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating marketpriceserve table: ' + err);
            } else {
                resolve('mmarketpriceserve table created successfully.');
            }
        });
    });
};



const createOngoingCultivationsCropsTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS ongoingcultivationscrops (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ongoingCultivationId INT,
      cropCalendar INT,
      startedAt DATE DEFAULT NULL,
      extentha DECIMAL(15, 2) NOT NULL,
      extentac DECIMAL(15, 2) NOT NULL,
      extentp DECIMAL(15, 2) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ongoingCultivationId) REFERENCES ongoingCultivations(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (cropCalendar) REFERENCES cropCalender(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating ongoingCultivationsCrops table: ' + err);
            } else {
                resolve('OngoingCultivationsCrops table created successfully.');
            }
        });
    });
};


const createCurrentAssetTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS currentasset (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      category VARCHAR(50) NOT NULL,
      asset VARCHAR(50) NOT NULL,
      brand VARCHAR(50) NOT NULL,
      batchNum VARCHAR(50) NOT NULL,
      unit VARCHAR(10) NOT NULL,
      unitVolume INT,
      numOfUnit DECIMAL(15, 2) NOT NULL,
      unitPrice DECIMAL(15, 2) NOT NULL,
      total DECIMAL(15, 2) NOT NULL,
      purchaseDate DATETIME NOT NULL,
      expireDate DATETIME NOT NULL,
      status VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating current asset table: ' + err);
            } else {
                resolve('current asset table created successfully.');
            }
        });
    });
};

//01
const createFixedAsset = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS fixedasset (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      category VARCHAR(50) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating fixed asset table: ' + err);
            } else {
                resolve('Fixed asset table created successfully.');
            }
        });
    });
};


//02
const createBuldingFixedAsset = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS buildingfixedasset (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fixedAssetId INT,
      type VARCHAR(50) NOT NULL,
      floorArea DECIMAL(15, 2) NOT NULL,
      ownership VARCHAR(50) NOT NULL,
      generalCondition VARCHAR(50) NOT NULL,
      district VARCHAR(15) NOT NULL,
      FOREIGN KEY (fixedAssetId) REFERENCES fixedasset(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating building fixed asset table: ' + err);
            } else {
                resolve('building Fixed asset table created successfully.');
            }
        });
    });
};



//03
const createLandFixedAsset = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS landfixedasset (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fixedAssetId INT,
      extentha DECIMAL(15, 2) NOT NULL,
      extentac DECIMAL(15, 2) NOT NULL,
      extentp DECIMAL(15, 2) NOT NULL,
      ownership VARCHAR(50) NOT NULL,
      district VARCHAR(15) NOT NULL,
      landFenced VARCHAR(15) NOT NULL,
      perennialCrop VARCHAR(15)  NOT NULL,
      FOREIGN KEY (fixedAssetId) REFERENCES fixedasset(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating land fixed asset table: ' + err);
            } else {
                resolve('Land fixed asset table created successfully.');
            }
        });
    });
};



//04
const createMachToolsFixedAsset = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS machtoolsfixedasset (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fixedAssetId INT,
      asset VARCHAR(50) NOT NULL,
      assetType VARCHAR(25) NOT NULL,
      mentionOther VARCHAR(50) NOT NULL,
      brand VARCHAR(25) NOT NULL,
      numberOfUnits INT NOT NULL,
      unitPrice DECIMAL(15, 2) NOT NULL,
      totalPrice DECIMAL(15, 2) NOT NULL,
      warranty VARCHAR(20) NOT NULL,
      FOREIGN KEY (fixedAssetId) REFERENCES fixedasset(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating machtools fixed asset table: ' + err);
            } else {
                resolve('machtools Fixed asset table created successfully.');
            }
        });
    });
};


//05
const createMachToolsWarrantyFixedAsset = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS machtoolsfixedassetwarranty (
      id INT AUTO_INCREMENT PRIMARY KEY,
      machToolsId INT,
      purchaseDate DATETIME NOT NULL,
      expireDate DATETIME NOT NULL,
      warrantystatus VARCHAR(20) NOT NULL,
      FOREIGN KEY (machToolsId) REFERENCES machtoolsfixedasset(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating fixed asset warranty table: ' + err);
            } else {
                resolve('Fixed asset warranty table created successfully.');
            }
        });
    });
};


//06
const createOwnershipOwnerFixedAsset = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS ownershipownerfixedasset (
      id INT AUTO_INCREMENT PRIMARY KEY,
      buildingAssetId INT NULL,
      landAssetId INT NULL,
      issuedDate DATETIME NOT NULL,
      estimateValue DECIMAL(15, 2) NOT NULL,
      FOREIGN KEY (buildingAssetId) REFERENCES buildingfixedasset(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
     FOREIGN KEY (landAssetId) REFERENCES landfixedasset(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating ownershipownerfixedasset table: ' + err);
            } else {
                resolve('ownershipownerfixedasset table created successfully.');
            }
        });
    });
};

//07

const createOwnershipLeastFixedAsset = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS ownershipleastfixedasset (
      id INT AUTO_INCREMENT PRIMARY KEY,
      buildingAssetId INT NULL,
      landAssetId INT NULL,
      startDate DATETIME NOT NULL,
      durationYears INT(8) NOT NULL,
      durationMonths INT(8) NOT NULL,
      leastAmountAnnually DECIMAL(15, 2) NOT NULL,
      FOREIGN KEY (buildingAssetId) REFERENCES buildingfixedasset(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
     FOREIGN KEY (landAssetId) REFERENCES landfixedasset(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating ownershipleastfixedasset table: ' + err);
            } else {
                resolve('ownershipleastfixedasset table created successfully.');
            }
        });
    });
};


//08
const createOwnershipPermitFixedAsset = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS ownershippermitfixedasset (
      id INT AUTO_INCREMENT PRIMARY KEY,
      buildingAssetId INT NULL,
      landAssetId INT NULL,
      issuedDate DATETIME NOT NULL,
      permitFeeAnnually DECIMAL(15, 2) NOT NULL,
      FOREIGN KEY (buildingAssetId) REFERENCES buildingfixedasset(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
     FOREIGN KEY (landAssetId) REFERENCES landfixedasset(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating ownershippermitfixedasset table: ' + err);
            } else {
                resolve('ownershippermitfixedasset table created successfully.');
            }
        });
    });
};

//09
const createOwnershipSharedFixedAsset = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS ownershipsharedfixedasset (
      id INT AUTO_INCREMENT PRIMARY KEY,
      buildingAssetId INT NULL,
      landAssetId INT NULL,
      paymentAnnually DECIMAL(15, 2) NOT NULL,
      FOREIGN KEY (buildingAssetId) REFERENCES buildingfixedasset(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
     FOREIGN KEY (landAssetId) REFERENCES landfixedasset(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating ownershipsharedfixedasset table: ' + err);
            } else {
                resolve('ownershipsharedfixedasset table created successfully.');
            }
        });
    });
};


const createCurrentAssetRecord = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS currentassetrecord (
    id INT AUTO_INCREMENT PRIMARY KEY,
    currentAssetId INT(5) NOT NULL,
    numOfPlusUnit DECIMAL(15, 2) NULL,
    numOfMinUnit DECIMAL(15, 2) NULL,
    totalPrice DECIMAL(15, 2) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (currentAssetId) REFERENCES currentasset(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating cuurent asset record table: ' + err);
            } else {
                resolve('current asset record table created successfully.');
            }
        });
    });
};





const createSlaveCropCalenderDaysTable = () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS slavecropcalendardays (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT(11) NULL,
      onCulscropID  INT(11) NULL,
      cropCalendarId INT(11) NULL,
      taskIndex INT(255) NULL,
      startingDate DATE DEFAULT NULL,
      days INT(255) NULL,
      taskTypeEnglish TEXT COLLATE latin1_swedish_ci NULL,
      taskTypeSinhala TEXT COLLATE utf8_unicode_ci NULL,
      taskTypeTamil TEXT COLLATE utf8_unicode_ci NULL,
      taskCategoryEnglish TEXT COLLATE latin1_swedish_ci NULL,
      taskCategorySinhala TEXT COLLATE utf8_unicode_ci NULL,
      taskCategoryTamil TEXT COLLATE utf8_unicode_ci NULL,
      taskEnglish TEXT COLLATE latin1_swedish_ci NULL,
      taskSinhala TEXT COLLATE utf8_unicode_ci NULL,
      taskTamil TEXT COLLATE utf8_unicode_ci NULL,
      taskDescriptionEnglish TEXT COLLATE latin1_swedish_ci NULL,
      taskDescriptionSinhala TEXT COLLATE utf8_unicode_ci NULL,
      taskDescriptionTamil TEXT COLLATE utf8_unicode_ci NULL,
      status VARCHAR(20),
      imageLink TEXT,
      videoLink TEXT,
      reqImages INT(11) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
      FOREIGN KEY (cropCalendarId) REFERENCES cropCalender(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (onCulscropID) REFERENCES ongoingcultivationscrops(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
  );
    `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating slave crop Calender Days table: ' + err);
            } else {
                resolve('slave crop   table created successfully.');
            }
        });
    });
};


const createTaskImages = () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS taskimages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slaveId INT(11) NOT NULL,
            image LONGBLOB,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (slaveId) REFERENCES slavecropcalendardays(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
  );
    `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error taskimages table: ' + err);
            } else {
                resolve('taskimages table created successfully.');
            }
        });
    });
};




const createpublicforumposts = () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS publicforumposts (
            id int AUTO_INCREMENT PRIMARY KEY,
            userId int NOT NULL,
            heading varchar(255) NOT NULL,
            message text NOT NULL,
            createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            postimage longblob,
            FOREIGN KEY (userId) REFERENCES users(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
  );
    `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error publicforumposts table: ' + err);
            } else {
                resolve('publicforumposts table created successfully.');
            }
        });
    });
};

const createpublicforumreplies = () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS publicforumreplies (
        id int AUTO_INCREMENT PRIMARY KEY,
        chatId int NOT NULL,
        replyId int NOT NULL,
        replyMessage text NOT NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (replyId) REFERENCES users(id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
        FOREIGN KEY (chatId) REFERENCES publicforumposts(id)
            ON DELETE CASCADE
            ON UPDATE CASCADE

  );
    `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error publicforumreplies table: ' + err);
            } else {
                resolve('publicforumreplies table created successfully.');
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
      firstNameEnglish VARCHAR(50) NOT NULL,
      firstNameSinhala VARCHAR(50) NOT NULL,
      firstNameTamil VARCHAR(50) NOT NULL,
      lastNameEnglish VARCHAR(50) NOT NULL,
      lastNameSinhala VARCHAR(50) NOT NULL,
      lastNameTamil VARCHAR(50) NOT NULL,
      phoneNumber01 VARCHAR(12) NOT NULL,
      phoneNumber02 VARCHAR(12) NOT NULL,
      image LONGBLOB,
      QRcode LONGBLOB,
      nic VARCHAR(12) NOT NULL,
      email VARCHAR(50) NOT NULL,
      password VARCHAR(20) NULL,
      passwordUpdated  BOOLEAN NULL,
      houseNumber VARCHAR(10) NOT NULL,
      streetName VARCHAR(50) NOT NULL,
      city VARCHAR(50) NOT NULL,
      district VARCHAR(25) NOT NULL,
      province VARCHAR(25) NOT NULL,
      country VARCHAR(25) NOT NULL,
      languages VARCHAR(255) NOT NULL,
      status VARCHAR(25) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (centerId) REFERENCES collectioncenter(id)

    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating collection officer table: ' + err);
            } else {
                resolve('collection officer table created successfully.');
            }
        });
    });
};


const createCollectionOfficerCompanyDetails = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS collectionofficercompanydetails (
      id INT AUTO_INCREMENT PRIMARY KEY,
      collectionOfficerId INT,
      companyNameEnglish VARCHAR(255) NOT NULL,
      companyNameSinhala VARCHAR(255) NOT NULL,
      companyNameTamil VARCHAR(255) NOT NULL,
      jobRole VARCHAR(50) NOT NULL,
      IRMname VARCHAR(75) NOT NULL,
      companyEmail VARCHAR(50) NOT NULL,
      assignedDistrict VARCHAR(25) NOT NULL,
      employeeType VARCHAR(25) NOT NULL,
      empId VARCHAR(10) NOT NULL,
      FOREIGN KEY (collectionOfficerId) REFERENCES collectionofficer(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating collection officer company details table: ' + err);
            } else {
                resolve('collection officer company details table created successfully.');
            }
        });
    });
};



const createCollectionOfficerBankDetails = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS collectionofficerbankdetails (
      id INT AUTO_INCREMENT PRIMARY KEY,
      collectionOfficerId INT,
      accHolderName VARCHAR(75) NOT NULL,
      accNumber VARCHAR(25) NOT NULL,
      bankName VARCHAR(25) NOT NULL,
      branchName VARCHAR(25) NOT NULL,
      FOREIGN KEY (collectionOfficerId) REFERENCES collectionofficer(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating collection bank details officer table: ' + err);
            } else {
                resolve('collection officer bank details table created successfully.');
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
      FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (collectionOfficerId) REFERENCES collectionofficer(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
      
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
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
      FOREIGN KEY (cropId) REFERENCES cropvariety(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating farmerpaymentscrops table: ' + err);
            } else {
                resolve('farmerpaymentscrops table created successfully.');
            }
        });
    });
};



exports.getPaymentSlipReport = (officerID) => {
  return new Promise((resolve, reject) => {
    const dataSql = `
      SELECT 
        u.id AS userId,
        u.firstName,
        u.lastName,
        u.NICnumber,
        co.firstNameEnglish AS officerFirstName,
        co.lastNameEnglish AS officerLastName,
        fpc.gradeAprice,
        fpc.gradeBprice,
        fpc.gradeCprice,
        fpc.gradeAquan,
        fpc.gradeBquan,
        fpc.gradeCquan,
        (fpc.gradeAprice * fpc.gradeAquan) +
        (fpc.gradeBprice * fpc.gradeBquan) +
        (fpc.gradeCprice * fpc.gradeCquan) AS totalAmount
      FROM 
        registeredfarmerpayments rp
      JOIN 
        users u ON rp.userId = u.id
      JOIN 
        farmerpaymentscrops fpc ON rp.id = fpc.registerFarmerId
      JOIN 
        collectionofficer co ON rp.collectionOfficerId = co.id
      WHERE 
        rp.collectionOfficerId = ?
      ORDER BY 
        u.id;
    `;
    db.query(dataSql, [officerID], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};





const createUserBankDetails = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS userbankdetails (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      address TEXT NOT NULL,
      accNumber VARCHAR(50) NOT NULL,
      accHolderName VARCHAR(50) NOT NULL,
      bankName VARCHAR(50) NOT NULL,
      branchName VARCHAR(50) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating userbankdetails table: ' + err);
            } else {
                resolve('userbankdetails table created successfully.');
            }
        });
    });
};


const createCollectionCenter = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS collectioncenter (
      id INT AUTO_INCREMENT PRIMARY KEY,
      regCode VARCHAR(30) NOT NULL,
      centerName VARCHAR(30) NOT NULL,
      contact01 VARCHAR(13) NOT NULL,
      contact02 VARCHAR(13) NOT NULL,
      buildingNumber VARCHAR(50) NOT NULL,
      street VARCHAR(50) NOT NULL,
      district VARCHAR(30) NOT NULL,
      province VARCHAR(30) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating collectioncenter table: ' + err);
            } else {
                resolve('collectioncenter table created successfully.');
            }
        });
    });
};




const createCollectionCenterOfficer = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS collectioncenterofficer (
      id INT AUTO_INCREMENT PRIMARY KEY,
      centerId INT,
      name VARCHAR(30) NOT NULL,
      role VARCHAR(13) NOT NULL,
      contact01 VARCHAR(13) NOT NULL,
      contact02 VARCHAR(50) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (centerId) REFERENCES collectioncenter(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating collectioncenterofficer table: ' + err);
            } else {
                resolve('collectioncenterofficer table created successfully.');
            }
        });
    });
};

const createFarmerComplains  = () => {
    const sql = `
   CREATE TABLE IF NOT EXISTS farmerComplains (
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
    FOREIGN KEY (farmerId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (coId) REFERENCES collectionofficer(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
)
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating market place users table: ' + err);
            } else {
                resolve('market place users table created successfully.');
            }
        });
    });
};






//Seed for market Place Application

const createMarketPlaceUsersTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS marketplaceusers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(50) NOT NULL,
      lastName VARCHAR(50) NOT NULL,
      phoneNumber VARCHAR(12) NOT NULL,
      NICnumber VARCHAR(12) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating market place users table: ' + err);
            } else {
                resolve('market place users table created successfully.');
            }
        });
    });
};


const createMarketPlacePackages = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS marketplacepackages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      status VARCHAR(10)  NOT NULL,
      total DECIMAL(15, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating market place users package: ' + err);
            } else {
                resolve('market place package table created successfully.');
            }
        });
    });
};

const createCoupon = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS coupon(
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(25),
      type VARCHAR(25) NOT NULL,
      percentage DECIMAL(15, 2),
      status VARCHAR(25) NOT NULL,
      checkLimit Boolean NOT NULL,
      priceLimit DECIMAL(15,2),
      fixDiscount DECIMAL(15,2),
      startDate DATETIME NOT NULL,
      endDate DATETIME NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating coupen table: ' + err);
            } else {
                resolve('coupen table created successfully.');
            }
      });
});
};


const createMarketPlaceItems = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS marketplaceitems (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cropId INT,
      displayName VARCHAR(50) NOT NULL,
      category VARCHAR(25) NOT NULL,
      normalPrice DECIMAL(15, 2) NOT NULL,
      discountedPrice DECIMAL(15, 2) NOT NULL,
      promo BOOLEAN  NOT NULL,
      unitType VARCHAR(5) NOT NULL,
      startValue DECIMAL(15, 2) NOT NULL,
      changeby DECIMAL(15, 2) NOT NULL,
      tags TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cropId) REFERENCES cropvariety(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating market place items table: ' + err);
            } else {
                resolve('market place items table created successfully.');
            }
        });
    });
};


const createPackageDetails = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS packagedetails (
      id INT AUTO_INCREMENT PRIMARY KEY,
      packageId INT,
      mpItemId INT,
      quantity INT(11) NOT NULL,
      quantityType VARCHAR(5) NOT NULL,
      discountedPrice DECIMAL(15, 2) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (packageId) REFERENCES marketplacepackages(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
      FOREIGN KEY (mpItemId) REFERENCES marketplaceitems(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating package details table: ' + err);
            } else {
                resolve('package details table created successfully.');
            }
        });
    });
};


const createPromoItems = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS promoitems (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mpItemId INT,
      discount DECIMAL(15, 2) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mpItemId) REFERENCES marketplaceitems(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating promo items table: ' + err);
            } else {
                resolve('promo items table created successfully.');
            }
        });
    });
};


const createCart = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      status VARCHAR(13) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating cart table: ' + err);
            } else {
                resolve('cart table created successfully.');
            }
        });
    });
};


const createCartItems = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS cartitems (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cartId INT,
      mpItemId INT,
      quantity DECIMAL(8, 2) NOT NULL,
      total DECIMAL(15, 2) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cartId) REFERENCES cart(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
      FOREIGN KEY (mpItemId) REFERENCES marketplaceitems(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating cart table: ' + err);
            } else {
                resolve('cart table created successfully.');
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
      FOREIGN KEY (empId) REFERENCES collectionofficercompanydetails(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating market-price request table: ' + err);
            } else {
                resolve('market-price table created request successfully.');
            }
        });
    });
};


module.exports = {
    createUsersTable,
    createAdminUserRolesTable,
    createAdminUsersTable,
    createContentTable,
    createCropGroup,
    createCropVariety,
    createCropCalenderTable,
    createCropCalenderDaysTable,
    createOngoingCultivationsTable,
    createXlsxHistoryTable,
    createMarketPriceTable,
    createMarketPriceServeTable,
    createOngoingCultivationsCropsTable,
    createCurrentAssetTable,
    createpublicforumposts,
    createpublicforumreplies,

    createFixedAsset, //1
    createBuldingFixedAsset, //2
    createLandFixedAsset, //3
    createMachToolsFixedAsset, //4
    createMachToolsWarrantyFixedAsset, //5
    createOwnershipOwnerFixedAsset, //6
    createOwnershipLeastFixedAsset, //7
    createOwnershipPermitFixedAsset, //8
    createOwnershipSharedFixedAsset, //9
    createCurrentAssetRecord,


    createSlaveCropCalenderDaysTable,
    createTaskImages,

    //collection officer
    createCollectionOfficer,
    createCollectionOfficerCompanyDetails,
    createCollectionOfficerBankDetails,
    createRegisteredFarmerPayments,
    createFarmerPaymensCrops,
    createUserBankDetails,
    createCollectionCenter,
    createCollectionCenterOfficer,
    createFarmerComplains,

    //Seed for market Place Application
    createMarketPlaceUsersTable,
    createMarketPlacePackages,
    createCoupon,
    createMarketPlaceItems,
    createPackageDetails,
    createPromoItems,
    createCart,
    createCartItems,
    createMarketPriceRequestTable
};