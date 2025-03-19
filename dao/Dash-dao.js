const {
    admin,
    plantcare,
    collectionofficer,
    marketPlace,
    dash,
} = require("../startup/database");

const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const uploadFileToS3 = require("../middlewares/s3upload");
const { resolve } = require("path");

const Joi = require("joi");


// const getHouseDetails = () => `
//     CASE 
//         WHEN c.buildingType = 'House' THEN h.houseNo 
//         ELSE NULL 
//     END AS houseHouseNo,
//     CASE 
//         WHEN c.buildingType = 'House' THEN h.streetName 
//         ELSE NULL 
//     END AS houseStreetName,
//     CASE 
//         WHEN c.buildingType = 'House' THEN h.city 
//         ELSE NULL 
//     END AS houseCity
// `;

// // Function to get apartment details if the customer lives in an apartment
// const getApartmentDetails = () => `
//     CASE 
//         WHEN c.buildingType = 'Apartment' THEN a.buildingNo 
//         ELSE NULL 
//     END AS apartmentBuildingNo,
//     CASE 
//         WHEN c.buildingType = 'Apartment' THEN a.buildingName 
//         ELSE NULL 
//     END AS apartmentBuildingName,
//     CASE 
//         WHEN c.buildingType = 'Apartment' THEN a.unitNo 
//         ELSE NULL 
//     END AS apartmentUnitNo,
//     CASE 
//         WHEN c.buildingType = 'Apartment' THEN a.floorNo 
//         ELSE NULL 
//     END AS apartmentFloorNo,
//     CASE 
//         WHEN c.buildingType = 'Apartment' THEN a.houseNo 
//         ELSE NULL 
//     END AS apartmentHouseNo,
//     CASE 
//         WHEN c.buildingType = 'Apartment' THEN a.streetName 
//         ELSE NULL 
//     END AS apartmentStreetName,
//     CASE 
//         WHEN c.buildingType = 'Apartment' THEN a.city 
//         ELSE NULL 
//     END AS apartmentCity
// `;

// // Function to construct the SQL query
// const getAllCustomersQuery = () => `
//     SELECT 
//         c.id, 
//         c.cusId, 
//         c.title, 
//         c.firstName, 
//         c.lastName, 
//         c.phoneNumber, 
//         c.email, 
//         c.buildingType, 
//         s.empId AS salesAgentEmpId,  
//         s.firstName AS salesAgentFirstName,  
//         s.lastName AS salesAgentLastName,  
//         c.created_at,
//         ${getHouseDetails()},
//         ${getApartmentDetails()}
//     FROM customer c
//     LEFT JOIN salesagent s ON c.salesAgent = s.id  
//     LEFT JOIN house h ON c.id = h.customerId AND c.buildingType = 'House'  
//     LEFT JOIN apartment a ON c.id = a.customerId AND c.buildingType = 'Apartment'  
//     ORDER BY c.created_at DESC
// `;

// // Function to execute the query and fetch customer data
// const getAllCustomers = () => {
//     return new Promise((resolve, reject) => {
//         dash.query(getAllCustomersQuery(), (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             resolve(results);
//         });
//     });
// };

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

        dataSql += " ORDER BY salesagent.createdAt DESC";

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
          const numericPart = parseInt(results[0].empId.substring(4), 10);
  
          const incrementedValue = numericPart + 1;
  
          results[0].empId = incrementedValue.toString().padStart(5, "0");
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

