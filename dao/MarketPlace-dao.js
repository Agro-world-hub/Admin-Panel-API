const {
  plantcare,
  collectionofficer,
  marketPlace,
  dash,
} = require("../startup/database");
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

        if (!groupedData[cropNameEnglish]) {
          groupedData[cropNameEnglish] = {
            cropId: cropId,
            variety: [],
          };
        }

        groupedData[cropNameEnglish].variety.push({
          id: varietyId,
          varietyEnglish: varietyEnglish,
          image: image, // Store the Base64 image string
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

// exports.createMarketProductDao = async (product) => {
//   return new Promise((resolve, reject) => {
//     const sql =
//       "INSERT INTO marketplaceitems (cropId, displayName, normalPrice, discountedPrice, promo, unitType, startValue, changeby, tags, category, discount, displayType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//     const values = [
//       product.variety,
//       product.cropName,
//       product.normalPrice,
//       product.discountedPrice,
//       product.promo,
//       product.unitType,
//       product.startValue,
//       product.changeby,
//       product.tags,
//       product.category,
//       product.discount,
//       product.displaytype,
//     ];

//     marketPlace.query(sql, values, (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

exports.createMarketProductDao = async (product) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO marketplaceitems (displayName, normalPrice, discountedPrice, promo, unitType, startValue, changeby, tags, category, discount, varietyId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      product.cropName,
      product.normalPrice,
      product.discountedPrice,
      product.promo,
      product.unitType,
      product.startValue,
      product.changeby,
      product.tags,
      product.category,
      product.discount,
      product.varietyId,
    ];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// exports.getMarketplaceItems = () => {
//   return new Promise((resolve, reject) => {
//     const dataSql = `
//     SELECT m.id, m.cropId, cg.cropNameEnglish, m.displayName , cv.varietyNameEnglish, m.discountedPrice, m.startValue, m.promo, m.unitType, m.changeby, m.normalPrice, m.category
//     FROM marketplaceitems m, plant_care.cropgroup cg, plant_care.cropvariety cv
//     WHERE m.cropId = cv.id AND cv.cropGroupId = cg.id
//     `;
//     marketPlace.query(dataSql, (error, results) => {
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
    SELECT m.id, m.displayName, m.discountedPrice, m.startValue, m.promo,
           m.unitType, m.changeby, m.normalPrice, m.category,
           cg.cropNameEnglish, cv.varietyNameEnglish
    FROM marketplaceitems m
    JOIN plant_care.cropvariety cv ON m.varietyId = cv.id
    JOIN plant_care.cropgroup cg ON cv.cropGroupId = cg.id
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
    let countParms = [];
    let dataParms = [];
    let countSql = " SELECT COUNT(*) AS total FROM coupon WHERE 1=1  ";
    let dataSql = `
      SELECT *
      FROM coupon
      WHERE 1=1
    `;

    if (status) {
      countSql += " AND status = ? ";
      dataSql += ` AND status = ? `;
      countParms.push(status);
      dataParms.push(status);
    }

    if (searchText) {
      countSql += " AND code = ? ";
      dataSql += ` AND code = ? `;
      countParms.push(searchText);
      dataParms.push(searchText);
    }

    if (types) {
      countSql += " AND type = ? ";
      dataSql += ` AND type = ? `;
      countParms.push(types);
      dataParms.push(types);
    }

    dataSql += ` LIMIT ? OFFSET ? `;
    dataParms.push(limit);
    dataParms.push(offset);

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

// exports.getAllProductCropCatogoryDAO = () => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//           SELECT cg.id AS cropId, mpi.normalPrice, mpi.discountedPrice, mpi.id AS varietyId, cg.cropNameEnglish, mpi.displayName
//           FROM marketplaceitems mpi, plant_care.cropvariety cv, plant_care.cropgroup cg
//           WHERE mpi.cropId = cv.id AND cv.cropGroupId = cg.id
//       `;

//     marketPlace.query(sql, (err, results) => {
//       if (err) {
//         return reject(err);
//       }

//       const groupedData = {};

//       results.forEach((item) => {
//         const {
//           cropNameEnglish,
//           displayName,
//           varietyId,
//           cropId,
//           normalPrice,
//           discountedPrice,
//         } = item;

//         if (!groupedData[cropNameEnglish]) {
//           groupedData[cropNameEnglish] = {
//             cropId: cropId,
//             variety: [],
//           };
//         }

//         groupedData[cropNameEnglish].variety.push({
//           id: varietyId,
//           displayName: displayName,
//           normalPrice: parseFloat(normalPrice),
//           discountedPrice: parseFloat(discountedPrice),
//         });
//       });

//       // Format the final result
//       const formattedResult = Object.keys(groupedData).map((cropName) => ({
//         cropId: groupedData[cropName].cropId,
//         cropNameEnglish: cropName,
//         variety: groupedData[cropName].variety,
//       }));

//       resolve(formattedResult);
//     });
//   });
// };

exports.getAllProductCropCatogoryDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `
          SELECT cg.id AS cropId, mpi.normalPrice, mpi.discountedPrice, mpi.id AS varietyId, cg.cropNameEnglish, mpi.displayName
          FROM marketplaceitems mpi, plant_care.cropvariety cv, plant_care.cropgroup cg
          WHERE mpi.varietyId = cv.id AND cv.cropGroupId = cg.id
      `;

    marketPlace.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }

      const groupedData = {};

      results.forEach((item) => {
        const {
          cropNameEnglish,
          displayName,
          varietyId,
          cropId,
          normalPrice,
          discountedPrice,
        } = item;

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
          discountedPrice: parseFloat(discountedPrice),
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

exports.creatPackageDAO = async (data, profileImageUrl) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO marketplacepackages (name, status, total, image, description, portion, period) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [
      data.name,
      data.status,
      data.total,
      profileImageUrl,
      data.description,
      data.portion,
      data.period,
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
exports.getProductById = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
          SELECT 
            CG.id AS cropGroupId,
            CV.image,
            CV.id AS varietyId,
            CV.varietyNameEnglish,
            MPI.displayName AS cropName,
            MPI.category,
            MPI.normalPrice,
            MPI.discountedPrice,
            MPI.promo,
            MPI.unitType,
            MPI.startValue,
            MPI.changeby,
            MPI.tags
          FROM marketplaceitems MPI
          JOIN plant_care.cropvariety CV ON MPI.varietyId = CV.id
          JOIN plant_care.cropgroup CG ON CV.cropGroupId = CG.id
          WHERE MPI.id = ?
    `;
    marketPlace.query(sql, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          let product = results[0];

          product.tags = product.tags
            ? product.tags.split(",").map((tag) => tag.trim())
            : [];

          resolve(product);
        } else {
          resolve([]);
        }
      }
    });
  });
};

// exports.updateMarketProductDao = async (product, id) => {
//   return new Promise((resolve, reject) => {
//     const sql = `UPDATE marketplaceitems
//        SET
//         cropId = ?,
//         displayName = ?,
//         normalPrice = ?,
//         discountedPrice = ?,
//         promo = ?,
//         unitType = ?,
//         startValue = ?,
//         changeby = ?,
//         tags = ?,
//         category = ?,
//         discount = ?,
//         displaytype = ?
//         WHERE id = ?
//       `;
//     const values = [
//       product.variety,
//       product.cropName,
//       product.normalPrice,
//       product.discountedPrice,
//       product.promo,
//       product.unitType,
//       product.startValue,
//       product.changeby,
//       product.tags,
//       product.category,
//       product.discount,
//       product.displaytype,
//       id,
//     ];

//     marketPlace.query(sql, values, (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

exports.updateMarketProductDao = async (product, id) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE marketplaceitems
       SET  
        displayName = ?, 
        normalPrice = ?, 
        discountedPrice = ?, 
        promo = ?, 
        unitType = ?, 
        startValue = ?, 
        changeby = ?, 
        tags = ?, 
        category = ?,
        discount = ?
        WHERE id = ?
      `;
    const values = [
      product.cropName,
      product.normalPrice,
      product.discountedPrice,
      product.promo,
      product.unitType,
      product.startValue,
      product.changeby,
      product.tags,
      product.category,
      product.discount,
      id,
    ];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};
