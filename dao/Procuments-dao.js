const {
  admin,
  plantcare,
  collectionofficer,
  marketPlace,
  dash,
} = require("../startup/database");

exports.getRecievedOrdersQuantity = (page, limit, filterType, date, search) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;

    // Base query
    let baseJoinSql = `
      FROM market_place.orderpackage op 
      JOIN market_place.orders o ON op.orderId = o.id
      JOIN market_place.orderadditionalitems oai ON oai.orderId = o.id
      JOIN market_place.marketplaceitems mpi ON oai.productId = mpi.id
      JOIN plant_care.cropvariety cv ON mpi.varietyId = cv.id
      JOIN plant_care.cropgroup cg ON cv.cropGroupId = cg.id
    `;

    let whereSql = ` WHERE 1=1 `;
    const queryParams = [];

    // Apply filterType + date
    if (filterType && date) {
      switch (filterType) {
        case "OrderDate":
          whereSql += ` AND DATE(o.createdAt) = ?`;
          queryParams.push(date);
          break;
        case "scheduleDate":
          whereSql += ` AND DATE(o.sheduleDate) = ?`;
          queryParams.push(date);
          break;
        case "toCollectionCenter":
          whereSql += ` AND DATE(DATE_SUB(o.sheduleDate, INTERVAL 2 DAY)) = ?`;
          queryParams.push(date);
          break;
        case "toDispatchCenter":
          whereSql += ` AND DATE(DATE_SUB(o.sheduleDate, INTERVAL 1 DAY)) = ?`;
          queryParams.push(date);
          break;
      }
    }

    // Apply search on crop and variety name
    if (search) {
      whereSql += ` AND (cv.varietyNameEnglish LIKE ? OR cg.cropNameEnglish LIKE ?)`;
      const likeSearch = `%${search}%`;
      queryParams.push(likeSearch, likeSearch);
    }

    // Count Query
    const countSql = `SELECT COUNT(*) AS total ${baseJoinSql} ${whereSql}`;

    // Data Query
    let dataSql = `
  SELECT 
    o.createdAt, 
    op.orderId, 
    o.sheduleDate, 
    oai.productId, 
    ROUND(
      CASE 
        WHEN oai.unit = 'g' THEN oai.qty / 1000
        ELSE oai.qty 
      END, 3
    ) AS quantity,
    oai.unit,
    cg.cropNameEnglish, 
    cv.varietyNameEnglish,
    DATE_SUB(o.sheduleDate, INTERVAL 2 DAY) AS toCollectionCentre,
    DATE_SUB(o.sheduleDate, INTERVAL 1 DAY) AS toDispatchCenter
  ${baseJoinSql}
  ${whereSql}
  ORDER BY o.createdAt DESC, cg.cropNameEnglish ASC, cv.varietyNameEnglish ASC
  LIMIT ? OFFSET ?
`;

    const dataParams = [...queryParams, Number(limit), Number(offset)];

    // Execute count query
    marketPlace.query(countSql, queryParams, (countErr, countResults) => {
      if (countErr) {
        console.error("Error in count query:", countErr);
        return reject(countErr);
      }

      const total = countResults[0].total;

      // Execute data query
      marketPlace.query(dataSql, dataParams, (dataErr, dataResults) => {
        if (dataErr) {
          console.error("Error in data query:", dataErr);
          return reject(dataErr);
        }

        dataResults.forEach((item) => {
          item.quantity = parseFloat(item.quantity.toString()); // This removes trailing zeros
        });

        resolve({ items: dataResults, total });
      });
    });
  });
};

// if (searchText) {
//     const searchCondition = `
//         AND (
//             rfp.invNo LIKE ?
//             OR rfp.createdAt LIKE ?
//             OR cc.centerName LIKE ?
//             OR cc.RegCode LIKE ?
//             OR u.NICnumber LIKE ?
//         )
//     `;
//     countSql += searchCondition;
//     dataSql += searchCondition;
//     const searchValue = `%${searchText}%`;
//     countParams.push(searchValue, searchValue, searchValue, searchValue, searchValue);
//     dataParams.push(searchValue, searchValue, searchValue, searchValue, searchValue);
// }

