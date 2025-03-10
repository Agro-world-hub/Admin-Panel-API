const {
    admin,
    plantcare,
    collectionofficer,
    marketPlace,
    dash,
} = require("../startup/database");

const Joi = require("joi");


const getHouseDetails = () => `
    CASE 
        WHEN c.buildingType = 'House' THEN h.houseNo 
        ELSE NULL 
    END AS houseHouseNo,
    CASE 
        WHEN c.buildingType = 'House' THEN h.streetName 
        ELSE NULL 
    END AS houseStreetName,
    CASE 
        WHEN c.buildingType = 'House' THEN h.city 
        ELSE NULL 
    END AS houseCity
`;

// Function to get apartment details if the customer lives in an apartment
const getApartmentDetails = () => `
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.buildingNo 
        ELSE NULL 
    END AS apartmentBuildingNo,
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.buildingName 
        ELSE NULL 
    END AS apartmentBuildingName,
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.unitNo 
        ELSE NULL 
    END AS apartmentUnitNo,
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.floorNo 
        ELSE NULL 
    END AS apartmentFloorNo,
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.houseNo 
        ELSE NULL 
    END AS apartmentHouseNo,
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.streetName 
        ELSE NULL 
    END AS apartmentStreetName,
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.city 
        ELSE NULL 
    END AS apartmentCity
`;

// Function to construct the SQL query
const getAllCustomersQuery = () => `
    SELECT 
        c.id, 
        c.cusId, 
        c.title, 
        c.firstName, 
        c.lastName, 
        c.phoneNumber, 
        c.email, 
        c.buildingType, 
        s.empId AS salesAgentEmpId,  
        s.firstName AS salesAgentFirstName,  
        s.lastName AS salesAgentLastName,  
        c.created_at,
        ${getHouseDetails()},
        ${getApartmentDetails()}
    FROM customer c
    LEFT JOIN salesagent s ON c.salesAgent = s.id  
    LEFT JOIN house h ON c.id = h.customerId AND c.buildingType = 'House'  
    LEFT JOIN apartment a ON c.id = a.customerId AND c.buildingType = 'Apartment'  
    ORDER BY c.created_at DESC
`;

// Function to execute the query and fetch customer data
const getAllCustomers = () => {
    return new Promise((resolve, reject) => {
        dash.query(getAllCustomersQuery(), (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

const getAllSalesAgents = (page, limit, searchText, status) => {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit;

        let countSql = `
            SELECT COUNT(*) as total
            FROM salesagent
        `;

        let dataSql = `
            SELECT
                salesagent.id,
                salesagent.empId,
                salesagent.firstName,
                salesagent.lastName,
                salesagent.status,
                salesagent.phoneCode1,
                salesagent.phoneNumber1,
                salesagent.nic
            FROM salesagent
        `;

        const countParams = [];
        const dataParams = [];

        let whereConditions = []; // Store WHERE conditions

        if (searchText) {
            whereConditions.push(`
                (
                    salesagent.nic LIKE ?
                    OR salesagent.firstName LIKE ?
                    OR salesagent.lastName LIKE ?
                    OR salesagent.phoneNumber1 LIKE ?
                    OR salesagent.phoneCode1 LIKE ?
                    OR salesagent.empId LIKE ?
                    OR salesagent.status LIKE ?
                )
            `);

            const searchValue = `%${searchText}%`;
            countParams.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue, searchValue);
            dataParams.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue, searchValue);
        }

        if (status) {
            whereConditions.push(`salesagent.status = ?`);
            countParams.push(status);
            dataParams.push(status);
        }

        // Append WHERE conditions if any exist
        if (whereConditions.length > 0) {
            countSql += " WHERE " + whereConditions.join(" AND ");
            dataSql += " WHERE " + whereConditions.join(" AND ");
        }

        // Add pagination at the end, so LIMIT and OFFSET are always numbers
        dataSql += " LIMIT ? OFFSET ?";
        dataParams.push(parseInt(limit), parseInt(offset)); // Ensure they are integers

        // Execute count query
        dash.query(countSql, countParams, (countErr, countResults) => {
            if (countErr) {
                console.error("Error in count query:", countErr);
                return reject(countErr);
            }

            const total = countResults[0].total;

            // Execute data query
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


const deleteSalesAgent = async (id) => {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM salesagent WHERE id = ?";
      dash.query(sql, [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.affectedRows);
        }
      });
    });
  };




module.exports = { getAllCustomers, getAllSalesAgents, deleteSalesAgent };

// Apply filters for company ID
    //   if (companyid) {
    //     countSql += " AND cm.id = ?";
    //     dataSql += " AND cm.id = ?";
    //     countParams.push(companyid);
    //     dataParams.push(companyid);
    //   }
  
      // Apply search filters for NIC or related fields
    //   if (searchNIC) {
    //     const searchCondition = `
    //               AND (
    //                   coff.nic LIKE ?
    //                   OR coff.firstNameEnglish LIKE ?
    //                   OR cm.companyNameEnglish LIKE ?
    //                   OR coff.phoneNumber01 LIKE ?
    //                   OR coff.phoneNumber02 LIKE ?
    //                   OR coff.district LIKE ?
    //                   OR coff.empId LIKE ?
    //               )
    //           `;
    //     countSql += searchCondition;
    //     dataSql += searchCondition;
    //     const searchValue = `%${searchNIC}%`;
    //     countParams.push(
    //       searchValue,
    //       searchValue,
    //       searchValue,
    //       searchValue,
    //       searchValue,
    //       searchValue,
    //       searchValue
    //     );
    //     dataParams.push(
    //       searchValue,
    //       searchValue,
    //       searchValue,
    //       searchValue,
    //       searchValue,
    //       searchValue,
    //       searchValue
    //     );
    //   }

