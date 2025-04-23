const {
  admin,
  plantcare,
  collectionofficer,
  marketPlace,
  dash,
} = require("../startup/database");
const { Upload } = require("@aws-sdk/lib-storage");
const Joi = require("joi");

// exports.getAllSalesAgentsDao = (page, limit, searchText, status, date, targetValue) => {
//     return new Promise((resolve, reject) => {
//         const offset = (page - 1) * limit;
//         let countSql = `
//         SELECT COUNT(*) AS total FROM salesagent
//         `;

//         let dataSql = `
//         SELECT
//             SA.id,
//             SA.empId,
//             SA.firstName,
//             SA.lastName,
//             (SELECT COUNT(*) FROM orders WHERE salesAgentId = SA.id AND DATE(createdAt) = ?) AS targetComplete
//         FROM
//             salesagent SA

//         `;
//         const countParams = [];
//         const dataParams = [date];

//         // Handling Search Query
//         if (searchText) {
//             if (searchText) {
//                 dataSql += `
//                     WHERE ( SA.lastName LIKE ? OR SA.firstName LIKE ? OR SA.empId LIKE ? )
//                 `
//             }

//             const searchPattern = `%${searchText}%`;
//             countParams.push(searchPattern, searchPattern, searchPattern);
//             dataParams.push(searchPattern, searchPattern, searchPattern);
//         }

//         // Handling Status Filter
//         if (status) {
//             if (status === 'Pending') {
//                 dataSql += ` HAVING targetComplete < ? `
//                 dataParams.push(targetValue)
//             } else if (status === 'Completed') {
//                 dataSql += ` HAVING targetComplete = ? `
//                 dataParams.push(targetValue)
//             } else if (status === 'Exceeded') {
//                 dataSql += ` HAVING targetComplete > ? `
//                 dataParams.push(targetValue)
//             } else {
//                 console.log("not valid status");
//             }
//         }

//         dataSql += " LIMIT ? OFFSET ? ";
//         dataParams.push(parseInt(limit), parseInt(offset));

//         // Execute Count Query
//         dash.query(countSql, countParams, (countErr, countResults) => {
//             if (countErr) {
//                 console.error('Error in count query:', countErr);
//                 return reject(countErr);
//             }

//             const total = countResults[0].total;

//             // Execute Data Query
//             dash.query(dataSql, dataParams, (dataErr, dataResults) => {
//                 if (dataErr) {
//                     console.error('Error in data query:', dataErr);
//                     return reject(dataErr);
//                 }

//                 // console.log(dataResults);

//                 resolve({ items: dataResults, total });
//             });
//         });
//     });
// };

exports.getAllSalesAgentsDao = (
  page,
  limit,
  searchText,
  status,
  date,
  targetValue
) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    let countSql = `
        SELECT COUNT(*) AS total FROM salesagent
        WHERE status = 'Approved'
        `;

    let dataSql = `
        SELECT 
            SA.id,
            SA.empId,
            SA.firstName,
            SA.lastName,
            SAS.completed AS targetComplete,
            SAS.target AS target
        FROM 
            salesagent SA
        JOIN
            salesagentstars SAS ON SA.id = SAS.salesagentId
        WHERE SA.status = 'Approved' AND SAS.date = ?
        `;
    const countParams = [];
    const dataParams = [date];

    // Handling Search Query
    if (searchText) {
      const searchPattern = `%${searchText}%`;
      dataSql += `
                AND (SA.lastName LIKE ? OR SA.firstName LIKE ? OR SA.empId LIKE ?)
            `;
      countSql += `
                AND (lastName LIKE ? OR firstName LIKE ? OR empId LIKE ?)
            `;

      countParams.push(searchPattern, searchPattern, searchPattern);
      dataParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Handling Status Filter (for target completion)
    if (status) {
      if (status === "Pending") {
        dataSql += ` HAVING targetComplete < ? `;
        dataParams.push(targetValue);
      } else if (status === "Completed") {
        dataSql += ` HAVING targetComplete = ? `;
        dataParams.push(targetValue);
      } else if (status === "Exceeded") {
        dataSql += ` HAVING targetComplete > ? `;
        dataParams.push(targetValue);
      }
    }

    dataSql += " LIMIT ? OFFSET ? ";
    dataParams.push(parseInt(limit), parseInt(offset));

    // Execute Count Query
    dash.query(countSql, countParams, (countErr, countResults) => {
      if (countErr) {
        console.error("Error in count query:", countErr);
        return reject(countErr);
      }

      const total = countResults[0].total;

      // Execute Data Query
      dash.query(dataSql, dataParams, (dataErr, dataResults) => {
        if (dataErr) {
          console.error("Error in data query:", dataErr);
          return reject(dataErr);
        }

        resolve({ items: dataResults, total });
      });
    });
  });
};

exports.saveTargetDao = (target, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
        INSERT INTO target(targetValue, createdBy) VALUES (?, ?)
      
      `;

    dash.query(sql, [target.targetValue, userId], (err, results) => {
      if (err) {
        return reject(err); // Reject if an error occurs
      }
      resolve(results);
    });
  });
};

//not usage
// exports.getDailyTarget = () => {
//     return new Promise((resolve, reject) => {
//         const sql = `
//         SELECT targetValue FROM target WHERE target.id = 1
//       `;

//         dash.query(sql, (err, results) => {
//             if (err) {
//                 return reject(err); // Reject if an error occurs
//             }

//             resolve({ results });
//         });
//     });
// };

exports.getTotalTargetDao = (date) => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT targetValue FROM target WHERE DATE(createdAt) = ? 
      `;

    dash.query(sql, [date], (err, results) => {
      if (err) {
        return reject(err); // Reject if an error occurs
      }

      let data;
      if (results.length === 0) {
        data = { targetValue: 0 };
      } else {
        data = results[0];
      }

      resolve(data);
    });
  });
};

exports.removeTargetDao = (target, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
        DELETE FROM target 
        WHERE DATE(createdAt) = CURDATE()
    `;

    dash.query(sql, (err, results) => {
      if (err) {
        return reject(err); // Reject if an error occurs
      }
      resolve(results);
    });
  });
};
