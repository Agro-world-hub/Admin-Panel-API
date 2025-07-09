const {
  plantcare,
  collectionofficer,
  marketPlace,
  dash,
} = require("../startup/database");
const { error } = require("console");
const Joi = require("joi");
const path = require("path");
const XLSX = require("xlsx");

exports.getAllCropNameDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        cg.id AS cropId, 
        cv.id AS varietyId, 
        cg.cropNameEnglish, 
        cv.varietyNameEnglish AS varietyEnglish, 
        cv.image
      FROM 
        cropvariety cv, 
        cropgroup cg
      WHERE 
        cg.id = cv.cropGroupId
      ORDER BY 
        cg.cropNameEnglish ASC
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
          image: image,
        });
      });

      // Format the final result with variety sorting
      const formattedResult = Object.keys(groupedData).map((cropName) => {
        // Sort varieties alphabetically by varietyEnglish
        const sortedVarieties = groupedData[cropName].variety.sort((a, b) =>
          a.varietyEnglish.localeCompare(b.varietyEnglish)
        );

        return {
          cropId: groupedData[cropName].cropId,
          cropNameEnglish: cropName,
          variety: sortedVarieties,
        };
      });

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
exports.checkMarketProductExistsDao = async (varietyId, displayName) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM marketplaceitems WHERE varietyId = ? OR displayName = ?";
    const values = [varietyId, displayName];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0); // true if exists
      }
    });
  });
};

