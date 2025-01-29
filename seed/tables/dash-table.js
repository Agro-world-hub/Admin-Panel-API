const { db, plantcare, dash } = require('../../startup/database');


const createSalesAgentTable = () => {
    const sql = `
    CREATE TABLE salesagent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) DEFAULT NULL,
    lastName VARCHAR(100) DEFAULT NULL,
    empType VARCHAR(50) DEFAULT NULL,
    empId VARCHAR(50) DEFAULT NULL,
    phoneCode1 VARCHAR(10) DEFAULT NULL,
    phoneNumber1 VARCHAR(15) DEFAULT NULL,
    phoneCode2 VARCHAR(10) DEFAULT NULL,
    phoneNumber2 VARCHAR(15) DEFAULT NULL,
    nic VARCHAR(50) DEFAULT NULL,
    email VARCHAR(100) DEFAULT NULL,
    houseNumber VARCHAR(50) DEFAULT NULL,
    streetName VARCHAR(100) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    district VARCHAR(100) DEFAULT NULL,
    province VARCHAR(100) DEFAULT NULL,
    country VARCHAR(100) DEFAULT NULL,
    accHolderName VARCHAR(100) DEFAULT NULL,
    accNumber VARCHAR(50) DEFAULT NULL,
    bankName VARCHAR(100) DEFAULT NULL,
    branchName VARCHAR(100) DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'pending', 
    password VARCHAR(255),
    passwordUpdate BOOLEAN DEFAULT 0,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)

  `;
    return new Promise((resolve, reject) => {
        dash.query(sql, (err, result) => {
            if (err) {
                reject('Error creating salesagent table: ' + err);
            } else {
                resolve('salesagent table created request successfully.');
            }
        });
    });
};



const createSalesAgentStarTable = () => {
    const sql = `
    CREATE TABLE salesagentstars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    salesagentId INT DEFAULT NULL,
    date DATE DEFAULT NULL,
    target INT DEFAULT NULL,
    completed INT DEFAULT NULL,
    numOfStars BOOLEAN NOT NULL DEFAULT 0, 
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salesagentId) REFERENCES salesagent(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
  `;
    return new Promise((resolve, reject) => {
        dash.query(sql, (err, result) => {
            if (err) {
                reject('Error creating salesagentstars table: ' + err);
            } else {
                resolve('ssalesagentstars table created request successfully.');
            }
        });
    });
};






const createCustomerTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS customer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cusId VARCHAR(15) UNIQUE DEFAULT NULL,
    title VARCHAR(10) DEFAULT NULL,
    firstName VARCHAR(50) DEFAULT NULL,
    lastName VARCHAR(50) DEFAULT NULL,
    phoneNumber VARCHAR(20) DEFAULT NULL,
    email VARCHAR(100) UNIQUE DEFAULT NULL,
    buildingType VARCHAR(20) DEFAULT NULL  
)
  `;
    return new Promise((resolve, reject) => {
        dash.query(sql, (err, result) => {
            if (err) {
                reject('Error creating customer table: ' + err);
            } else {
                resolve('customer table created request successfully.');
            }
        });
    });
};





const createHouseTable  = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS house (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT DEFAULT NULL,
    houseNo VARCHAR(50) DEFAULT NULL,
    streetName VARCHAR(100) DEFAULT NULL,
    city VARCHAR(50) DEFAULT NULL,
    FOREIGN KEY (customerId) REFERENCES customer(id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
  `;
    return new Promise((resolve, reject) => {
        dash.query(sql, (err, result) => {
            if (err) {
                reject('Error creating house table: ' + err);
            } else {
                resolve('house table created request successfully.');
            }
        });
    });
};







const createApartmentTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS apartment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT DEFAULT NULL,
    buildingNo VARCHAR(50) DEFAULT NULL,
    buildingName VARCHAR(100) DEFAULT NULL,
    unitNo VARCHAR(50) DEFAULT NULL,
    floorNo VARCHAR(10) DEFAULT NULL,
    houseNo VARCHAR(50) DEFAULT NULL,
    streetName VARCHAR(100) DEFAULT NULL,
    city VARCHAR(50) DEFAULT NULL,
    FOREIGN KEY (customerId) REFERENCES customer(id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
  `;
    return new Promise((resolve, reject) => {
        dash.query(sql, (err, result) => {
            if (err) {
                reject('Error creating apartment table: ' + err);
            } else {
                resolve('apartment table created request successfully.');
            }
        });
    });
};




module.exports = {
    createSalesAgentTable,
    createSalesAgentStarTable,
    createCustomerTable,
    createHouseTable,
    createApartmentTable
};