// if (center) {
//     countSql += " AND co.centerId = ?";
//     dataSql += " AND co.centerId = ?";
//     countParams.push(center);
//     dataParams.push(center);
// }

// dataSql += ` GROUP BY
//                 rfp.invNo,
//                 rfp.createdAt,
//                 cc.RegCode,
//                 cc.centerName,
//                 co.firstNameEnglish,
//                 u.id,
//                 u.NICnumber,
//                 co.companyId`

// exports.getRecievedOrdersQuantity = (page, limit, filterType, date, search) => {
//   return new Promise((resolve, reject) => {
//     const offset = (page - 1) * limit;
//     const params = [];
//     const countParams = [];

//     // Default to OrderDate if filterType not set
//     const validFilters = {
//       OrderDate: "DATE(o.createdAt)",
//       scheduleDate: "DATE(o.scheduleDate)",
//       toCollectionCenter: "DATE_SUB(o.scheduleDate, INTERVAL 2 DAY)",
//       toDispatchCenter: "DATE_SUB(o.scheduleDate, INTERVAL 1 DAY)",
//     };

//     const dateFilterColumn =
//       validFilters[filterType] || validFilters["OrderDate"];

//     let whereClause = `
//         WHERE o.deleteStatus IS NOT TRUE
//         AND o.orderStatus != 'Cancelled'
//         AND cv.varietyNameEnglish IS NOT NULL
//       `;

//     if (date) {
//       whereClause += ` AND ${dateFilterColumn} = ?`;
//       params.push(date);
//       countParams.push(date);
//     }

//     if (search) {
//       whereClause += ` AND (cv.varietyNameEnglish LIKE ? OR cg.cropNameEnglish LIKE ?)`;
//       const searchTerm = `%${search}%`;
//       params.push(searchTerm, searchTerm);
//       countParams.push(searchTerm, searchTerm);
//     }

//     const baseSelect = `
//         FROM orders o
//         LEFT JOIN (
//             SELECT osi.orderId, mi.varietyId, SUM(osi.quantity) AS TotalQuantity
//             FROM orderselecteditems osi
//             JOIN market_place.marketplaceitems mi ON osi.mpItemId = mi.id
//             GROUP BY osi.orderId, mi.varietyId
//             UNION ALL
//             SELECT opi.orderId, mi.varietyId,
//                 SUM(COALESCE(pd.quantity, 0) + COALESCE(mpi.modifiedQuantity, 0) - COALESCE(mmi.modifiedQuantity, 0)) AS TotalQuantity
//             FROM orderpackageitems opi
//             JOIN market_place.packagedetails pd ON opi.packageId = pd.packageId
//             JOIN market_place.marketplaceitems mi ON pd.mpItemId = mi.id
//             LEFT JOIN modifiedplusitems mpi ON mpi.orderPackageItemsId = opi.id AND mpi.packageDetailsId = pd.id
//             LEFT JOIN modifiedminitems mmi ON mmi.orderPackageItemsId = opi.id AND mmi.packageDetailsId = pd.id
//             GROUP BY opi.orderId, mi.varietyId
//             UNION ALL
//             SELECT opi.orderId, mi.varietyId, SUM(mpi.modifiedQuantity) AS TotalQuantity
//             FROM orderpackageitems opi
//             JOIN modifiedplusitems mpi ON mpi.orderPackageItemsId = opi.id AND mpi.packageDetailsId IS NULL
//             JOIN market_place.marketplaceitems mi ON mpi.packageDetailsId IS NULL AND mpi.id IS NOT NULL AND mi.id = mpi.id
//             GROUP BY opi.orderId, mi.varietyId
//         ) AS item_qty ON o.id = item_qty.orderId
//         LEFT JOIN plant_care.cropvariety cv ON cv.id = item_qty.varietyId
//         JOIN plant_care.cropgroup cg ON cv.cropGroupId = cg.id
//       `;

