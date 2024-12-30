const { db, plantcare, collectionofficer, marketPlace } = require('../../startup/database');



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
        marketPlace.query(sql, (err, result) => {
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
        marketPlace.query(sql, (err, result) => {
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
        marketPlace.query(sql, (err, result) => {
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
      FOREIGN KEY (cropId) REFERENCES plant_care.cropvariety(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        marketPlace.query(sql, (err, result) => {
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
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (mpItemId) REFERENCES marketplaceitems(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        marketPlace.query(sql, (err, result) => {
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
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        marketPlace.query(sql, (err, result) => {
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
      FOREIGN KEY (userId) REFERENCES plant_care.users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        marketPlace.query(sql, (err, result) => {
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
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (mpItemId) REFERENCES marketplaceitems(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        marketPlace.query(sql, (err, result) => {
            if (err) {
                reject('Error creating cart table: ' + err);
            } else {
                resolve('cart table created successfully.');
            }
        });
    });
};





module.exports = {
    createMarketPlaceUsersTable,
    createMarketPlacePackages,
    createCoupon,
    createMarketPlaceItems,
    createPackageDetails,
    createPromoItems,
    createCart,
    createCartItems,
};