exports.createMarketProductDao = async (product) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO marketplaceitems (displayName, normalPrice, discountedPrice, promo, unitType, startValue, changeby, tags, category, discount, varietyId, displayType, maxQuantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
      product.displaytype,
      product.category === "WholeSale" ? product.maxQuantity : null,
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

exports.getMarketplaceItems = (
  limit,
  offset,
  searchItem,
  displayTypeValue,
  categoryValue
) => {
  return new Promise((resolve, reject) => {
    let whereConditions = [];
    const countParams = [];
    const dataParams = [];

    // Base SQL queries
    let countSql = `SELECT COUNT(*) as total 
                    FROM marketplaceitems m
                    JOIN plant_care.cropvariety cv ON m.varietyId = cv.id
                    JOIN plant_care.cropgroup cg ON cv.cropGroupId = cg.id`;

    let dataSql = `SELECT m.id, m.displayName, m.discountedPrice, m.discount, m.startValue, m.promo,
                    m.unitType, m.changeby, m.normalPrice, m.category, m.displayType,
                    cg.cropNameEnglish, cv.varietyNameEnglish
                    FROM marketplaceitems m
                    JOIN plant_care.cropvariety cv ON m.varietyId = cv.id
                    JOIN plant_care.cropgroup cg ON cv.cropGroupId = cg.id`;

    // Add search condition if provided
    if (searchItem) {
      whereConditions.push(
        "(m.displayName LIKE ? OR cg.cropNameEnglish LIKE ? OR cv.varietyNameEnglish LIKE ?)"
      );
      const searchQuery = `%${searchItem}%`;
      countParams.push(searchQuery, searchQuery, searchQuery);
      dataParams.push(searchQuery, searchQuery, searchQuery);
    }

    // Add display type condition if provided
    if (displayTypeValue) {
      whereConditions.push("m.displayType LIKE ?");
      countParams.push(displayTypeValue);
      dataParams.push(displayTypeValue);
    }

    if (categoryValue) {
      whereConditions.push("m.category = ?");
      countParams.push(categoryValue);
      dataParams.push(categoryValue);
    }

    // Combine WHERE conditions if any exist
    if (whereConditions.length > 0) {
      const whereClause = " WHERE " + whereConditions.join(" AND ");
      countSql += whereClause;
      dataSql += whereClause;
    }

    // Add limit and offset to data query
    dataSql += " ORDER BY m.displayName LIMIT ? OFFSET ?";
    dataParams.push(parseInt(limit), parseInt(offset));

    // Execute queries
    marketPlace.query(countSql, countParams, (countErr, countResults) => {
      if (countErr) return reject(countErr);

      const total = countResults[0].total;

      marketPlace.query(dataSql, dataParams, (dataErr, dataResults) => {
        if (dataErr) return reject(dataErr);

        resolve({
          total: total,
          items: dataResults,
        });
      });
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
      countSql += " AND code LIKE ? ";
      dataSql += " AND code LIKE ? ";
      const searchPattern = `%${searchText}%`;
      countParms.push(searchPattern);
      dataParms.push(searchPattern);
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

exports.getAllProductCropCatogoryDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `
          SELECT cg.id AS cropId, mpi.normalPrice, mpi.discountedPrice,mpi.discount, mpi.id AS varietyId, cg.cropNameEnglish, mpi.displayName
          FROM marketplaceitems mpi, plant_care.cropvariety cv, plant_care.cropgroup cg
          WHERE mpi.varietyId = cv.id AND cv.cropGroupId = cg.id AND mpi.category = 'Retail'
          ORDER BY cg.cropNameEnglish, mpi.displayName
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
          discount,
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
          discount: parseFloat(discount),
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
      "INSERT INTO marketplacepackages (displayName, status, productPrice, packingFee, serviceFee, image, description) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [
      data.displayName,
      data.status,
      data.productPrice,
      data.packageFee,
      data.serviceFee,
      profileImageUrl,
      data.description,
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
    const sql = `
      INSERT INTO packagedetails (packageId, productTypeId, qty)
      VALUES (?, ?, ?)
    `;
    const values = [packageId, data.productTypeId, data.qty];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};

exports.creatPackageDetailsDAOEdit = async (data, packageId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO packagedetails (packageId, mpItemId, quantity, quantityType, price, discount, discountedPrice) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [
      packageId,
      parseInt(data.mpItemId),
      data.quantity,
      "Kg",
      data.discountedPrice + data.detailDiscount,
      data.detailDiscount,
      data.discountedPrice,
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
            CV.varietyNameEnglish AS variety,
            MPI.displayName AS cropName,
            MPI.category,
            MPI.normalPrice,
            MPI.discountedPrice AS salePrice,
            MPI.promo,
            MPI.unitType,
            MPI.startValue,
            MPI.changeby,
            MPI.tags,
            MPI.displayType AS displaytype,
            MPI.maxQuantity,
            MPI.discount,
            ROUND((MPI.discount / MPI.normalPrice) * 100, 2) AS discountedPrice
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

exports.updateMarketProductDao = async (product, id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE marketplaceitems SET  
        displayName = ?, 
        normalPrice = ?, 
        discountedPrice = ?, 
        promo = ?, 
        unitType = ?, 
        startValue = ?, 
        changeby = ?, 
        tags = ?, 
        displayType = ?,
        category = ?,
        discount = ?,
        maxQuantity = ?
        WHERE id = ?
      `;
    const values = [
      product.cropName,
      product.normalPrice,
      product.salePrice,
      product.promo,
      product.unitType,
      product.startValue,
      product.changeby,
      product.tags,
      product.displaytype,
      product.category,
      product.discount,
      product.category === "WholeSale" ? product.maxQuantity : null,
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

exports.getAllMarketplacePackagesDAO = (searchText) => {
  return new Promise((resolve, reject) => {
    const sqlParams = [];
    let sql = `
      SELECT
        id,
        displayName,
        (productPrice + packingFee + serviceFee) AS total,
        status
      FROM marketplacepackages
    `;

    if (searchText) {
      sql += ` WHERE displayName LIKE ? `;
      sqlParams.push(`%${searchText}%`);
    }

    // Order by status A-Z first, then by package name A-Z
    sql += ` ORDER BY status ASC, displayName ASC `;

    marketPlace.query(sql, sqlParams, (err, results) => {
      if (err) {
        return reject(err);
      }

      // Group packages by status
      const groupedData = {};

      results.forEach((pkg) => {
        const {
          status,
          id,
          displayName,
          image,
          description,
          total,
          discount,
          subtotal,
          created_at,
        } = pkg;

        // Initialize the status group if it doesn't exist
        if (!groupedData[status]) {
          groupedData[status] = {
            status: status,
            packages: [],
          };
        }

        // Add the package to its status group
        groupedData[status].packages.push({
          id: id,
          displayName: displayName,
          image: image,
          description: description,
          total: total,
          status: status,
          discount: discount,
          subtotal: subtotal,
          createdAt: created_at,
        });
      });

      // Convert the grouped data object into an array
      const formattedResult = Object.values(groupedData);

      resolve(formattedResult);
    });
  });
};

exports.deleteMarketplacePckages = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM marketplacepackages WHERE id = ?";
    marketPlace.query(sql, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows);
      }
    });
  });
};

exports.updateMarketplacePackageDAO = (packageId, updateData) => {
  return new Promise((resolve, reject) => {
    // Extract fields from updateData that we want to allow updating
    const {
      displayName,
      image,
      description,
      status,
      total,
      discount,
      subtotal,
    } = updateData;

    const sql = `
      UPDATE marketplacepackages
      SET 
        displayName = ?,
        image = ?,
        description = ?,
        status = ?,
        total = ?,
        discount = ?,
        subtotal = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const values = [
      displayName,
      image,
      description,
      status,
      total,
      discount,
      subtotal,
      packageId,
    ];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        return reject(err);
      }
      if (results.affectedRows === 0) {
        return reject(new Error("No package found with the given ID"));
      }
      resolve({
        id: packageId,
        ...updateData,
        message: "Package updated successfully",
      });
    });
  });
};

exports.getMarketplacePackageByIdDAO = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        mpp.id, mpp.displayName, mpp.image, mpp.status, mpp.description, 
        mpp.productPrice, mpp.packingFee, mpp.serviceFee, 
        pd.qty, pt.id AS productTypeId
      FROM market_place.marketplacepackages mpp
      JOIN market_place.packagedetails pd ON mpp.id = pd.packageId
      JOIN market_place.producttypes pt ON pd.productTypeId = pt.id
      WHERE mpp.id = ?;
    `;

    marketPlace.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      }
      if (results.length === 0) {
        return reject(new Error("Package not found"));
      }
      resolve(results);
    });
  });
};
// exports.getMarketplacePackageByIdDAO = (packageId) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//       SELECT
//         mp.id,
//         mp.displayName,
//         mp.image,
//         mp.description,
//         mp.status,
//         mp.total,
//         mp.discount,
//         mp.subtotal,
//         mp.created_at,
//         pd.id AS detailId,
//         pd.packageId,
//         pd.mpItemId,
//         pd.quantityType,
//         pd.quantity,
//         pd.price AS detailPrice,
//         pd.discount AS detailDiscount,
//         pd.discountedPrice AS detailDiscountedPrice,
//         mi.varietyId,
//         mi.displayName AS itemDisplayName,
//         mi.category,
//         mi.normalPrice,
//         mi.discountedPrice,
//         mi.discount AS itemDiscount,
//         mi.promo,
//         mi.unitType
//       FROM marketplacepackages mp
//       LEFT JOIN packagedetails pd ON mp.id = pd.packageId
//       LEFT JOIN marketplaceitems mi ON pd.mpItemId = mi.id
//       WHERE mp.id = ?
//     `;

