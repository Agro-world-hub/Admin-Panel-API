const { error } = require("console");
const db = require("../startup/database");
const Joi = require("joi");
const path = require("path");


// exports.getMarketplaceItems = () => {
//     return new Promise((resolve, reject) => {
//       const dataSql = `
//         SELECT 
//             marketplaceitems.id AS itemId,
//             marketplaceitems.cropId AS cropId,
//             marketplaceitems.displayName AS itemDisplayName,
//             marketplaceitems.normalPrice AS itemNormalPrice,
//             marketplaceitems.discountedPrice AS itemDiscountedPrice,
//             marketplaceitems.promo AS itemPromo,
//             marketplaceitems.unitType AS unitType,
//             marketplaceitems.startValue AS startValue,
//             marketplaceitems.changeby AS changeby
//             cropcalender.varietyEnglish AS cropVarietyEnglish,
//             cropcalender.suitableAreas AS cropSuitableAreas
//         FROM 
//             marketplaceitems
//         JOIN cropcalender ON marketplaceitems.cropId = cropcalender.id;
//       `;
  
//       db.query(dataSql, (error, results) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(results);
//         }
//       });
//     });
//   };
  
exports.getMarketplaceItems = () => {
    return new Promise((resolve, reject) => {
      const dataSql = `
        SELECT 
            marketplaceitems.id AS itemId,
            marketplaceitems.cropId AS cropId,
            marketplaceitems.displayName AS itemDisplayName,
            marketplaceitems.normalPrice AS itemNormalPrice,
            marketplaceitems.discountedPrice AS itemDiscountedPrice,
            marketplaceitems.promo AS itemPromo,
            marketplaceitems.unitType AS unitType,
            marketplaceitems.startValue AS startValue,
            marketplaceitems.changeby AS changeby,
            cropcalender.varietyEnglish AS cropVarietyEnglish,
            cropcalender.suitableAreas AS cropSuitableAreas,
            cropgroup.cropNameEnglish AS cropNameEnglish
        FROM 
            marketplaceitems
        JOIN cropcalender ON marketplaceitems.cropId = cropcalender.id
        JOIN cropgroup ON cropcalender.cropGroupId = cropgroup.id;
      `;
  
      db.query(dataSql, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
};
  