//     const countSql = `
//         SELECT COUNT(*) AS total
//         ${baseSelect}
//         ${whereClause}
//         GROUP BY cv.varietyNameEnglish, ${dateFilterColumn}, DATE(o.scheduleDate)
//       `;

//     const dataSql = `
//         SELECT
//           cv.varietyNameEnglish,
//           cg.cropNameEnglish,
//           SUM(COALESCE(item_qty.TotalQuantity, 0)) AS TotalQuantity,
//           DATE(o.createdAt) AS OrderDate,
//           DATE(o.scheduleDate) AS scheduleDate,
//           DATE_SUB(o.scheduleDate, INTERVAL 2 DAY) AS toCollectionCenter,
//           DATE_SUB(o.scheduleDate, INTERVAL 1 DAY) AS toDispatchCenter
//         ${baseSelect}
//         ${whereClause}
//         GROUP BY cv.varietyNameEnglish, ${dateFilterColumn}, DATE(o.scheduleDate)
//         ORDER BY OrderDate DESC, cg.cropNameEnglish, cv.varietyNameEnglish
//         LIMIT ? OFFSET ?
//       `;

//     params.push(parseInt(limit), parseInt(offset));

//     console.log("Executing Count Query...");
//     dash.query(countSql, countParams, (countErr, countResults) => {
//       if (countErr) {
//         console.error("Count query error:", countErr);
//         return reject(countErr);
//       }

//       const total = countResults.length;

//       console.log("Executing Data Query...");
//       dash.query(dataSql, params, (dataErr, dataResults) => {
//         if (dataErr) {
//           console.error("Data query error:", dataErr);
//           return reject(dataErr);
//         }

//         resolve({
//           items: dataResults,
//           total,
//         });
//       });
//     });
//   });
// };

exports.DownloadRecievedOrdersQuantity = (filterType, date, search) => {
  return new Promise((resolve, reject) => {
    // Base join SQL
    let baseJoinSql = `
      FROM market_place.orderpackage op 
      JOIN market_place.orders o ON op.orderId = o.id
      JOIN market_place.orderadditionalitems oai ON oai.orderId = o.id
      JOIN market_place.marketplaceitems mpi ON oai.productId = mpi.id
      JOIN plant_care.cropvariety cv ON mpi.varietyId = cv.id
      JOIN plant_care.cropgroup cg ON cv.cropGroupId = cg.id
    `;

    // Where clause
    let whereSql = ` WHERE 1=1 `;
    const queryParams = [];

    // Apply date filters
    if (filterType && date) {
      switch (filterType) {
        case "OrderDate":
          whereSql += ` AND DATE(o.createdAt) = ?`;
          queryParams.push(date);
          break;
        case "scheduleDate":
          whereSql += ` AND DATE(o.sheduleDate) = ?`;
          queryParams.push(date);
          break;
        case "toCollectionCenter":
          whereSql += ` AND DATE(DATE_SUB(o.sheduleDate, INTERVAL 2 DAY)) = ?`;
          queryParams.push(date);
          break;
        case "toDispatchCenter":
          whereSql += ` AND DATE(DATE_SUB(o.sheduleDate, INTERVAL 1 DAY)) = ?`;
          queryParams.push(date);
          break;
      }
    }

    // Apply search
    if (search) {
      whereSql += ` AND (cv.varietyNameEnglish LIKE ? OR cg.cropNameEnglish LIKE ?)`;
      const likeSearch = `%${search}%`;
      queryParams.push(likeSearch, likeSearch);
    }

    // Final data query without LIMIT/OFFSET and with ORDER BY
    const dataSql = `
      SELECT 
        o.createdAt, 
        o.sheduleDate AS scheduleDate,
        oai.productId, 
        ROUND(
          CASE 
            WHEN oai.unit = 'g' THEN oai.qty / 1000
            ELSE oai.qty 
          END, 3
        ) AS quantity,
        oai.unit,
        cg.cropNameEnglish, 
        cv.varietyNameEnglish,
        DATE_SUB(o.sheduleDate, INTERVAL 2 DAY) AS toCollectionCenter,
        DATE_SUB(o.sheduleDate, INTERVAL 1 DAY) AS toDispatchCenter
      ${baseJoinSql}
      ${whereSql}
      ORDER BY o.createdAt DESC, cg.cropNameEnglish ASC, cv.varietyNameEnglish ASC
    `;

    // Execute query
    marketPlace.query(dataSql, queryParams, (err, results) => {
      if (err) {
        console.error("Error fetching data for Excel:", err);
        return reject(err);
      }

      results.forEach((item) => {
        item.quantity = parseFloat(item.quantity.toString()); // This removes trailing zeros
      });

      resolve({ items: results });
    });
  });
};