const getSalesAgentDataById = (id) => {
    return new Promise((resolve, reject) => {
      const sql = `
              SELECT 
                  *
              FROM 
                  salesagent
              WHERE 
                  id = ?`;
  
      dash.query(sql, [id], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  };

const updateSalesAgentDetails = (
    id,
    firstName,
    lastName,
    empId,
    empType,
    phoneCode1,
    phoneNumber1,
    phoneCode2,
    phoneNumber2,
    nic,
    email,
    houseNumber,
    streetName,
    city,
    district,
    province,
    country,
    accHolderName,
    accNumber,
    bankName,
    branchName,
    profileImageUrl
  ) => {
    return new Promise((resolve, reject) => {
      let sql = `
               UPDATE salesagent
                  SET firstName = ?, lastName = ?, empId = ?, empType = ?, phoneCode1 = ?, phoneNumber1 = ?, phoneCode2 = ?, phoneNumber2 = ?,
                      nic = ?, email = ?, houseNumber = ?, streetName = ?, city = ?, district = ?, province = ?, country = ?,
                      accHolderName = ?, accNumber = ?, bankName = ?, branchName = ?, status = 'Not Approved'
            `;
      let values = [
        firstName,
        lastName,
        empId,
        empType,
        phoneCode1,
        phoneNumber1,
        phoneCode2,
        phoneNumber2,
        nic,
        email,
        houseNumber,
        streetName,
        city,
        district,
        province,
        country,
        accHolderName,
        accNumber,
        bankName,
        branchName,
        // profileImageUrl,
      ];
  
      sql += ` WHERE id = ?`;
      values.push(id);
  
      dash.query(sql, values, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  };

const getSalesAgentEmailDao = (id) => {
    return new Promise((resolve, reject) => {
      const sql = `
              SELECT email, firstName, empId AS empId
              FROM salesagent
              WHERE id = ?
          `;
      dash.query(sql, [id], (err, results) => {
        if (err) {
          return reject(err); // Reject promise if an error occurs
        }
        if (results.length > 0) {
          resolve({
            email: results[0].email, // Resolve with email
            firstName: results[0].firstName,
            empId: results[0].empId, // Resolve with employeeType (empId)
          });
        } else {
          resolve(null); // Resolve with null if no record is found
        }
      });
    });
  };

const UpdateSalesAgentStatusAndPasswordDao = (params) => {
    return new Promise((resolve, reject) => {
      const sql = `
              UPDATE salesagent
              SET status = ?, password = ?, passwordUpdate = 0
              WHERE id = ?
          `;
      dash.query(
        sql,
        [params.status, params.password, parseInt(params.id)],
        (err, results) => {
          if (err) {
            return reject(err); // Reject promise if an error occurs
          }
          resolve(results); // Resolve with the query results
        }
      );
    });
  };

const SendGeneratedPasswordDao = async (
    email,
    password,
    empId,
    firstName
  ) => {
    try {
      const doc = new PDFDocument();
  
      // Create a buffer to hold the PDF in memory
      const pdfBuffer = [];
      doc.on("data", pdfBuffer.push.bind(pdfBuffer));
      doc.on("end", () => {});
  
      const watermarkPath = "./assets/bg.png";
      doc.opacity(0.2).image(watermarkPath, 100, 300, { width: 400 }).opacity(1);
  
      doc
        .fontSize(20)
        .fillColor("#071a51")
        .text("Welcome to AgroWorld (Pvt) Ltd - Registration Confirmation", {
          align: "center",
        });
  
      doc.moveDown();
  
      const lineY = doc.y;
  
      doc.moveTo(50, lineY).lineTo(550, lineY).stroke();
  
      doc.moveDown();
  
      doc.fontSize(12).text(`Dear ${firstName},`);
  
      doc.moveDown();
  
      doc
        .fontSize(12)
        .text(
          "Thank you for registering with us! We are excited to have you on board."
        );
  
      doc.moveDown();
  
      doc
        .fontSize(12)
        .text(
          "You have successfully created an account with AgroWorld (Pvt) Ltd. Our platform will help you with all your agricultural needs, providing guidance, weather reports, asset management tools, and much more. We are committed to helping farmers like you grow and succeed.",
          {
            align: "justify",
          }
        );
  
      doc.moveDown();
  
      doc.fontSize(12).text(`Your User Name/ID: ${empId}`);
      doc.fontSize(12).text(`Your Password: ${password}`);
  
      doc.moveDown();
  
      doc
        .fontSize(12)
        .text(
          "If you have any questions or need assistance, feel free to reach out to our support team at info@agroworld.lk",
          {
            align: "justify",
          }
        );
  
      doc.moveDown();
  
      doc.fontSize(12).text("We are here to support you every step of the way!", {
        align: "justify",
      });
  
      doc.moveDown();
      doc.fontSize(12).text(`Best Regards,`);
      doc.fontSize(12).text(`The AgroWorld Team`);
      doc.fontSize(12).text(`AgroWorld (Pvt) Ltd. | All rights reserved.`);
      doc.moveDown();
      doc.fontSize(12).text(`Address: No:14,`);
      doc.fontSize(12).text(`            Sir Baron Jayathilake Mawatha,`);
      doc.fontSize(12).text(`            Colombo 01.`);
      doc.moveDown();
      doc.fontSize(12).text(`Email: info@agroworld.lk`);
  
      doc.end();
  
      // Wait until the PDF is fully created and available in the buffer
      await new Promise((resolve) => doc.on("end", resolve));
  
      const pdfData = Buffer.concat(pdfBuffer); // Concatenate the buffer data
  
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465, // or 587 for TLS
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          family: 4,
        },
      });

      // const transporter = nodemailer.createTransport({
      //   host: "smtp.gmail.com",
      //   port: 465, // or 587
      //   secure: true,
      //   auth: {
      //     user: process.env.EMAIL_USER,
      //     pass: process.env.EMAIL_PASS,
      //   },
      //   tls: {
      //     rejectUnauthorized: false, // Allow self-signed certificates
      //   },
      // });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to AgroWorld (Pvt) Ltd - Registration Confirmation",
        text: `Dear ${firstName},\n\nYour registration details are attached in the PDF.`,
        attachments: [
          {
            filename: `password_${empId}.pdf`, // PDF file name
            content: pdfData, // Attach the PDF buffer directly
          },
        ],
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
  
      return { success: true, message: "Email sent successfully!" };
    } catch (error) {
      console.error("Error sending email:", error);
  
      return { success: false, message: "Failed to send email.", error };
    }
  };



  const getAllSalesCustomers = (page, limit, searchText) => {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit;

        let countSql = `
              SELECT 
                COUNT(*) AS total
              FROM 
                  customer CUS
              INNER JOIN 
                  salesagent SA ON CUS.salesAgent = SA.id
        `;

        let dataSql = `
            SELECT 
              CUS.id,
              CUS.cusId,
              CUS.phoneNumber, 
              CUS.firstName, 
              CUS.lastName, 
              CUS.buildingType,
              CUS.email,
              SA.empId,
              SA.firstName AS salesAgentFirstName,
              SA.lastName AS salesAgentLastName,
              (SELECT COUNT(*) FROM orders WHERE customerId = CUS.id) AS totOrders,
              -- House details
              H.houseNo AS houseHouseNo,
              H.streetName AS houseStreetName,
              H.city AS houseCity,
              -- Apartment details
              A.buildingNo AS apartmentBuildingNo,
              A.buildingName AS apartmentBuildingName,
              A.unitNo AS apartmentUnitNo,
              A.houseNo AS apartmentHouseNo,
              A.streetName AS apartmentStreetName,
              A.city AS apartmentCity,
              A.floorNo AS apartmentFloorNo
            FROM 
                customer CUS
            INNER JOIN 
                salesagent SA ON CUS.salesAgent = SA.id
            LEFT JOIN 
                house H ON CUS.id = H.customerId AND CUS.buildingType = 'House'
            LEFT JOIN 
                apartment A ON CUS.id = A.customerId AND CUS.buildingType = 'Apartment'
        `;

        const countParams = [];
        const dataParams = [];

        

        if (searchText) {
            const searchCondition = `
                WHERE (
                    CUS.firstName LIKE ?
                    OR CUS.lastName LIKE ?
                    OR CUS.phoneNumber LIKE ?
                )
            `;
            countSql += searchCondition;
            dataSql += searchCondition;
            const searchValue = `%${searchText}%`;
            countParams.push(searchValue, searchValue, searchValue);
            dataParams.push(searchValue, searchValue, searchValue);
        }


        dataSql += " LIMIT ? OFFSET ?";
        dataParams.push(limit, offset);


        // Execute count query
        dash.query(countSql, countParams, (countErr, countResults) => {
            if (countErr) {
                console.error('Error in count query:', countErr);
                return reject(countErr);
            }

            const total = countResults[0].total;

            // Execute data query
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


module.exports = { getAllSalesCustomers, getAllSalesAgents, deleteSalesAgent, getForCreateId, checkNICExist, checkEmailExist, 
    createSalesAgent, getSalesAgentDataById, updateSalesAgentDetails, SendGeneratedPasswordDao,
    UpdateSalesAgentStatusAndPasswordDao, getSalesAgentEmailDao };