//     marketPlace.query(sql, [packageId], (err, results) => {
//       if (err) {
//         return reject(err);
//       }

//       if (results.length === 0) {
//         return reject(new Error("Package not found"));
//       }

//       // The first row contains the package info
//       const pkg = {
//         id: results[0].id,
//         displayName: results[0].displayName,
//         image: results[0].image,
//         description: results[0].description,
//         status: results[0].status,
//         total: results[0].total,
//         discount: results[0].discount,
//         subtotal: results[0].subtotal,
//         createdAt: results[0].created_at,
//         packageDetails: [],
//       };

//       // Add all package details (there might be multiple)
//       results.forEach((row) => {
//         if (row.detailId) {
//           // Check if there are any package details
//           pkg.packageDetails.push({
//             id: row.detailId,
//             packageId: row.packageId,
//             mpItemId: row.mpItemId,
//             quantityType: row.quantityType,
//             quantity: row.quantity, // Add this line to include quantity
//             price: row.detailPrice,
//             detailDiscount: row.detailDiscount,
//             detailDiscountedPrice: row.detailDiscountedPrice,
//             itemDetails: {
//               varietyId: row.varietyId,
//               displayName: row.itemDisplayName,
//               category: row.category,
//               normalPrice: row.normalPrice,
//               discountedPrice: row.discountedPrice,
//               discount: row.itemDiscount,
//               promo: row.promo,
//               unitType: row.unitType,
//             },
//           });
//         }
//       });

//       resolve(pkg);
//     });
//   });
// };

exports.getMarketplacePackageByIdWithDetailsDAO = (packageId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        mp.id, 
        mp.displayName AS packageDisplayName, 
        mp.image, 
        mp.description, 
        mp.status, 
        mp.productPrice,
        mp.packingFee,
        mp.serviceFee,
        mp.created_at,
        pd.id AS detailId,
        pd.packageId,
        pd.productTypeId,
        pd.qty,
        pt.id AS productTypeId,
        pt.typeName AS productTypeName,
        pt.shortCode AS productTypeShortCode,
        pt.created_at AS productTypeCreatedAt
      FROM marketplacepackages mp
      LEFT JOIN packagedetails pd ON mp.id = pd.packageId
      LEFT JOIN producttypes pt ON pd.productTypeId = pt.id
      WHERE mp.id = ?
    `;

    marketPlace.query(sql, [packageId], (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length === 0) {
        return reject(new Error("Package not found"));
      }

      const pkg = {
        id: results[0].id,
        displayName: results[0].packageDisplayName,
        image: results[0].image,
        description: results[0].description,
        status: results[0].status,
        productPrice: results[0].productPrice,
        packingFee: results[0].packingFee,
        serviceFee: results[0].serviceFee,
        createdAt: results[0].created_at,
        packageDetails: [],
      };

      results.forEach((row) => {
        if (row.productTypeId) {
          pkg.packageDetails.push({
            id: row.detailId,
            packageId: row.packageId,
            productType: {
              id: row.productTypeId,
              typeName: row.productTypeName,
              shortCode: row.productTypeShortCode,
              price: row.productTypePrice,
              createdAt: row.productTypeCreatedAt,
            },
            qty: row.qty,
          });
        }
      });

      resolve(pkg);
      console.log("Package with details:", pkg);
    });
  });
};

exports.updatePackageDAO = async (data, profileImageUrl, packageId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "UPDATE marketplacepackages SET displayName = ?, status = ?, total = ?, image = ?, description = ? WHERE id = ?";
    const values = [
      data.displayName,
      data.status,
      data.total,
      profileImageUrl,
      data.description,
      packageId,
    ];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(results.affectedRows); // Returns number of rows affected
      }
    });
  });
};

exports.updatePackageDetailsDAO = async (data, detailId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "UPDATE packagedetails SET mpItemId = ?, quantity = ?, quantityType = ?, price = ? WHERE id = ?";
    const values = [
      parseInt(data.mpItemId),
      data.quantity,
      data.qtytype,
      parseInt(data.discountedPrice),
      detailId,
    ];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows); // Returns number of rows affected
      }
    });
  });
};

exports.deletePackageDetails = async (packageId) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM packagedetails WHERE packageId = ?";

    marketPlace.query(sql, [packageId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows);
      }
    });
  });
};

exports.getMarketplaceUsers = async (buyerType) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, firstName, email, created_at, buyerType
      FROM marketplaceusers 
      WHERE isMarketPlaceUser = 1 AND LOWER(buyerType) = LOWER(?)
    `;

    marketPlace.query(sql, [buyerType], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getMarketplaceUsers = async (buyerType) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, firstName, email, created_at, buyerType
      FROM marketplaceusers 
      WHERE isSubscribe = 1 AND LOWER(buyerType) = LOWER(?)
    `;

    marketPlace.query(sql, [buyerType], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.deleteMarketplaceUser = async (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE marketplaceusers 
      SET isSubscribe = 0 
      WHERE id = ? AND isSubscribe = 1
    `;

    marketPlace.query(sql, [userId], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.affectedRows === 0) {
        return reject(new Error("User not found or already deactivated"));
      }
      resolve({ message: "User deactivated successfully" });
    });
  });
};

