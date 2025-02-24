const { admin, plantcare, collectionofficer, marketPlace, dash, } = require("../startup/database");
const { Upload } = require("@aws-sdk/lib-storage");
const Joi = require("joi");


exports.getAllSalesAgentsDao = (page, limit, searchText, status, date) => {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit;
        let countSql = `
        SELECT COUNT(*) AS total FROM salesagent
        JOIN salesagentstars
        ON salesagent.id = salesagentstars.salesagentId
        `;
        let dataSql = `
        SELECT 
            salesagent.id, 
            salesagent.firstName, 
            salesagent.lastName, 
            salesagent.empId,
            salesagent.createdAt,
            salesagentstars.completed, 
            salesagentstars.target,
            CONCAT(salesagentstars.completed, '/', salesagentstars.target) AS targetCompletion,
            CASE 
                WHEN salesagentstars.completed > salesagentstars.target THEN 'Exceeded'
                WHEN salesagentstars.completed = salesagentstars.target THEN 'Completed'
                ELSE 'Pending'
            END AS targetStatus
        FROM salesagent
        JOIN salesagentstars
        ON salesagent.id = salesagentstars.salesagentId
        `;
        const countParams = [];
        const dataParams = [];
        
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
        if (status) {
            whereClauses.push(`
            (CASE 
                WHEN salesagentstars.completed > salesagentstars.target THEN 'Exceeded'
                WHEN salesagentstars.completed = salesagentstars.target THEN 'Completed'
                ELSE 'Pending'
            END = ?)`);
            
            countParams.push(status);
            dataParams.push(status);
        }
        
        // Handling Date Filter
        if (date) {
            whereClauses.push(`DATE(salesagent.createdAt) = DATE(?)`);
            
            countParams.push(date);
            dataParams.push(date);
        }
        
        // Adding WHERE clauses to queries
        if (whereClauses.length > 0) {
            countSql += ` WHERE ${whereClauses.join(' AND ')}`;
            dataSql += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        
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
                
                resolve({ items: dataResults, total });
            });
        });
    });
};




         // if (grade) {
        //     countSql += " AND MP.grade LIKE ?";
        //     dataSql += " AND MP.grade LIKE ?";
        //     countParams.push(grade);
        //     dataParams.push(grade);
        // }

        // if (searchText) {
        //     const searchCondition = `
        //         AND (
        //             CG.cropNameEnglish LIKE ?
        //             OR CV.varietyNameEnglish LIKE ?
        //         )
        //     `;
        //     countSql += searchCondition;
        //     dataSql += searchCondition;
        //     const searchValue = `%${searchText}%`;
        //     countParams.push(searchValue, searchValue);
        //     dataParams.push(searchValue, searchValue);
        // }