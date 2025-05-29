const {
    plantcare,
    collectionofficer,
    marketPlace,
    dash,
} = require("../startup/database");
const { error } = require("console");
const Joi = require("joi");
const path = require("path");

exports.createDistributionCenter = (data) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO distribution_centers 
        (name, officerInCharge, contact1, contact1Code, contact2, contact2Code, latitude, longitude, email, country, province, district, city)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      const values = [
        data.name,
        data.officerInCharge,
        data.contact1,
        data.contact1Code,
        data.contact2,
        data.contact2Code,
        data.latitude,
        data.longitude,
        data.email,
        data.country,
        data.province,
        data.district,
        data.city
      ];
  
      dash.query(sql, values, (err, result) => {
        if (err) {
          console.error("Error inserting distribution center:", err);
          return reject(err);
        }
        resolve(result);
      });
    });
  };
  