exports.getNextBannerIndexRetail = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COALESCE(MAX(indexId), 0) + 1 AS nextOrderNumber
      FROM banners
      WHERE type = 'Retail'
    `;

    marketPlace.query(query, (error, results) => {
      if (error) {
        return reject(error); // Handle error
      }

      resolve(results[0].nextOrderNumber); // Return the next order number
    });
  });
};

exports.getNextBannerIndexWholesale = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COALESCE(MAX(indexId), 0) + 1 AS nextOrderNumber
      FROM banners
      WHERE type = 'Wholesale'
    `;

    marketPlace.query(query, (error, results) => {
      if (error) {
        return reject(error); // Handle error
      }

      resolve(results[0].nextOrderNumber); // Return the next order number
    });
  });
};

exports.createBanner = async (data) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO banners (indexId, details, image, type) VALUES (?, ?, ?, ?)";
    const values = [data.index, data.name, data.image, "Retail"];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          insertId: results.insertId,
          message: "Banner created successfully",
        });
      }
    });
  });
};

exports.createBannerWholesale = async (data) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO banners (indexId, details, image, type) VALUES (?, ?, ?, ?)";
    const values = [data.index, data.name, data.image, "Wholesale"];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          insertId: results.insertId,
          message: "Banner created successfully",
        });
      }
    });
  });
};

exports.getAllBanners = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM banners WHERE type = 'Retail' ORDER BY indexId";

    marketPlace.query(sql, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results); // No need to wrap in arrays, return results directly
    });
  });
};

exports.getAllBannersWholesale = () => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM banners WHERE type = 'Wholesale' ORDER BY indexId";

    marketPlace.query(sql, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results); // No need to wrap in arrays, return results directly
    });
  });
};

exports.updateBannerOrder = async (feedbacks) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE banners SET indexId = ? WHERE id = ?";

    const queries = feedbacks.map((feedback) => {
      return new Promise((resolveInner, rejectInner) => {
        marketPlace.query(
          sql,
          [feedback.orderNumber, feedback.id],
          (err, results) => {
            if (err) {
              return rejectInner(err);
            }
            resolveInner(results);
          }
        );
      });
    });
    Promise.all(queries)
      .then((results) => resolve(results))
      .catch((err) => reject(err));
  });
};

exports.getBannerById = async (feedbackId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM banners WHERE id = ?";
    marketPlace.query(sql, [feedbackId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results[0]);
    });
  });
};

exports.deleteBannerRetail = async (feedbackId, orderNumber) => {
  return new Promise((resolve, reject) => {
    const deleteSql = "DELETE FROM banners WHERE id = ?";
    const updateSql =
      "UPDATE banners SET indexId = indexId - 1 WHERE indexId > ? AND type = 'Retail'";

    marketPlace.query(deleteSql, [feedbackId], (deleteErr, deleteResults) => {
      if (deleteErr) {
        return reject(deleteErr);
      }
      marketPlace.query(
        updateSql,
        [orderNumber],
        (updateErr, updateResults) => {
          if (updateErr) {
            return reject(updateErr);
          }

          resolve({
            deleteResults,
            updateResults,
          });
        }
      );
    });
  });
};

exports.deleteBannerWhole = async (feedbackId, orderNumber) => {
  return new Promise((resolve, reject) => {
    const deleteSql = "DELETE FROM banners WHERE id = ?";
    const updateSql =
      "UPDATE banners SET indexId = indexId - 1 WHERE indexId > ? AND type = 'Wholesale'";

    marketPlace.query(deleteSql, [feedbackId], (deleteErr, deleteResults) => {
      if (deleteErr) {
        return reject(deleteErr);
      }
      marketPlace.query(
        updateSql,
        [orderNumber],
        (updateErr, updateResults) => {
          if (updateErr) {
            return reject(updateErr);
          }

          resolve({
            deleteResults,
            updateResults,
          });
        }
      );
    });
  });
};

