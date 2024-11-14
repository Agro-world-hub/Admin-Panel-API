const db = require("../startup/database");

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
  