// exports.getAllOrdersWithProcessInfo = (
//   page,
//   limit,
//   filterType,
//   date,
//   search
// ) => {
//   return new Promise((resolve, reject) => {
//     const offset = (page - 1) * limit;
//     const params = [];
//     const countParams = [];

//     // Define valid filters
//     const validFilters = {
//       OrderDate: "DATE(o.createdAt)",
//       scheduleDate: "DATE(o.sheduleDate)",
//       processDate: "DATE(po.createdAt)",
//     };

//     const dateFilterColumn =
//       validFilters[filterType] || validFilters["OrderDate"];

//     let whereClause = ` WHERE 1=1 `; // Changed from deleteStatus check to always true condition
//     let joinClause = ` FROM orders o LEFT JOIN processorders po ON o.id = po.orderId `;

//     if (date) {
//       whereClause += ` AND ${dateFilterColumn} = ?`;
//       params.push(date);
//       countParams.push(date);
//     }

//     if (search) {
//       whereClause += ` AND (o.fullName LIKE ? OR o.phone1 LIKE ? OR po.invNo LIKE ? OR po.transactionId LIKE ?)`;
//       const searchTerm = `%${search}%`;
//       params.push(searchTerm, searchTerm, searchTerm, searchTerm);
//       countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
//     }

//     const countSql = `
//       SELECT COUNT(DISTINCT o.id) AS total
//       ${joinClause}
//       ${whereClause}
//     `;

//     const dataSql = `
//       SELECT
//         o.id,
//         o.userId,
//         o.orderApp,
//         o.delivaryMethod,
//         o.centerId,
//         o.buildingType,
//         o.title,
//         o.fullName,
//         o.phonecode1,
//         o.phone1,
//         o.phonecode2,
//         o.phone2,
//         o.isCoupon,
//         o.couponValue,
//         o.total,
//         o.fullTotal,
//         o.discount,
//         o.sheduleType,
//         o.sheduleDate,
//         o.sheduleTime,
//         o.createdAt,
//         po.id AS processOrderId,
//         po.invNo,
//         po.transactionId,
//         po.paymentMethod,
//         po.isPaid,
//         po.amount,
//         po.status,
//         po.reportStatus,
//         po.createdAt AS processCreatedAt,
//         ${dateFilterColumn} AS filterDate
//       ${joinClause}
//       ${whereClause}
//       ORDER BY o.createdAt DESC
//       LIMIT ? OFFSET ?
//     `;

//     params.push(parseInt(limit), parseInt(offset));

//     console.log("Executing Count Query...");
//     marketPlace.query(countSql, countParams, (countErr, countResults) => {
//       if (countErr) {
//         console.error("Count query error:", countErr);
//         return reject(countErr);
//       }

//       const total = countResults[0]?.total || 0;

//       console.log("Executing Data Query...");
//       marketPlace.query(dataSql, params, (dataErr, dataResults) => {
//         if (dataErr) {
//           console.error("Data query error:", dataErr);
//           return reject(dataErr);
//         }

//         resolve({
//           items: dataResults,
//           total,
//         });
//       });
//     });
//   });
// };

