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