exports.createProductTypesDao = async (data) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO producttypes (typeName, shortCode) VALUES (?, ?)";
    marketPlace.query(sql, [data.typeName, data.shortCode], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.viewProductTypeDao = async () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM producttypes";
    marketPlace.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.getProductType = async () => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT typeName, shortCode, id FROM producttypes ORDER BY typeName ASC";
    marketPlace.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.editPackageDAO = async (data, profileImageUrl, id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE marketplacepackages 
      SET 
        displayName = ?, 
        status = ?, 
        productPrice = ?, 
        packingFee = ?, 
        serviceFee = ?, 
        image = ?, 
        description = ?
      WHERE id = ?
    `;

    const values = [
      data.displayName,
      data.status,
      data.productPrice,
      data.packageFee,
      data.serviceFee,
      profileImageUrl,
      data.description,
      id, // Used in WHERE clause
    ];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.editPackageDetailsDAO = async (data, packageId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE packagedetails 
      SET qty = ? 
      WHERE packageId = ? AND productTypeId = ?
    `;

    const values = [
      data.qty, // Set new quantity
      packageId, // Match package ID
      data.productTypeId, // Match product type ID
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

exports.getAllRetailOrderDetails = (
  limit,
  offset,
  status,
  method,
  searchItem,
  formattedDate
) => {
  return new Promise((resolve, reject) => {
    let countSql =
      "SELECT COUNT(*) as total FROM market_place.orders o LEFT JOIN market_place.processorders po ON o.id = po.orderId";
    let sql = `
    SELECT o.id, o.fullName AS customerName, o.delivaryMethod AS method, po.amount, po.invNo, po.status, o.createdAt AS orderdDate FROM market_place.orders o
    LEFT JOIN market_place.processorders po ON o.id = po.orderId
    `;

    let whereClause = " WHERE 1=1";
    const searchParams = [];

    if (searchItem) {
      // Turn "ap" into "%a%p%" to match "apple"
      const searchQuery = `%${searchItem.split("").join("%")}%`;
      whereClause += " AND (po.invNo LIKE ? OR o.fullName LIKE ?)";
      searchParams.push(searchQuery, searchQuery);
    }

    if (status) {
      whereClause += " AND po.status = ?";
      searchParams.push(status);
    }

    if (method) {
      whereClause += " AND o.delivaryMethod = ?";
      searchParams.push(method);
    }

    if (formattedDate) {
      whereClause += " AND DATE(o.createdAt) = ?";
      searchParams.push(formattedDate);
    }

    // Add where clause to both count and main SQL
    countSql += whereClause;
    sql += whereClause + " ORDER BY o.createdAt ASC LIMIT ? OFFSET ?";
    const dataParams = [...searchParams, limit, offset];

    marketPlace.query(countSql, searchParams, (countErr, countResults) => {
      if (countErr) {
        return reject(countErr);
      }

      const total = countResults[0].total;

      marketPlace.query(sql, dataParams, (dataErr, dataResults) => {
        if (dataErr) {
          return reject(dataErr);
        }

        resolve({
          total: total,
          items: dataResults,
        });
      });
    });
  });
};

exports.getProductTypeByIdDao = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT typeName, shortCode FROM producttypes WHERE id = ?";
    marketPlace.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results[0]);
    });
  });
};

