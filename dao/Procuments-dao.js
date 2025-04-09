const {
    admin,
    plantcare,
    collectionofficer,
    marketPlace,
    dash,
  } = require("../startup/database");








  exports.getRecievedOrdersQuantity = (page, limit, filterType, date) => {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      const params = [];
      const countParams = [];
  
      // Default to OrderDate if filterType not set
      const validFilters = {
        OrderDate: "DATE(o.createdAt)",
        scheduleDate: "DATE(o.scheduleDate)",
        toCollectionCenter: "DATE_SUB(o.scheduleDate, INTERVAL 2 DAY)",
        toDispatchCenter: "DATE_SUB(o.scheduleDate, INTERVAL 1 DAY)"
      };
  
      const dateFilterColumn = validFilters[filterType] || validFilters["OrderDate"];
  
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
        GROUP BY cv.varietyNameEnglish, ${dateFilterColumn}
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
        ORDER BY cv.varietyNameEnglish, ${dateFilterColumn}
        LIMIT ? OFFSET ?
      `;
  
      params.push(parseInt(limit), parseInt(offset));
  
      console.log('Executing Count Query...');
      dash.query(countSql, countParams, (countErr, countResults) => {
        if (countErr) {
          console.error("Count query error:", countErr);
          return reject(countErr);
        }
  
        const total = countResults.length;
  
        console.log('Executing Data Query...');
        dash.query(dataSql, params, (dataErr, dataResults) => {
          if (dataErr) {
            console.error("Data query error:", dataErr);
            return reject(dataErr);
          }
  
          resolve({
            items: dataResults,
            total
          });
        });
      });
    });
  };
  





  