exports.getAllOrdersWithProcessInfo = (
  page,
  limit,
  filterType,
  date,
  search
) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const params = [];
    const countParams = [];

    // Define valid filters
    const validFilters = {
      OrderDate: "DATE(o.createdAt)",
      scheduleDate: "DATE(o.sheduleDate)",
      processDate: "DATE(po.createdAt)",
    };

    const dateFilterColumn =
      validFilters[filterType] || validFilters["OrderDate"];

    let whereClause = ` WHERE 1=1 `;
    let joinClause = ` FROM orders o 
                       LEFT JOIN processorders po ON o.id = po.orderId 
                       LEFT JOIN (
                         SELECT orderId, packingStatus
                         FROM orderpackage
                         WHERE (orderId, id) IN (
                           SELECT orderId, MAX(id) 
                           FROM orderpackage 
                           GROUP BY orderId
                         )
                       ) op ON o.id = op.orderId `;

    if (date) {
      whereClause += ` AND ${dateFilterColumn} = ?`;
      params.push(date);
      countParams.push(date);
    }

    if (search) {
      whereClause += ` AND (o.fullName LIKE ? OR o.phone1 LIKE ? OR po.invNo LIKE ? OR po.transactionId LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const countSql = `
      SELECT COUNT(DISTINCT o.id) AS total
      ${joinClause}
      ${whereClause} AND packingStatus = 'Todo'
    `;

    const dataSql = `
      SELECT 
        o.*,
        po.id AS processOrderId,
        po.invNo,
        po.transactionId,
        po.paymentMethod,
        po.isPaid,
        po.amount,
        po.status,
        po.reportStatus,
        po.createdAt AS processCreatedAt,
        op.packingStatus,
        ${dateFilterColumn} AS filterDate
      ${joinClause}
      ${whereClause}
      ORDER BY o.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));

    console.log("Executing Count Query...");
    marketPlace.query(countSql, countParams, (countErr, countResults) => {
      if (countErr) {
        console.error("Count query error:", countErr);
        return reject(countErr);
      }

      const total = countResults[0]?.total || 0;

      console.log("Executing Data Query...");
      marketPlace.query(dataSql, params, (dataErr, dataResults) => {
        if (dataErr) {
          console.error("Data query error:", dataErr);
          return reject(dataErr);
        }

        resolve({
          items: dataResults,
          total,
        });
      });
    });
  });
};