exports.editProductTypesDao = async (data, id) => {
  return new Promise((resolve, reject) => {
    const sql = `
                UPDATE producttypes 
                SET 
                  typeName = ?, shortCode = ?
                WHERE id = ?
              `;
    marketPlace.query(
      sql,
      [data.typeName, data.shortCode, id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};

exports.DeleteProductTypeByIdDao = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM producttypes WHERE id = ?";
    marketPlace.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};
exports.getAllDeliveryCharges = (searchItem, city) => {
  return new Promise((resolve, reject) => {
    let whereConditions = [];
    let params = [];
    let sql = "SELECT * FROM deliverycharge";

    if (searchItem) {
      whereConditions.push("city LIKE ?");
      params.push(`%${searchItem}%`);
    }

    if (city) {
      whereConditions.push("city = ?");
      params.push(city);
    }

    if (whereConditions.length > 0) {
      sql += " WHERE " + whereConditions.join(" AND ");
    }

    sql += " ORDER BY createdAt DESC";
    collectionofficer.query(sql, params, (err, results) => {
      if (err) {
        return reject(err);
      }

      resolve(results);
    });
  });
};

exports.uploadDeliveryCharges = async (fileBuffer) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Read the Excel file
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Validate data structure
      if (data.length === 0) {
        return reject(new Error("Excel file is empty"));
      }

      const requiredColumns = ["City Name", "Charge (Rs.)"];
      const headers = Object.keys(data[0]);

      if (!requiredColumns.every((col) => headers.includes(col))) {
        return reject(
          new Error(
            "Excel file must contain 'City Name' and 'Charge (Rs.)' columns"
          )
        );
      }

      // Process data and remove duplicates
      const chargesToInsert = [];
      const cityMap = new Map();

      for (const row of data) {
        const city = row["City Name"]?.toString().trim();
        const charge = parseFloat(row["Charge (Rs.)"]);

        if (!city || isNaN(charge)) {
          continue; // Skip invalid rows
        }

        // Check if city already exists in this batch
        if (!cityMap.has(city.toLowerCase())) {
          cityMap.set(city.toLowerCase(), true);
          chargesToInsert.push({ city, charge });
        }
      }

      if (chargesToInsert.length === 0) {
        return resolve({
          inserted: 0,
          duplicates: 0,
          message: "No valid data to insert",
        });
      }

      // Check against existing database entries
      const existingCities = await new Promise((resolve, reject) => {
        const sql =
          "SELECT LOWER(city) as city FROM deliverycharge WHERE city IN (?)";
        const cities = chargesToInsert.map((c) => c.city);
        collectionofficer.query(sql, [cities], (err, results) => {
          if (err) return reject(err);
          resolve(results.map((r) => r.city));
        });
      });

      // Filter out duplicates that exist in database
      const finalCharges = chargesToInsert.filter(
        (charge) => !existingCities.includes(charge.city.toLowerCase())
      );

      if (finalCharges.length === 0) {
        return resolve({
          inserted: 0,
          duplicates: chargesToInsert.length,
          message: "All cities already exist in database",
        });
      }

      // Insert non-duplicate records
      const sql = "INSERT INTO deliverycharge (city, charge) VALUES ?";
      const values = finalCharges.map((charge) => [charge.city, charge.charge]);

      collectionofficer.query(sql, [values], (err, result) => {
        if (err) return reject(err);

        resolve({
          inserted: result.affectedRows,
          duplicates: chargesToInsert.length - finalCharges.length,
          message: "Delivery charges uploaded successfully",
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.editDeliveryChargeDAO = async (data, id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE deliverycharge 
      SET city = ?, charge = ? 
      WHERE id = ?
    `;

    const values = [data.city, data.charge, id];

    collectionofficer.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.checkPackageDisplayNameExistsDao = async (displayName) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM marketplacepackages WHERE displayName = ?";
    marketPlace.query(sql, [displayName], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0); // true if exists
      }
    });
  });
};

exports.getAllRetailCustomersDao = (limit, offset, searchText) => {
  return new Promise((resolve, reject) => {
    let countParms = [];
    let dataParms = [];
    let countSql = `
      SELECT 
        COUNT(*) AS total
      FROM marketplaceusers MP
      WHERE 
        MP.buyerType = 'Retail' 
        AND MP.isMarketPlaceUser = 1   
      `;
    let dataSql = `
      SELECT 
        MP.id, 
        MP.firstName,
        MP.lastName,
        MP.phoneCode,
        MP.phoneNumber,
        MP.cusId,
        MP.email,
        MP.created_at,
        MP.buildingType,
        H.houseNo,
        H.streetName,
        H.city,
        A.buildingNo,
        A.buildingName,
        A.unitNo,
        A.floorNo,
        A.houseNo AS AparthouseNo,
        A.streetName AS ApartstreetName,
        A.city AS Apartcity,
        (
            SELECT COUNT(*)
            FROM orders O
            LEFT JOIN processorders PO ON O.id = PO.orderId
            WHERE O.userId = MP.id
        ) AS totalOrders
      FROM marketplaceusers MP
      LEFT JOIN house H ON MP.id = H.customerId AND MP.buildingType = 'House'
      LEFT JOIN apartment A ON MP.id = A.customerId AND MP.buildingType = 'Apartment'
      WHERE 
        MP.buyerType = 'Retail' 
        AND MP.isMarketPlaceUser = 1   
      `;

    console.log(searchText);

    if (searchText) {
      countSql +=
        " AND (MP.firstName LIKE ? OR MP.lastName LIKE ? OR MP.phoneNumber LIKE ? OR MP.cusId LIKE ?) ";
      dataSql +=
        " AND (MP.firstName LIKE ? OR MP.lastName LIKE ? OR MP.phoneNumber LIKE ? OR MP.cusId LIKE ?) ";
      const search = `%${searchText}%`;
      countParms.push(search, search, search, search);
      dataParms.push(search, search, search, search);
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
            // console.log(dataResults);

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

exports.getOrderDetailsById = (orderId) => {
  console.log(`[getOrderDetailsById] Fetching details for orderId: ${orderId}`);

  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        mp.id,
        mp.displayName,
        mp.productPrice,
        pd.id AS packageItemId,
        pd.productTypeId,
        pt.shortCode,
        pt.typeName,
        pd.qty
      FROM marketplacepackages mp
      LEFT JOIN packagedetails pd ON mp.id = pd.packageId
      LEFT JOIN producttypes pt ON pd.productTypeId = pt.id
      WHERE mp.id = ?
    `;

    console.log(
      `[getOrderDetailsById] SQL Query:`,
      sql.replace(/\s+/g, " ").trim()
    );

    marketPlace.query(sql, [orderId], (err, results) => {
      if (err) {
        console.error(`[getOrderDetailsById] Database error:`, err);
        return reject(new Error(`Database error: ${err.message}`));
      }

      if (!results || results.length === 0) {
        console.log(`[getOrderDetailsById] No order found with id: ${orderId}`);
        return resolve(null);
      }

      try {
        const invNo = undefined;
        const packagesMap = new Map();

        results.forEach((row) => {
          const packageId = row.id;
          if (!packageId) return;

          if (!packagesMap.has(packageId)) {
            packagesMap.set(packageId, {
              packageId: packageId,
              displayName: row.displayName,
              productPrice: row.productPrice || null,
              productTypes: [],
            });
          }

          if (row.productTypeId) {
            packagesMap.get(packageId).productTypes.push({
              id: row.productTypeId,
              typeName: row.typeName, // Now available from the query
              shortCode: row.shortCode, // Now available from the query
              qty: row.qty,
            });
          }
        });

        const response = {
          invNo: invNo,
          packages: Array.from(packagesMap.values()),
        };

        console.log(`[getOrderDetailsById] Successfully fetched order details`);
        resolve(response);
      } catch (error) {
        console.error(`[getOrderDetailsById] Processing error:`, error);
        reject(new Error(`Failed to process order details: ${error.message}`));
      }
    });
  });
};

exports.getAllMarketplaceItems = (category) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        id,
        varietyId,
        displayName,
        category,
        normalPrice,
        discountedPrice,
        discount,
        promo,
        unitType,
        startValue,
        changeby,
        displayType,
        tags,
        createdAt,
        maxQuantity
      FROM 
        marketplaceitems
        WHERE category = ?
      ORDER BY 
        createdAt DESC
    `;

    console.log(`[getAllMarketplaceItems] Executing SQL query:`, sql);

    console.log("hello category", category);

    marketPlace.query(sql, [category], (err, results) => {
      if (err) {
        console.error(
          "[getAllMarketplaceItems] Error fetching all marketplace items:",
          err
        );
        return reject(err);
      }

      console.log(
        `[getAllMarketplaceItems] Query results count:`,
        results.length
      );

      // Structure the data
      const items = results.map((row) => ({
        id: row.id,
        varietyId: row.varietyId,
        displayName: row.displayName,
        category: row.category,
        normalPrice: row.normalPrice,
        discountedPrice: row.discountedPrice,
        discount: row.discount,
        promo: row.promo,
        unitType: row.unitType,
        startValue: row.startValue,
        changeby: row.changeby,
        displayType: row.displayType,
        tags: row.tags ? row.tags.split(",") : [],
        createdAt: row.createdAt,
        maxQuantity: row.maxQuantity,
      }));

      console.log(
        `[getAllMarketplaceItems] Successfully retrieved ${items.length} items`
      );
      resolve(items);
    });
  });
};

exports.getOrderTypeDao = async (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT buyerType
      FROM processorders POR, orders O, marketplaceusers U
      WHERE POR.orderId = O.id AND O.userId = U.id
    `;
    marketPlace.query(sql, [id], (err, results) => {
      if (err) {
        console.log("Erro", err);

        reject(err);
      } else {
        resolve(results[0]);
        console.log("``````````result``````````", results[0]);
      }
    });
  });
};

exports.createDefinePackageDao = (packageData) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate inputs
      if (!packageData || !packageData.packageId || !packageData.price) {
        throw new Error("Invalid input parameters");
      }

      const sql = `
        INSERT INTO definepackage (
          packageId, price
        ) VALUES (?, ?)
      `;

      const values = [packageData.packageId, parseFloat(packageData.price)];

      // Database query
      marketPlace.query(sql, values, (err, results) => {
        if (err) {
          console.log("Database error:", err);
          return reject(err);
        }
        resolve(results);
      });
    } catch (error) {
      console.log("Error in createDefinePackageDao:", error);
      reject(error);
    }
  });
};

