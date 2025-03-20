const { admin, plantcare, collectionofficer, marketPlace, dash, } = require("../startup/database");
const { Upload } = require("@aws-sdk/lib-storage");
const Joi = require("joi");


exports.getAllSalesAgentsDao = (page, limit, searchText, status, date) => {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit;
        let countSql = `
        SELECT COUNT(*) AS total FROM salesagent

        `;
        let dataSql = `
        SELECT 
            SA.id,
            SA.empId,
            SA.firstName,
            SA.lastName,
            (SELECT COUNT(*) FROM orders WHERE salesAgentId = SA.id AND DATE(createdAt) = ?) AS targetComplete
        FROM 
            salesagent SA
            
        `;
        const countParams = [];
        const dataParams = [date];

        let whereClauses = [];

        // Handling Search Query
        if (searchText) {
            whereClauses.push(`(salesagent.firstName LIKE ? 
                OR salesagent.lastName LIKE ? 
                OR salesagent.empId LIKE ?)`);

            const searchPattern = `%${searchText}%`;
            countParams.push(searchPattern, searchPattern, searchPattern);
            dataParams.push(searchPattern, searchPattern, searchPattern);
        }

        // Handling Status Filter
        // if (status) {
        //     whereClauses.push(`
        //     (CASE 
        //         WHEN salesagentstars.completed > SA.target THEN 'Exceeded'
        //         WHEN salesagentstars.completed = SA.target THEN 'Completed'
        //         ELSE 'Pending'
        //     END = ?)`);

        //     countParams.push(status);
        //     dataParams.push(status);
        // }

        // Handling Date Filter
        // if (date) {
        //     whereClauses.push(`DATE(salesagent.createdAt) = DATE(?)`);

        //     countParams.push(date);
        //     dataParams.push(date);
        // }

        // // Adding WHERE clauses to queries
        // if (whereClauses.length > 0) {
        //     countSql += ` WHERE ${whereClauses.join(' AND ')}`;
        //     dataSql += ` WHERE ${whereClauses.join(' AND ')}`;
        // }

        dataSql += " LIMIT ? OFFSET ?";
        dataParams.push(parseInt(limit, 10), parseInt(offset, 10));

        // Execute Count Query
        dash.query(countSql, countParams, (countErr, countResults) => {
            if (countErr) {
                console.error('Error in count query:', countErr);
                return reject(countErr);
            }

            const total = countResults[0].total;

            // Execute Data Query
            dash.query(dataSql, dataParams, (dataErr, dataResults) => {
                if (dataErr) {
                    console.error('Error in data query:', dataErr);
                    return reject(dataErr);
                }

                // console.log(dataResults);


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
                data = { "targetValue": 0 }
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