exports.getAllProductTypes = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT typeName, shortCode FROM producttypes";

    marketPlace.query(sql, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getOrderDetailsById = (orderId) => {
  console.log(`[getOrderDetailsById] Fetching details for orderId: ${orderId}`);

  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        po.invNo,
        op.id AS packageId,
        mp.displayName,
        mp.productPrice,
        pt.id AS productTypeId,
        pt.typeName,
        pt.shortCode
      FROM 
        processorders po
      JOIN 
        orders o ON po.orderId = o.id
      LEFT JOIN 
        orderpackage op ON o.id = op.orderId
      LEFT JOIN 
        marketplacepackages mp ON op.packageId = mp.id
      LEFT JOIN 
        packagedetails pd ON mp.id = pd.packageId
      LEFT JOIN 
        producttypes pt ON pd.productTypeId = pt.id
      WHERE 
        po.orderId = ?
      ORDER BY
        op.id, pt.id
    `;

    console.log(
      `[getOrderDetailsById] SQL Query:`,
      sql.replace(/\s+/g, " ").trim()
    );

    marketPlace.query(sql, [orderId], (err, results) => {
      if (err) {
        console.error(`[getOrderDetailsById] Database error:`, err);
        return reject(err);
      }

      console.log(`[getOrderDetailsById] Raw results:`, results);

      if (results.length === 0) {
        console.log(
          `[getOrderDetailsById] No data found for orderId: ${orderId}`
        );
        return resolve(null);
      }

      const invNo = results[0].invNo;
      const packagesMap = new Map();

      results.forEach((row) => {
        if (!row.packageId) return;

        if (!packagesMap.has(row.packageId)) {
          packagesMap.set(row.packageId, {
            packageId: row.packageId,
            displayName: row.displayName,
            productPrice: row.productPrice,
            productTypes: [],
          });
        }

        // Add productType if it exists
        if (row.productTypeId) {
          const packageEntry = packagesMap.get(row.packageId);
          packageEntry.productTypes.push({
            id: row.productTypeId,
            typeName: row.typeName,
            shortCode: row.shortCode,
          });
        }
      });

      // Convert to final structure
      const response = {
        invNo: invNo,
        packages: Array.from(packagesMap.values()),
      };

      console.log(
        `[getOrderDetailsById] Final structured data:`,
        JSON.stringify(response, null, 2)
      );
      resolve(response);
    });
  });
};

exports.createOrderPackageItemDao = (orderPackageId, products) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate inputs
      if (!orderPackageId || !products || !Array.isArray(products)) {
        throw new Error("Invalid input parameters");
      }

      // Create an array of value arrays for the batch insert
      const values = products.map((product) => [
        orderPackageId,
        product.productType,
        product.productId,
        product.qty,
        parseFloat(product.price),
      ]);

      const sql = `
        INSERT INTO orderpackageitems (
          orderPackageId, productType, productId, qty, price
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
      console.log("Error in createOrderPackageItemDao:", error);
      reject(error);
    }
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

exports.getAllOrdersWithProcessInfoCompleted = (
  page,
  limit,
  filterType,
  date,
  search
) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const params = [];
    const countParams = [];

    // Define valid filters
    const validFilters = {
      OrderDate: "DATE(o.createdAt)",
      scheduleDate: "DATE(o.sheduleDate)",
      processDate: "DATE(po.createdAt)",
    };

    const dateFilterColumn =
      validFilters[filterType] || validFilters["OrderDate"];

    let whereClause = ` WHERE 1=1 `;
    let joinClause = ` FROM orders o 
                       LEFT JOIN processorders po ON o.id = po.orderId 
                       LEFT JOIN (
                         SELECT orderId, packingStatus
                         FROM orderpackage
                         WHERE (orderId, id) IN (
                           SELECT orderId, MAX(id) 
                           FROM orderpackage 
                           GROUP BY orderId
                         )
                       ) op ON o.id = op.orderId `;

    if (date) {
      whereClause += ` AND ${dateFilterColumn} = ?`;
      params.push(date);
      countParams.push(date);
    }

    if (search) {
      whereClause += ` AND (o.fullName LIKE ? OR o.phone1 LIKE ? OR po.invNo LIKE ? OR po.transactionId LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const countSql = `
      SELECT COUNT(DISTINCT o.id) AS total
      ${joinClause}
      ${whereClause} AND packingStatus = 'Completed'
    `;

    const dataSql = `
      SELECT 
        o.*,
        po.id AS processOrderId,
        po.invNo,
        po.transactionId,
        po.paymentMethod,
        po.isPaid,
        po.amount,
        po.status,
        po.reportStatus,
        po.createdAt AS processCreatedAt,
        op.packingStatus,
        ${dateFilterColumn} AS filterDate
      ${joinClause}
      ${whereClause}
      ORDER BY o.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));

    console.log("Executing Count Query...");
    marketPlace.query(countSql, countParams, (countErr, countResults) => {
      if (countErr) {
        console.error("Count query error:", countErr);
        return reject(countErr);
      }

      const total = countResults[0]?.total || 0;

      console.log("Executing Data Query...");
      marketPlace.query(dataSql, params, (dataErr, dataResults) => {
        if (dataErr) {
          console.error("Data query error:", dataErr);
          return reject(dataErr);
        }

        resolve({
          items: dataResults,
          total,
        });
      });
    });
  });
};

// In your DAO file (procumentDao.js or similar)
exports.updateOrderPackagePackingStatusDao = (orderPackageId, status) => {
  return new Promise((resolve, reject) => {
    try {
      const sql = `
        UPDATE orderpackage 
        SET packingStatus = ?
        WHERE id = ?
      `;

      marketPlace.query(sql, [status, orderPackageId], (err, results) => {
        if (err) {
          console.log("Database error:", err);
          return reject(err);
        }
        resolve(results);
      });
    } catch (error) {
      console.log("Error in updateOrderPackagePackingStatusDao:", error);
      reject(error);
    }
  });
};