exports.createDefinePackageItemsDao = (definePackageId, products) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate inputs
      if (!definePackageId || !products || !Array.isArray(products)) {
        throw new Error("Invalid input parameters");
      }

      // Create an array of value arrays for the batch insert
      const values = products.map((product) => [
        definePackageId,
        product.productType,
        product.productId,
        product.qty,
        parseFloat(product.price),
      ]);

      const sql = `
        INSERT INTO definepackageitems (
          definePackageId, productType, productId, qty, price
        ) VALUES ?
      `;

      // Database query with batch insert
      marketPlace.query(sql, [values], (err, results) => {
        if (err) {
          console.log("Database error:", err);
          return reject(err);
        }
        resolve(results);
      });
    } catch (error) {
      console.log("Error in createDefinePackageItemsDao:", error);
      reject(error);
    }
  });
};

exports.getLatestPackageDateByPackageIdDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        dp1.id,
        dp1.packageId,
        dp1.price,
        dp1.createdAt
      FROM 
        definepackage dp1
      INNER JOIN (
        SELECT 
          packageId, 
          MAX(createdAt) as latestCreatedAt
        FROM 
          definepackage
        GROUP BY 
          packageId
      ) dp2 ON dp1.packageId = dp2.packageId AND dp1.createdAt = dp2.latestCreatedAt
      ORDER BY dp1.packageId ASC
    `;

    // Assuming you're using the same 'marketPlace' database connection as in your example
    marketPlace.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }

      // If you want to group the results by packageId (similar to your example)
      const groupedData = {};

      results.forEach((pkg) => {
        const { packageId, id, price, createdAt } = pkg;

        if (!groupedData[packageId]) {
          groupedData[packageId] = {
            packageId: packageId,
            entries: [],
          };
        }

        groupedData[packageId].entries.push({
          id: id,
          price: price,
          createdAt: createdAt,
        });
      });

      // Convert the grouped data object into an array
      const formattedResult = Object.values(groupedData);

      resolve(formattedResult);
    });
  });
};

exports.getAllWholesaleCustomersDao = (limit, offset, searchText) => {
  return new Promise((resolve, reject) => {
    let countParms = [];
    let dataParms = [];
    let countSql = `
      SELECT 
        COUNT(*) AS total
      FROM marketplaceusers MP
      WHERE 
        MP.buyerType = 'Wholesale' 
        AND MP.isMarketPlaceUser = 1   
      `;
    let dataSql = `
      SELECT 
        MP.id, 
        MP.firstName,
        MP.lastName,
        MP.phoneCode,
        MP.phoneNumber,
        MP.cusId,
        MP.email,
        MP.created_at,
        MP.buildingType,
        MP.companyName,
        H.houseNo,
        H.streetName,
        H.city,
        A.buildingNo,
        A.buildingName,
        A.unitNo,
        A.floorNo,
        A.houseNo AS AparthouseNo,
        A.streetName AS ApartstreetName,
        A.city AS Apartcity,
        (
            SELECT COUNT(*)
            FROM orders O
            LEFT JOIN processorders PO ON O.id = PO.orderId
            WHERE O.userId = MP.id
        ) AS totalOrders
      FROM marketplaceusers MP
      LEFT JOIN house H ON MP.id = H.customerId AND MP.buildingType = 'House'
      LEFT JOIN apartment A ON MP.id = A.customerId AND MP.buildingType = 'Apartment'
      WHERE 
        MP.buyerType = 'Wholesale' 
        AND MP.isMarketPlaceUser = 1   
      `;

    console.log(searchText);

    if (searchText) {
      countSql +=
        " AND (MP.firstName LIKE ? OR MP.lastName LIKE ? OR MP.phoneNumber LIKE ? OR MP.cusId LIKE ?) ";
      dataSql +=
        " AND (MP.firstName LIKE ? OR MP.lastName LIKE ? OR MP.phoneNumber LIKE ? OR MP.cusId LIKE ?) ";
      const search = `%${searchText}%`;
      countParms.push(search, search, search, search);
      dataParms.push(search, search, search, search);
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
            // console.log(dataResults);

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

exports.getUserOrdersDao = async (userId, status) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT DISTINCT
        P.id,
        P.invNo,
        O.sheduleType,
        O.sheduleDate,
        P.paymentMethod,
        P.isPaid,
        O.fullTotal
      FROM processorders P
      JOIN orders O ON P.orderId = O.id
      WHERE O.userId = ? 
    `;

    console.log(status, "-------");

    if (status === "Assinged") {
      sql += " AND P.status = 'Ordered'";
    } else if (status === "Processing") {
      sql += " AND P.status = 'Processing'";
    } else if (status === "Delivered") {
      sql += " AND P.status = 'Delivered'";
    } else if (status === "Cancelled") {
      sql += " AND P.status = 'Cancelled'";
    } else if (status === "Faild") {
      sql += " AND P.status 'Faild'";
    } else if (status === "On the way") {
      sql += " AND P.status 'Faild'";
    }

    marketPlace.query(sql, [userId, status], (err, results) => {
      if (err) {
        console.log("Error", err);
        reject(err);
      } else {
        resolve(results);
        console.log("``````````result``````````", results);
      }
    });
  });
};

