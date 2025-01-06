const { plantcare, collectionofficer, marketPlace, dash } = require('../startup/database');
const { error } = require("console");
const Joi = require("joi");
const path = require("path");

exports.getAllCropNameDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `
          SELECT cg.id AS cropId, cv.id AS varietyId, cg.cropNameEnglish, cv.varietyNameEnglish AS varietyEnglish, cv.image
          FROM cropvariety cv, cropgroup cg
          WHERE cg.id = cv.cropGroupId
      `;

      plantcare.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }

      const groupedData = {};

      results.forEach((item) => {
        const { cropNameEnglish, varietyEnglish, varietyId, cropId, image } =
          item;

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
            variety: [],
          };
        }

        groupedData[cropNameEnglish].variety.push({
          id: varietyId,
          varietyEnglish: varietyEnglish,
          image: base64Image, // Store the Base64 image string
        });
      });

      // Format the final result
      const formattedResult = Object.keys(groupedData).map((cropName) => ({
        cropId: groupedData[cropName].cropId,
        cropNameEnglish: cropName,
        variety: groupedData[cropName].variety,
      }));

      resolve(formattedResult);
    });
  });
};

exports.createCropGroup = async (product) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO marketplaceitems (cropId, displayName, normalPrice, discountedPrice, promo, unitType, startValue, changeby, tags, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      product.variety,
      product.cropName,
      product.normalPrice,
      product.discountedPrice,
      product.promo,
      product.unitType,
      product.startValue,
      product.changeby,
      product.tags,
      product.category
    ];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};

// exports.getMarketplaceItems = () => {
//   return new Promise((resolve, reject) => {
//     const dataSql = `
//         SELECT
//             marketplaceitems.id AS itemId,
//             marketplaceitems.cropId AS cropId,
//             marketplaceitems.displayName AS itemDisplayName,
//             marketplaceitems.normalPrice AS itemNormalPrice,
//             marketplaceitems.discountedPrice AS itemDiscountedPrice,
//             marketplaceitems.promo AS itemPromo,
//             marketplaceitems.unitType AS unitType,
//             marketplaceitems.startValue AS startValue,
//             marketplaceitems.changeby AS changeby,
//             cropcalender.cropVarietyId AS cropVarietyEnglish,
//             cropcalender.suitableAreas AS cropSuitableAreas,
//             cropgroup.cropNameEnglish AS cropNameEnglish
//         FROM
//             marketplaceitems
//         JOIN cropcalender ON marketplaceitems.cropId = cropcalender.id
//         JOIN cropgroup ON cropcalender.id = cropgroup.id;
//       `;

//     db.query(dataSql, (error, results) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

exports.getMarketplaceItems = () => {
  return new Promise((resolve, reject) => {
    const dataSql = `
    SELECT m.id, m.cropId, cg.cropNameEnglish, m.displayName , cv.varietyNameEnglish, m.discountedPrice, m.startValue, m.promo, m.unitType, m.changeby, m.normalPrice, m.category
    FROM marketplaceitems m, plant-care.cropgroup cg, plant-care.cropvariety cv
    WHERE m.cropId = cv.id AND cv.cropGroupId = cg.id
    `;
    marketPlace.query(dataSql, (error, results) => {
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
    marketPlace.query(sql, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows);
      }
    });
  });
};

exports.createCoupenDAO = async (coupen) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO coupon (code, type, percentage, status, checkLimit, priceLimit, fixDiscount, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      coupen.code,
      coupen.type,
      coupen.percentage,
      coupen.status,
      coupen.checkLimit,
      coupen.priceLimit,
      coupen.fixDiscount,
      coupen.startDate,
      coupen.endDate,
    ];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};


exports.getAllCoupenDAO = (limit, offset, status, types, searchText) => {
  console.log(status);

  return new Promise((resolve, reject) => {
    let countParms = []
    let dataParms = []
    let countSql = " SELECT COUNT(*) AS total FROM coupon WHERE 1=1  ";
    let dataSql = `
      SELECT *
      FROM coupon
      WHERE 1=1
    `;

    if (status) {
      countSql += " AND status = ? "
      dataSql += ` AND status = ? `
      countParms.push(status)
      dataParms.push(status)
    }

    if (searchText) {
      countSql += " AND code = ? "
      dataSql += ` AND code = ? `
      countParms.push(searchText)
      dataParms.push(searchText)
    }


    if (types) {
      countSql += " AND type = ? "
      dataSql += ` AND type = ? `
      countParms.push(types)
      dataParms.push(types)
    }

    dataSql += ` LIMIT ? OFFSET ? `
    dataParms.push(limit)
    dataParms.push(offset)

    marketPlace.query(countSql, countParms, (countErr, countResults) => {
      if (countErr) {
        console.log(countErr);

        reject(countErr);
      } else {
        marketPlace.query(dataSql, dataParms, (dataErr, dataResults) => {
          if (dataErr) {
            console.log(dataErr);

            reject(dataErr);
          } else {
            resolve({
              total: countResults[0].total,
              items: dataResults,
            });
          }
        });
      }
    });
  });
};


exports.deleteCoupenById = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM coupon WHERE id = ?";
    marketPlace.query(sql, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows);
      }
    });
  });
};


exports.deleteAllCoupen = async () => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM coupon";
    marketPlace.query(sql, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows);
      }
    });
  });
};



exports.getAllProductCropCatogoryDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `
          SELECT cg.id AS cropId, mpi.normalPrice, mpi.discountedPrice, mpi.id AS varietyId, cg.cropNameEnglish, mpi.displayName
          FROM marketplaceitems mpi, plant-care.cropvariety cv, plant-care.cropgroup cg
          WHERE mpi.cropId = cv.id AND cv.cropGroupId = cg.id
      `;

      marketPlace.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }

      const groupedData = {};

      results.forEach((item) => {
        const { cropNameEnglish, displayName, varietyId, cropId, normalPrice, discountedPrice } = item;

        if (!groupedData[cropNameEnglish]) {
          groupedData[cropNameEnglish] = {
            cropId: cropId,
            variety: [],
          };
        }

        groupedData[cropNameEnglish].variety.push({
          id: varietyId,
          displayName: displayName,
          normalPrice: parseFloat(normalPrice),
          discountedPrice: parseFloat(discountedPrice)
        });
      });

      // Format the final result
      const formattedResult = Object.keys(groupedData).map((cropName) => ({
        cropId: groupedData[cropName].cropId,
        cropNameEnglish: cropName,
        variety: groupedData[cropName].variety,
      }));

      resolve(formattedResult);
    });
  });
};


exports.creatPackageDAO = async (data) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO marketplacepackages (name, status, total) VALUES (?, ?, ?)";
    const values = [
      data.name,
      data.status,
      data.total
    ];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};


exports.creatPackageDetailsDAO = async (data, packageId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO packagedetails (packageId, mpItemId, quantity, quantityType, discountedPrice) VALUES (?, ?, ?, ?, ?)";
    const values = [
      packageId,
      parseInt(data.mpItemId),
      data.quantity,
      data.qtytype,
      parseInt(data.discountedPrice),
    ];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};