exports.getOrderPackagesByOrderId = (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate input
      if (!orderId) {
        throw new Error("Invalid orderId parameter");
      }

      const sql = `
        SELECT 
          po.invNo,
          op.packageId,
          mp.displayName,
          mp.productPrice,
          opi.id as itemId,
          opi.productType,
          opi.productId,
          opi.qty,
          opi.price,
          m.displayName as productDisplayName,
          pt.id as productTypeId,
          pt.typeName,
          pt.shortCode
        FROM 
          processorders po
        JOIN 
          orderpackage op ON po.orderId = op.orderId
        JOIN 
          marketplacepackages mp ON op.packageId = mp.id
        LEFT JOIN 
          orderpackageitems opi ON opi.orderPackageId = op.id
        LEFT JOIN 
          marketplaceitems m ON opi.productId = m.id
        LEFT JOIN
          producttypes pt ON opi.productType = pt.id  -- Changed this join condition
        WHERE 
          po.orderId = ?
        ORDER BY
          op.packageId, opi.id
      `;

      marketPlace.query(sql, [orderId], (err, results) => {
        if (err) {
          console.log("Database error:", err);
          return reject(err);
        }

        if (results.length === 0) {
          return resolve(null);
        }

        // Transform the flat results into the nested structure
        const response = {
          invNo: results[0].invNo,
          packages: [],
        };

        let currentPackage = null;

        for (const row of results) {
          // If we encounter a new package, create a new package entry
          if (!currentPackage || currentPackage.packageId !== row.packageId) {
            currentPackage = {
              packageId: row.packageId,
              displayName: row.displayName,
              productPrice: row.productPrice,
              productTypes: [],
            };
            response.packages.push(currentPackage);
          }

          // Add product type information if it exists
          if (row.itemId) {
            currentPackage.productTypes.push({
              id: row.itemId,
              productTypeId: row.productTypeId, // Added productTypeId here
              typeName: row.typeName,
              shortCode: row.shortCode,
              displayName: row.productDisplayName,
              qty: row.qty,
              price: row.price,
            });
          }
        }

        resolve(response);
      });
    } catch (error) {
      console.log("Error in getOrderPackagesByOrderId:", error);
      reject(error);
    }
  });
};

// exports.updateOrderPackageItemsDao = (orderPackageId, products) => {
//   return new Promise((resolve, reject) => {
//     try {
//       // Prepare the update query
//       const sql = `
//         UPDATE orderpackageitems
//         SET productType = ?,
//             productId = ?,
//             qty = ?,
//             price = ?
//         WHERE id = ? AND orderPackageId = ?
//       `;

//       // Execute updates for each product
//       const updatePromises = products.map((product) => {
//         return new Promise((resolveUpdate, rejectUpdate) => {
//           marketPlace.query(
//             sql,
//             [
//               product.productType,
//               product.productId,
//               product.qty,
//               product.price,
//               product.id,
//               orderPackageId,
//             ],
//             (err, results) => {
//               if (err) {
//                 console.log("Database error in individual update:", err);
//                 return rejectUpdate(err);
//               }
//               resolveUpdate(results);
//             }
//           );
//         });
//       });

//       // Wait for all updates to complete
//       Promise.all(updatePromises)
//         .then(() => {
//           resolve({
//             success: true,
//             message: `${products.length} items updated successfully`,
//           });
//         })
//         .catch((error) => {
//           console.log("Error in batch updates:", error);
//           reject(error);
//         });
//     } catch (error) {
//       console.log("Error in updateOrderPackageItemsDao:", error);
//       reject(error);
//     }
//   });
// };

exports.updateOrderPackageItemsDao = async (product) => {
  return new Promise((resolve, reject) => {
    const sql = `
        UPDATE orderpackageitems
        SET productType = ?,
             productId = ?,
            qty = ?,
            price = ?
        WHERE id = ?
      `;
    marketPlace.query(
      sql,
      [
        product.productType,
        product.productId,
        product.qty,
        product.price,
        product.id,
      ],
      (err, results) => {
        if (err) {
          console.log("Erro", err);

          reject(err);
        } else {
          resolve(results[0]);
          console.log("``````````result``````````", results[0]);
        }
      }
    );
  });
};
