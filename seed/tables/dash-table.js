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




module.exports = {
    createSalesAgentTable,
    createSalesAgentStarTable,
};