const db = require("../startup/database");
const { error } = require("console");
const Joi = require("joi");
const path = require("path");

exports.getAllCropNameDAO = () => {
  return new Promise((resolve, reject) => {
      const sql = `
          SELECT cg.id AS cropId, cc.id AS varietyId, cg.cropNameEnglish, cc.varietyEnglish, cc.image
          FROM cropcalender cc
          JOIN cropgroup cg ON cg.id = cc.cropGroupId
      `;

      db.query(sql, (err, results) => {
          if (err) {
              return reject(err);
          }

          const groupedData = {};

          results.forEach(item => {
              const { cropNameEnglish, varietyEnglish, varietyId, cropId, image } = item;

              // Convert image to base64 if available
              let base64Image = null;
              if (image) {
                  base64Image = Buffer.from(image).toString("base64");
                  const mimeType = "image/png"; // Set MIME type (adjust if necessary)
                  base64Image = `data:${mimeType};base64,${base64Image}`;
              }

              if (!groupedData[cropNameEnglish]) {
                  groupedData[cropNameEnglish] = {
                      cropId: cropId,
                      variety: []
                  };
              }

              groupedData[cropNameEnglish].variety.push({
                  id: varietyId,
                  varietyEnglish: varietyEnglish,
                  image: base64Image  // Store the Base64 image string
              });
          });

          // Format the final result
          const formattedResult = Object.keys(groupedData).map(cropName => ({
              cropId: groupedData[cropName].cropId,
              cropNameEnglish: cropName,
              variety: groupedData[cropName].variety
          }));

          resolve(formattedResult);
      });
  });
};





exports.createCropGroup = async (product) => {
    return new Promise((resolve, reject) => {
      const sql =
        "INSERT INTO marketplaceitems (cropId, displayName, normalPrice, discountedPrice, promo, unitType, startValue, changeby, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const values = [
        product.variety, 
        product.cropName, 
        product.normalPrice, 
        product.discountedPrice, 
        product.promo, 
        product.unitType, 
        product.startValue, 
        product.changeby,
        product.tags
      ];
  
      db.query(sql, values, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.insertId);
        }
      });
    });
  };
  



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
        JOIN cropgroup ON cropcalender.id = cropgroup.id;
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

exports.deleteMarketplaceItem = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM marketplaceitems WHERE id = ?";
    db.query(sql, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows);
      }
    });
  });
};

