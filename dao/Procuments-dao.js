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
    const params = [];
    const countParams = [];

    // Default to OrderDate if filterType not set
    const validFilters = {
      OrderDate: "DATE(o.createdAt)",
      scheduleDate: "DATE(o.scheduleDate)",
      toCollectionCenter: "DATE_SUB(o.scheduleDate, INTERVAL 2 DAY)",
      toDispatchCenter: "DATE_SUB(o.scheduleDate, INTERVAL 1 DAY)",
    };

    const dateFilterColumn =
      validFilters[filterType] || validFilters["OrderDate"];

    let whereClause = `
        WHERE o.deleteStatus IS NOT TRUE
        AND o.orderStatus != 'Cancelled'
        AND cv.varietyNameEnglish IS NOT NULL
      `;

    if (date) {
      whereClause += ` AND ${dateFilterColumn} = ?`;
      params.push(date);
      countParams.push(date);
    }

    if (search) {
      whereClause += ` AND (cv.varietyNameEnglish LIKE ? OR cg.cropNameEnglish LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    const baseSelect = `
        FROM orders o
        LEFT JOIN (
            SELECT osi.orderId, mi.varietyId, SUM(osi.quantity) AS TotalQuantity
            FROM orderselecteditems osi
            JOIN market_place.marketplaceitems mi ON osi.mpItemId = mi.id
            GROUP BY osi.orderId, mi.varietyId
            UNION ALL
            SELECT opi.orderId, mi.varietyId,
                SUM(COALESCE(pd.quantity, 0) + COALESCE(mpi.modifiedQuantity, 0) - COALESCE(mmi.modifiedQuantity, 0)) AS TotalQuantity
            FROM orderpackageitems opi
            JOIN market_place.packagedetails pd ON opi.packageId = pd.packageId
            JOIN market_place.marketplaceitems mi ON pd.mpItemId = mi.id
            LEFT JOIN modifiedplusitems mpi ON mpi.orderPackageItemsId = opi.id AND mpi.packageDetailsId = pd.id
            LEFT JOIN modifiedminitems mmi ON mmi.orderPackageItemsId = opi.id AND mmi.packageDetailsId = pd.id
            GROUP BY opi.orderId, mi.varietyId
            UNION ALL
            SELECT opi.orderId, mi.varietyId, SUM(mpi.modifiedQuantity) AS TotalQuantity
            FROM orderpackageitems opi
            JOIN modifiedplusitems mpi ON mpi.orderPackageItemsId = opi.id AND mpi.packageDetailsId IS NULL
            JOIN market_place.marketplaceitems mi ON mpi.packageDetailsId IS NULL AND mpi.id IS NOT NULL AND mi.id = mpi.id
            GROUP BY opi.orderId, mi.varietyId
        ) AS item_qty ON o.id = item_qty.orderId
        LEFT JOIN plant_care.cropvariety cv ON cv.id = item_qty.varietyId
        JOIN plant_care.cropgroup cg ON cv.cropGroupId = cg.id
      `;

    const countSql = `
        SELECT COUNT(*) AS total
        ${baseSelect}
        ${whereClause}
        GROUP BY cv.varietyNameEnglish, ${dateFilterColumn}, DATE(o.scheduleDate)
      `;

    const dataSql = `
        SELECT 
          cv.varietyNameEnglish,
          cg.cropNameEnglish,
          SUM(COALESCE(item_qty.TotalQuantity, 0)) AS TotalQuantity,
          DATE(o.createdAt) AS OrderDate,
          DATE(o.scheduleDate) AS scheduleDate,
          DATE_SUB(o.scheduleDate, INTERVAL 2 DAY) AS toCollectionCenter,
          DATE_SUB(o.scheduleDate, INTERVAL 1 DAY) AS toDispatchCenter
        ${baseSelect}
        ${whereClause}
        GROUP BY cv.varietyNameEnglish, ${dateFilterColumn}, DATE(o.scheduleDate)
        ORDER BY OrderDate DESC, cg.cropNameEnglish, cv.varietyNameEnglish
        LIMIT ? OFFSET ?
      `;

    params.push(parseInt(limit), parseInt(offset));

    console.log("Executing Count Query...");
    dash.query(countSql, countParams, (countErr, countResults) => {
      if (countErr) {
        console.error("Count query error:", countErr);
        return reject(countErr);
      }

      const total = countResults.length;

      console.log("Executing Data Query...");
      dash.query(dataSql, params, (dataErr, dataResults) => {
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

exports.DownloadRecievedOrdersQuantity = (filterType, date, search) => {
  return new Promise((resolve, reject) => {
    const params = [];

    const validFilters = {
      OrderDate: "DATE(o.createdAt)",
      scheduleDate: "DATE(o.scheduleDate)",
      toCollectionCenter: "DATE_SUB(o.scheduleDate, INTERVAL 2 DAY)",
      toDispatchCenter: "DATE_SUB(o.scheduleDate, INTERVAL 1 DAY)",
    };

    const dateFilterColumn =
      validFilters[filterType] || validFilters["OrderDate"];

    let whereClause = `
        WHERE o.deleteStatus IS NOT TRUE
        AND o.orderStatus != 'Cancelled'
        AND cv.varietyNameEnglish IS NOT NULL
      `;

    if (date) {
      whereClause += ` AND ${dateFilterColumn} = ?`;
      params.push(date);
    }

    if (search) {
      whereClause += ` AND (cv.varietyNameEnglish LIKE ? OR cg.cropNameEnglish LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const baseSelect = `
        FROM orders o
        LEFT JOIN (
          SELECT osi.orderId, mi.varietyId, SUM(osi.quantity) AS TotalQuantity
          FROM orderselecteditems osi
          JOIN market_place.marketplaceitems mi ON osi.mpItemId = mi.id
          GROUP BY osi.orderId, mi.varietyId
          UNION ALL
          SELECT opi.orderId, mi.varietyId,
              SUM(COALESCE(pd.quantity, 0) + COALESCE(mpi.modifiedQuantity, 0) - COALESCE(mmi.modifiedQuantity, 0)) AS TotalQuantity
          FROM orderpackageitems opi
          JOIN market_place.packagedetails pd ON opi.packageId = pd.packageId
          JOIN market_place.marketplaceitems mi ON pd.mpItemId = mi.id
          LEFT JOIN modifiedplusitems mpi ON mpi.orderPackageItemsId = opi.id AND mpi.packageDetailsId = pd.id
          LEFT JOIN modifiedminitems mmi ON mmi.orderPackageItemsId = opi.id AND mmi.packageDetailsId = pd.id
          GROUP BY opi.orderId, mi.varietyId
          UNION ALL
          SELECT opi.orderId, mi.varietyId, SUM(mpi.modifiedQuantity) AS TotalQuantity
          FROM orderpackageitems opi
          JOIN modifiedplusitems mpi ON mpi.orderPackageItemsId = opi.id AND mpi.packageDetailsId IS NULL
          JOIN market_place.marketplaceitems mi ON mpi.packageDetailsId IS NULL AND mpi.id IS NOT NULL AND mi.id = mpi.id
          GROUP BY opi.orderId, mi.varietyId
        ) AS item_qty ON o.id = item_qty.orderId
        LEFT JOIN plant_care.cropvariety cv ON cv.id = item_qty.varietyId
        JOIN plant_care.cropgroup cg ON cv.cropGroupId = cg.id
      `;

    const dataSql = `
        SELECT 
          cv.varietyNameEnglish,
          cg.cropNameEnglish,
          SUM(COALESCE(item_qty.TotalQuantity, 0)) AS TotalQuantity,
          DATE(o.createdAt) AS OrderDate,
          DATE(o.scheduleDate) AS scheduleDate,
          DATE_SUB(o.scheduleDate, INTERVAL 2 DAY) AS toCollectionCenter,
          DATE_SUB(o.scheduleDate, INTERVAL 1 DAY) AS toDispatchCenter
        ${baseSelect}
        ${whereClause}
        GROUP BY cv.varietyNameEnglish, ${dateFilterColumn}
        ORDER BY OrderDate DESC
      `;

    console.log("Executing Data Query...");
    dash.query(dataSql, params, (dataErr, dataResults) => {
      if (dataErr) {
        console.error("Data query error:", dataErr);
        return reject(dataErr);
      }

      resolve({
        items: dataResults,
        total: dataResults.length,
      });
    });
  });
};

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

    let whereClause = ` WHERE 1=1 `; // Changed from deleteStatus check to always true condition
    let joinClause = ` FROM orders o LEFT JOIN processorders po ON o.id = po.orderId `;

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
      ${whereClause}
    `;

    const dataSql = `
      SELECT 
        o.id,
        o.userId,
        o.orderApp,
        o.delivaryMethod,
        o.centerId,
        o.buildingType,
        o.title,
        o.fullName,
        o.phonecode1,
        o.phone1,
        o.phonecode2,
        o.phone2,
        o.isCoupon,
        o.couponValue,
        o.total,
        o.fullTotal,
        o.discount,
        o.sheduleType,
        o.sheduleDate,
        o.sheduleTime,
        o.createdAt,
        po.id AS processOrderId,
        po.invNo,
        po.transactionId,
        po.paymentMethod,
        po.isPaid,
        po.amount,
        po.status,
        po.reportStatus,
        po.createdAt AS processCreatedAt,
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
  console.log(orderId, "--oid----");

  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        mp.id AS packageId,
        mp.displayName,
        mp.productPrice,
        pt.id AS productTypeId,
        pt.typeName,
        pt.shortCode,
        po.invNo  -- Added invNo from processorders table
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
    `;

    console.log(`[getOrderDetailsById] Executing SQL query:`, sql);
    console.log(`[getOrderDetailsById] Query parameters:`, orderId);

    marketPlace.query(sql, [orderId], (err, results) => {
      if (err) {
        console.error(
          "[getOrderDetailsById] Error fetching order details:",
          err
        );
        return reject(err);
      }

      console.log(`[getOrderDetailsById] Query results:`, results);

      if (results.length === 0) {
        console.log(
          `[getOrderDetailsById] No results found for orderId: ${orderId}`
        );
        return resolve(null);
      }

      // Structure the simplified data
      const packageDetails = results.map((row) => ({
        packageId: row.packageId,
        displayName: row.displayName,
        productPrice: row.productPrice,
        invNo: row.invNo, // Added invNo to the result object
        productType: {
          id: row.productTypeId,
          typeName: row.typeName,
          shortCode: row.shortCode,
        },
      }));

      console.log(
        `[getOrderDetailsById] Structured package details:`,
        packageDetails
      );
      resolve(packageDetails);
    });
  });
};

exports.createOrderPackageItemDao = async (orderPackageItems) => {
  // Debugging: Log raw input
  console.log(
    "Raw input received:",
    JSON.stringify(orderPackageItems, null, 2)
  );

  // Convert single item to array for consistent processing
  const itemsToInsert = Array.isArray(orderPackageItems)
    ? orderPackageItems
    : [orderPackageItems];

  // Validate all items before starting transaction
  const validateItem = (item, index) => {
    const requiredFields = [
      "orderPackageId",
      "productType",
      "productId",
      "qty",
      "price",
    ];
    const missingFields = requiredFields.filter((field) => {
      const value = item[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields in item ${index}: ${missingFields.join(", ")}`
      );
    }

    // Validate numeric fields
    if (isNaN(Number(item.qty)) || Number(item.qty) <= 0) {
      throw new Error(
        `Invalid quantity in item ${index}. Must be a positive number`
      );
    }

    if (isNaN(Number(item.price)) || Number(item.price) < 0) {
      throw new Error(
        `Invalid price in item ${index}. Must be a non-negative number`
      );
    }
  };

  try {
    // Pre-validate all items
    itemsToInsert.forEach((item, index) => validateItem(item, index));
  } catch (validationError) {
    console.error("Pre-validation failed:", validationError);
    throw validationError;
  }

  return new Promise(async (resolve, reject) => {
    // Get a connection from the pool
    marketPlace.getConnection(async (err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        return reject(err);
      }

      try {
        // Begin transaction
        await new Promise((resolve, reject) => {
          connection.beginTransaction((err) => {
            if (err) return reject(err);
            resolve();
          });
        });

        const results = [];
        const errors = [];

        // Process each item sequentially
        for (const [index, item] of itemsToInsert.entries()) {
          try {
            // Convert values to proper types
            const values = [
              Number(item.orderPackageId),
              Number(item.productType),
              Number(item.productId),
              Number(item.qty),
              Number(item.price),
            ];

            const sql = `
              INSERT INTO orderpackageitems 
              (orderPackageId, productType, productId, qty, price) 
              VALUES (?, ?, ?, ?, ?)
            `;

            // Execute insert for current item
            const result = await new Promise((resolve, reject) => {
              connection.query(sql, values, (err, result) => {
                if (err) return reject(err);
                resolve(result);
              });
            });

            results.push({
              index,
              item,
              result,
              status: "success",
            });
            console.log(`Item ${index} inserted successfully`);
          } catch (itemError) {
            console.error(`Error inserting item ${index}:`, itemError);
            errors.push({
              index,
              item,
              error: itemError.message,
              status: "failed",
            });
            // Continue with next item even if one fails
          }
        }

        // Check if any errors occurred
        if (errors.length > 0) {
          // Rollback transaction if any errors
          await new Promise((resolve, reject) => {
            connection.rollback(() => {
              connection.release();
              resolve();
            });
          });

          return reject({
            message: "Some items failed to insert",
            successCount: results.length,
            failedCount: errors.length,
            results,
            errors,
            receivedData: itemsToInsert, // Include original data for debugging
          });
        }

        // Commit transaction if all successful
        await new Promise((resolve, reject) => {
          connection.commit((err) => {
            connection.release();
            if (err) return reject(err);
            resolve();
          });
        });

        resolve({
          message: "All items inserted successfully",
          insertedCount: results.length,
          results,
          receivedData: itemsToInsert, // Include original data for reference
        });
      } catch (transactionError) {
        // Rollback on any transaction error
        connection.rollback(() => {
          connection.release();
          console.error("Transaction failed:", transactionError);
          reject({
            error: transactionError,
            receivedData: itemsToInsert,
          });
        });
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
