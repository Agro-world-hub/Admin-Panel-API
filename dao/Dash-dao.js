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


const getForCreateId = (role) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT empId FROM salesagent WHERE empId LIKE ? ORDER BY empId DESC LIMIT 1";
      dash.query(sql, [`${role}%`], (err, results) => {
        if (err) {
          return reject(err);
        }
  
        if (results.length > 0) {
          const numericPart = parseInt(results[0].empId.substring(3), 10);
  
          const incrementedValue = numericPart + 1;
  
          results[0].empId = incrementedValue.toString().padStart(4, "0");
          console.log(results[0].empId);
        }
  
        resolve(results);
      });
    });
  };

const checkNICExist = (nic) => {
    return new Promise((resolve, reject) => {
      const sql = `
              SELECT COUNT(*) AS count 
              FROM salesagent 
              WHERE nic = ?
          `;
  
      dash.query(sql, [nic], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results[0].count > 0); // Return true if either NIC or email exists
      });
    });
  };
  
const checkEmailExist = (email) => {
    return new Promise((resolve, reject) => {
      const sql = `
              SELECT COUNT(*) AS count 
              FROM salesagent 
              WHERE email = ?
          `;
  
      dash.query(sql, [email], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results[0].count > 0); // Return true if either NIC or email exists
      });
    });
  };

const createSalesAgent = (officerData, profileImageUrl) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Prepare data for QR code generation
        // const qrData = `
        //       {
        //           "empId": "${officerData.empId}",
        //       }
        //       `;
  
        // const qrCodeBase64 = await QRCode.toDataURL(qrData);
        // const qrCodeBuffer = Buffer.from(
        //   qrCodeBase64.replace(/^data:image\/png;base64,/, ""),
        //   "base64"
        // );
        // const qrcodeURL = await uploadFileToS3(
        //   qrCodeBuffer,
        //   `${officerData.empId}.png`,
        //   "collectionofficer/QRcode"
        // );
        // console.log(qrcodeURL);
  
        // If no image URL, set it to null
        const imageUrl = profileImageUrl || null; // Use null if profileImageUrl is not provided
  
        const sql = `
                  INSERT INTO salesagent (
                      firstName, lastName, empId, empType, phoneCode1, phoneNumber1, phoneCode2, phoneNumber2,
                      nic, email, houseNumber, streetName, city, district, province, country,
                      accHolderName, accNumber, bankName, branchName, status
                  ) VALUES (
                           ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                           ?, ?, ?, ?, ?, ?, ?, ?, ?,?, 'Not Approved')
              `;
  
        // Database query with QR image data added
        dash.query(
          sql,
          [
            
            officerData.firstName,
            officerData.lastName,
            officerData.empId,
            officerData.empType,
            officerData.phoneCode1,
            officerData.phoneNumber1,
            officerData.phoneCode2,
            officerData.phoneNumber2,
            officerData.nic,
            officerData.email,
            officerData.houseNumber,
            officerData.streetName,
            officerData.city,
            officerData.district,
            officerData.province,
            officerData.country,
            officerData.accHolderName,
            officerData.accNumber,
            officerData.bankName,
            officerData.branchName,
            // imageUrl, 
          ],
          (err, results) => {
            if (err) {
              console.log(err);
              return reject(err); // Reject promise if an error occurs
            }
            resolve(results); // Resolve the promise with the query results
          }
        );
      } catch (error) {
        reject(error); // Reject if any error occurs during QR code generation
      }
    });
  };




module.exports = { getAllCustomers, getAllSalesAgents, deleteSalesAgent, getForCreateId, checkNICExist, checkEmailExist, 
    createSalesAgent };

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

