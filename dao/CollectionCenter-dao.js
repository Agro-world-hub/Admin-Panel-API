const db = require("../startup/database")
const Joi = require('joi')

exports.addCollectionCenter = (center) =>{
    return new Promise((resolve, reject)=>{
        const sql = `INSERT INTO collectioncenter 
      (regCode, centerName, contact01, contact02, buildingNumber, street, district, province) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [
        center.regCode,
      center.centerName,
      center.contact01,
      center.contact02,
      center.buildingNumber,
      center.street,
      center.district,
      center.province
      ];
      db.query(sql, values,(err, results)=>{
        if(err){
            reject(err);
        }else{
            resolve(results);
        }
      });
    });
};