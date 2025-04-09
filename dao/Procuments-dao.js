const {
    admin,
    plantcare,
    collectionofficer,
    marketPlace,
    dash,
  } = require("../startup/database");








exports.getCollectionReport = (page, limit, centerId, startDate, endDate, search) => {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
  
      let whereClause = `WHERE c.id = 1`;
      const params = [];
      const countParams = [];
  
      if (centerId) {
        whereClause += ` AND co.centerId = ?`;
        params.push(centerId);
        countParams.push(centerId);
      }
  
      if (startDate && endDate) {
        whereClause += " AND DATE(rfp.createdAt) BETWEEN ? AND ?";
        params.push(startDate, endDate);
        countParams.push(startDate, endDate);
      } else if (startDate) {
        whereClause += " AND DATE(rfp.createdAt) >= ?";
        params.push(startDate);
        countParams.push(startDate);
      } else if (endDate) {
        whereClause += " AND DATE(rfp.createdAt) <= ?";
        params.push(endDate);
        countParams.push(endDate);
      }
  
      if (search) {
        whereClause += `
          AND (
            cc.regCode LIKE ? OR 
            cc.centerName LIKE ? OR 
            cg.cropNameEnglish LIKE ? OR
            cv.varietyNameEnglish LIKE ?
          )
        `;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }
  
      const countSql = `
        SELECT 
          COUNT(DISTINCT fpc.id) AS total
        FROM 
          farmerpaymentscrops fpc
        JOIN registeredfarmerpayments rfp ON fpc.registerFarmerId = rfp.id
        JOIN collectionofficer co ON rfp.collectionOfficerId = co.id
        JOIN plant_care.users us ON rfp.userId = us.id
        JOIN collectioncenter cc ON co.centerId = cc.id
        JOIN company c ON co.companyId = c.id
        JOIN plant_care.cropvariety cv ON fpc.cropId = cv.id
        JOIN plant_care.cropgroup cg ON cv.cropGroupId = cg.id
        ${whereClause}
      `;
  
      const dataSql = `
        SELECT 
          fpc.id AS id,
          cc.regCode AS regCode,
          cc.centerName AS centerName,
          cg.cropNameEnglish AS cropGroupName,
          cv.varietyNameEnglish AS varietyName,
          fpc.gradeAquan AS gradeAquan,
          fpc.gradeBquan AS gradeBquan,
          fpc.gradeCquan AS gradeCquan,
          SUM(IFNULL(fpc.gradeAquan, 0) + IFNULL(fpc.gradeBquan, 0) + IFNULL(fpc.gradeCquan, 0)) AS amount,
          fpc.createdAt AS createdAt
        FROM 
          farmerpaymentscrops fpc
        JOIN registeredfarmerpayments rfp ON fpc.registerFarmerId = rfp.id
        JOIN collectionofficer co ON rfp.collectionOfficerId = co.id
        JOIN plant_care.users us ON rfp.userId = us.id
        JOIN collectioncenter cc ON co.centerId = cc.id
        JOIN company c ON co.companyId = c.id
        JOIN plant_care.cropvariety cv ON fpc.cropId = cv.id
        JOIN plant_care.cropgroup cg ON cv.cropGroupId = cg.id
        ${whereClause}
        GROUP BY fpc.id
        LIMIT ? OFFSET ?
      `;
  
      // Add limit and offset to the end of params
      params.push(parseInt(limit), parseInt(offset));
  
      console.log('Executing Count Query...');
      collectionofficer.query(countSql, countParams, (countErr, countResults) => {
        if (countErr) {
          console.error("Error in count query:", countErr);
          return reject(countErr);
        }
  
        const total = countResults[0]?.total || 0;
  
        console.log('Executing Data Query...');
        collectionofficer.query(dataSql, params, (dataErr, dataResults) => {
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





  