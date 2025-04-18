const {
  admin,
  plantcare,
  collectionofficer,
  marketPlace,
  dash,
} = require("../startup/database");




exports.getPreMadePackages = (page, limit, packageStatus, date, search) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;

    let whereClause = ` WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (packageStatus) {
      whereClause += ` AND o.packageStatus = ?`;
      params.push(packageStatus);
      countParams.push(packageStatus);
    }

    if (date) {
      whereClause += " AND DATE(o.scheduleDate) = ?";
      params.push(date);
      countParams.push(date);
    }

    if (search) {
      whereClause += ` AND (o.invNo LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern);
      countParams.push(searchPattern);
    }

    const countSql = `
        SELECT 
          COUNT(DISTINCT o.id) AS total
        FROM 
          orders o
        INNER JOIN orderpackageitems opi ON o.id = opi.orderId
        LEFT JOIN modifiedplusitems mpi ON opi.id = mpi.orderPackageItemsId
        LEFT JOIN modifiedminitems mmi ON opi.id = mmi.orderPackageItemsId
        INNER JOIN market_place.marketplacepackages mpp ON opi.packageId = mpp.id
        LEFT JOIN additionalitem ai ON opi.id = ai.orderPackageItemsId
        ${whereClause}
      `;

    const dataSql = `
        SELECT 
          o.id AS id,
          o.invNo AS invoiceNum,
          o.packageStatus AS packageStatus,
          opi.id AS orderPackageItemsId,
          mpp.displayName AS packageName,
          IFNULL(opi.packageSubTotal, 0) +
          IFNULL(SUM(mpi.additionalPrice), 0) -
          IFNULL(SUM(mmi.additionalPrice), 0) AS packagePrice,
          IFNULL(SUM(ai.subtotal), 0) AS additionalPrice,
          o.scheduleDate AS scheduleDate,
          o.fullSubTotal AS fullSubTotal,
          (
            IFNULL(opi.packageSubTotal, 0) +
            IFNULL(SUM(mpi.additionalPrice), 0) -
            IFNULL(SUM(mmi.additionalPrice), 0) +
            IFNULL(SUM(ai.subtotal), 0)
          ) AS totalPrice
        FROM 
          orders o
        INNER JOIN orderpackageitems opi ON o.id = opi.orderId
        LEFT JOIN modifiedplusitems mpi ON opi.id = mpi.orderPackageItemsId
        LEFT JOIN modifiedminitems mmi ON opi.id = mmi.orderPackageItemsId
        INNER JOIN market_place.marketplacepackages mpp ON opi.packageId = mpp.id
        LEFT JOIN additionalitem ai ON opi.id = ai.orderPackageItemsId
        ${whereClause}
        GROUP BY o.id, o.invNo, o.packageStatus, mpp.displayName, opi.packageSubTotal, o.scheduleDate, o.fullSubTotal
        ORDER BY o.createdAt DESC
        LIMIT ? OFFSET ?
      `;

    // Add pagination parameters
    params.push(parseInt(limit), parseInt(offset));

    console.log('Executing Count Query...');
    dash.query(countSql, countParams, (countErr, countResults) => {
      if (countErr) {
        console.error("Error in count query:", countErr);
        return reject(countErr);
      }

      const total = countResults[0]?.total || 0;

      console.log('Executing Data Query...');
      dash.query(dataSql, params, (dataErr, dataResults) => {
        if (dataErr) {
          console.error("Error in data query:", dataErr);
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

















exports.getSelectedPackages = (page, limit, packageStatus, date, search) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;

    let whereClause = ` WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (packageStatus) {
      whereClause += ` AND o.packageStatus = ?`;
      params.push(packageStatus);
      countParams.push(packageStatus);
    }

    if (date) {
      whereClause += " AND DATE(o.scheduleDate) = ?";
      params.push(date);
      countParams.push(date);
    }

    if (search) {
      whereClause += ` AND (o.invNo LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern);
      countParams.push(searchPattern);
    }

    const countSql = `
        SELECT 
          COUNT(DISTINCT o.id) AS total
        FROM 
          orders o
        INNER JOIN orderselecteditems osi ON o.id = osi.orderId
        ${whereClause}
      `;

    const dataSql = `
        SELECT 
        o.id AS id,
        o.invNo AS invoiceNum,
        o.packageStatus AS packageStatus,
        IFNULL(SUM(osi.subtotal), 0) AS totalPrice,
        o.scheduleDate AS scheduleDate,
        o.fullSubTotal AS fullSubTotal
        FROM 
        orders o
        INNER JOIN orderselecteditems osi ON o.id = osi.orderId
        ${whereClause}
        GROUP BY o.id, o.invNo
        LIMIT ? OFFSET ?
      `;

    // Add limit and offset to the end of params
    params.push(parseInt(limit), parseInt(offset));

    console.log('Executing Count Query...');
    dash.query(countSql, countParams, (countErr, countResults) => {
      if (countErr) {
        console.error("Error in count query:", countErr);
        return reject(countErr);
      }

      const total = countResults[0]?.total || 0;

      console.log('Executing Data Query...');
      dash.query(dataSql, params, (dataErr, dataResults) => {
        if (dataErr) {
          console.error("Error in data query:", dataErr);
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


exports.getPackageItems = (id) => {
  return new Promise((resolve, reject) => {

    const params = [id];

    const dataSql = `
      SELECT fopl.id AS packageListId, fopl.orderId, fopl.quantity, fopl.price, fopl.isPacking, o.invNo, mpi.displayName  FROM 
      dash.finalorderpackagelist fopl LEFT JOIN
      dash.orders o ON fopl.orderId = o.id LEFT JOIN 
      market_place.marketplaceitems mpi ON fopl.productId = mpi.id LEFT JOIN
      plant_care.cropvariety cv ON mpi.varietyId = cv.id LEFT JOIN
      plant_care.cropgroup cg ON cv.cropGroupId = cg.id
      WHERE o.id = ?
      `;


    console.log('Executing Count Query...');

    dash.query(dataSql, params, (dataErr, dataResults) => {
      if (dataErr) {
        console.error("Error in data query:", dataErr);
        return reject(dataErr);
      }

      resolve({
        items: dataResults,
        total: dataResults.length,
      });
    });
  });
};

exports.updateIsPackedStatus = (packedItems) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(packedItems)) {
      return reject(new Error('packedItems must be an array'));
    }

    if (packedItems.length === 0) {
      return resolve({ affectedRows: 0, message: 'No items to update' });
    }

    const updateSql = `
      UPDATE finalorderpackagelist 
      SET isPacking = ? 
      WHERE id = ?
    `;

    let completed = 0;
    let totalUpdated = 0;
    let failedUpdates = [];

    packedItems.forEach(({ id, isPacked }) => {
      dash.query(updateSql, [isPacked, id], (err, result) => {
        completed++;

        if (err) {
          console.error(`Error updating item with ID ${id}:`, err);
          failedUpdates.push(id);
        } else {
          console.log(`Updated item ID ${id} to isPacking = ${isPacked}`);
          totalUpdated += result.affectedRows;
        }

        if (completed === packedItems.length) {
          resolve({
            success: true,
            affectedRows: totalUpdated,
            failedUpdates,
            message: `${totalUpdated} items updated. ${failedUpdates.length ? failedUpdates.length + ' failed.' : 'All successful.'}`
          });
        }
      });
    });
  });
};






  exports.getCustomOrderDetailsById = (id) => {
    return new Promise((resolve, reject) => {

      const sql = `SELECT 
                    osi.id AS id,
                    cv.varietyNameEnglish AS item,
                    osi.quantity AS quantity,
                    ROUND(mpi.discountedPrice / mpi.startValue, 2) AS UnitPrice,
                    osi.subtotal AS subtotal,
                    osi.isPacked AS isPacked
                   FROM orderselecteditems osi
                   JOIN market_place.marketplaceitems mpi ON osi.mpItemId = mpi.id
                   JOIN plant_care.cropvariety cv ON mpi.varietyId = cv.id
                   WHERE orderId = ?
                   `;

        dash.query(sql, [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  };







  exports.updateCustomPackItems = (items) => {
    return new Promise((resolve, reject) => {
      if (items.length === 0) {
        return resolve();
      }
  
      // First, update all the items' isPacked status
      const updates = items.map(item => {
        return new Promise((res, rej) => {
          const sql = `
            UPDATE orderselecteditems 
            SET isPacked = ? 
            WHERE id = ?
          `;
          dash.query(sql, [item.isPacked, item.id], (err, result) => {
            if (err) {
              return rej(err);
            }
            res({ result, itemId: item.id });
          });
        });
      });
  
      Promise.all(updates)
        .then(() => {
          // Get all item IDs
          const itemIds = items.map(item => item.id);
          
          // Fetch the orderIds for these items
          const getOrderIdsSql = `
            SELECT id, orderId 
            FROM orderselecteditems 
            WHERE id IN (${itemIds.join(',')})
          `;
          
          return new Promise((res, rej) => {
            dash.query(getOrderIdsSql, [], (err, results) => {
              if (err) {
                return rej(err);
              }
              res(results);
            });
          });
        })
        .then(itemsWithOrderIds => {
          // Extract the unique orderIds
          const orderIds = [...new Set(itemsWithOrderIds.map(item => item.orderId))];
          console.log('Order IDs to process:', orderIds);
          
          // For each affected order, check the packing status
          const orderUpdates = orderIds.map(orderId => {
            return new Promise((res, rej) => {
              // Query to count all items and packed items for this order
              const countSql = `
                SELECT 
                  COUNT(*) as totalItems,
                  SUM(IF(isPacked = 1, 1, 0)) as packedItems
                FROM orderselecteditems
                WHERE orderId = ?
              `;
              
              dash.query(countSql, [orderId], (err, counts) => {
                if (err) {
                  return rej(err);
                }
                
                const totalItems = parseInt(counts[0].totalItems, 10);
                const packedItems = parseInt(counts[0].packedItems, 10);
                
                console.log(`Order ${orderId}: Total items = ${totalItems}, Packed items = ${packedItems}`);
                
                // Determine new packageStatus based on counts
                let packageStatus = 'Pending';
                
                if (totalItems > 0) {
                  if (packedItems > 0) {
                    // At least one item is packed
                    if (packedItems === totalItems) {
                      // All items are packed
                      packageStatus = 'Completed';
                      console.log(`Order ${orderId}: Setting status to Completed`);
                    } else {
                      // Some but not all items are packed
                      packageStatus = 'Opened';
                      console.log(`Order ${orderId}: Setting status to Opened`);
                    }
                  } else {
                    console.log(`Order ${orderId}: Setting status to Pending (no packed items)`);
                  }
                } else {
                  console.log(`Order ${orderId}: No items found for this order`);
                }
                
                // Update the order's packageStatus
                const updateOrderSql = `
                  UPDATE orders
                  SET packageStatus = ?
                  WHERE id = ?
                `;
                
                dash.query(updateOrderSql, [packageStatus, orderId], (err, result) => {
                  if (err) {
                    console.error(`Failed to update order ${orderId}:`, err);
                    return rej(err);
                  }
                  console.log(`Successfully updated order ${orderId} to ${packageStatus}`);
                  res(result);
                });
              });
            });
          });
          
          return Promise.all(orderUpdates);
        })
        .then(resolve)
        .catch(reject);
    });
  };








  exports.getPackageOrderDetailsById = (id) => {
    return new Promise((resolve, reject) => {

      const sql = `SELECT 
                    ai.id AS id,
                    cv.varietyNameEnglish AS item,
                    ai.quantity AS quantity,
                    ROUND(mpi.discountedPrice / mpi.startValue, 2) AS UnitPrice,
                    ai.subtotal AS subtotal,
                    ai.isPacked AS isPacked
                   FROM additionalitem ai
                   JOIN market_place.marketplaceitems mpi ON ai.mpItemId = mpi.id
                   JOIN plant_care.cropvariety cv ON mpi.varietyId = cv.id
                   WHERE orderPackageItemsId = ?
                   `;

        dash.query(sql, [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  };