exports.getCoupenDAO = async (coupenId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT coupon.id, coupon.code, coupon.type, CAST(coupon.percentage AS DECIMAL(10,2)) AS percentage, coupon.status, coupon.checkLimit, CAST(coupon.priceLimit AS DECIMAL(10,2)) AS priceLimit, CAST(coupon.fixDiscount AS DECIMAL(10,2)) AS fixDiscount, coupon.startDate, coupon.endDate FROM market_place.coupon WHERE coupon.id = ?";

    marketPlace.query(sql, [coupenId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(
          results.map((row) => ({
            ...row,
            percentage: row.percentage !== null ? parseFloat(row.percentage) : null,
            priceLimit: row.priceLimit !== null ? parseFloat(row.priceLimit) : null,
            fixDiscount: row.fixDiscount !== null ? parseFloat(row.fixDiscount) : null,
          }))
        );
      }
    });
  });
};

exports.updateCoupenDAO = async (coupen) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE coupon 
      SET 
        code = ?, 
        type = ?, 
        percentage = ?, 
        status = ?, 
        checkLimit = ?, 
        priceLimit = ?, 
        fixDiscount = ?, 
        startDate = ?, 
        endDate = ?
      WHERE id = ?
    `;

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
      coupen.id, 
    ];

    marketPlace.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.affectedRows); // you can return affected rows or true
      }
    });
  });
};

