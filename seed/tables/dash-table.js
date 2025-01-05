const { db, plantcare, dash } = require('../../startup/database');


const createSalesAgentTable = () => {
    const sql = `
    CREATE TABLE salesagent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    empType VARCHAR(50) NOT NULL,
    empId VARCHAR(50) NOT NULL UNIQUE,
    phoneCode1 VARCHAR(10) NOT NULL,
    phoneNumber1 VARCHAR(15) NOT NULL,
    phoneCode2 VARCHAR(10),
    phoneNumber2 VARCHAR(15),
    nic VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    houseNumber VARCHAR(50),
    streetName VARCHAR(100),
    city VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    accHolderName VARCHAR(100) NOT NULL,
    accNumber VARCHAR(50) NOT NULL UNIQUE,
    bankName VARCHAR(100) NOT NULL,
    branchName VARCHAR(100),
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
    salesagentId INT NOT NULL,
    date DATE NOT NULL,
    target INT NOT NULL,
    completed INT NOT NULL,
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