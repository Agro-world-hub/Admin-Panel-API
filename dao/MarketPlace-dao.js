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
      "INSERT INTO marketplaceitems (displayName, normalPrice, discountedPrice, promo, unitType, startValue, changeby, tags, category, discount, varietyId, displayType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
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

exports.getMarketplaceItems = (limit, offset, searchItem, displayTypeValue, categoryValue) => {
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
      whereConditions.push("(m.displayName LIKE ? OR cg.cropNameEnglish LIKE ? OR cv.varietyNameEnglish LIKE ?)");
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

exports.getAllProductCropCatogoryDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `
          SELECT cg.id AS cropId, mpi.normalPrice, mpi.discountedPrice,mpi.discount, mpi.id AS varietyId, cg.cropNameEnglish, mpi.displayName
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
      "INSERT INTO marketplacepackages (displayName, status, total, image, description, discount) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [
      data.displayName,
      data.status,
      data.total,
      profileImageUrl,
      data.description,
      data.discount,
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
      "INSERT INTO packagedetails (packageId, mpItemId, quantity, quantityType, price) VALUES (?, ?, ?, ?, ?)";
    const values = [
      packageId,
      parseInt(data.mpItemId),
      data.quantity,
      "Kg",
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
            CV.varietyNameEnglish,
            MPI.displayName AS cropName,
            MPI.category,
            MPI.normalPrice,
            MPI.discountedPrice,
            MPI.promo,
            MPI.unitType,
            MPI.startValue,
            MPI.changeby,
            MPI.tags,
            MPI.displaytype,
            MPI.discount
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
        displayType = ?,
        category = ?,
        discount = ?,
        varietyId = ?
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
      product.displaytype,
      product.category,
      product.discount,
      product.varietyId,
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

exports.getAllMarketplacePackagesDAO = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        id, 
        displayName, 
        image, 
        description, 
        status, 
        total, 
        discount, 
        subtotal, 
        created_at
      FROM marketplacepackages
      ORDER BY created_at DESC
    `;

    marketPlace.query(sql, (err, results) => {
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
exports.getMarketplacePackageByIdDAO = (packageId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        mp.id, 
        mp.displayName, 
        mp.image, 
        mp.description, 
        mp.status, 
        mp.total, 
        mp.discount, 
        mp.subtotal, 
        mp.created_at,
        pd.id AS detailId,
        pd.packageId,
        pd.mpItemId,
        pd.quantityType,
        pd.quantity,
        pd.price AS detailPrice,
        mi.varietyId,
        mi.displayName AS itemDisplayName,
        mi.category,
        mi.normalPrice,
        mi.discountedPrice,
        mi.discount AS itemDiscount,
        mi.promo,
        mi.unitType
      FROM marketplacepackages mp
      LEFT JOIN packagedetails pd ON mp.id = pd.packageId
      LEFT JOIN marketplaceitems mi ON pd.mpItemId = mi.id
      WHERE mp.id = ?
    `;

    marketPlace.query(sql, [packageId], (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length === 0) {
        return reject(new Error("Package not found"));
      }

      // The first row contains the package info
      const pkg = {
        id: results[0].id,
        displayName: results[0].displayName,
        image: results[0].image,
        description: results[0].description,
        status: results[0].status,
        total: results[0].total,
        discount: results[0].discount,
        subtotal: results[0].subtotal,
        createdAt: results[0].created_at,
        packageDetails: [],
      };

      // Add all package details (there might be multiple)
      results.forEach((row) => {
        if (row.detailId) {
          // Check if there are any package details
          pkg.packageDetails.push({
            id: row.detailId,
            packageId: row.packageId,
            mpItemId: row.mpItemId,
            quantityType: row.quantityType,
            quantity: row.quantity, // Add this line to include quantity
            price: row.detailPrice,
            itemDetails: {
              varietyId: row.varietyId,
              displayName: row.itemDisplayName,
              category: row.category,
              normalPrice: row.normalPrice,
              discountedPrice: row.discountedPrice,
              discount: row.itemDiscount,
              promo: row.promo,
              unitType: row.unitType,
            },
          });
        }
      });

      resolve(pkg);
    });
  });
};

exports.getMarketplacePackageByIdWithDetailsDAO = (packageId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        mp.id, 
        mp.displayName AS packageDisplayName, 
        mp.image, 
        mp.description, 
        mp.status, 
        mp.total, 
        mp.discount, 
        mp.subtotal, 
        mp.created_at,
        pd.packageId,
        pd.mpItemId,
        pd.quantity,
        pd.quantityType,
        pd.price,
        pd.createdAt AS detailCreatedAt,
        mi.displayName AS itemDisplayName,
        mi.normalPrice AS itemNormalPrice   -- SQL-style comment (or remove entirely)
      FROM marketplacepackages mp
      LEFT JOIN packagedetails pd ON mp.id = pd.packageId
      LEFT JOIN marketplaceitems mi ON pd.mpItemId = mi.id
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
        total: results[0].total,
        discount: results[0].discount,
        subtotal: results[0].subtotal,
        createdAt: results[0].created_at,
        packageDetails: [],
      };

      results.forEach((row) => {
        if (row.mpItemId) {
          pkg.packageDetails.push({
            packageId: row.packageId,
            mpItemId: row.mpItemId,
            itemDisplayName: row.itemDisplayName,
            normalPrice: row.itemNormalPrice,
            quantity: row.quantity,
            quantityType: row.quantityType,
            price: row.price,
            createdAt: row.detailCreatedAt,
          });
        }
      });

      resolve(pkg);
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
