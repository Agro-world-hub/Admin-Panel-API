const db = require("../startup/database");
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');


exports.getCollectionOfficerDistrictReports = (district) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT cg.cropNameEnglish AS cropName,
             c.district, 
             SUM(fpc.gradeAquan) AS qtyA, 
             SUM(fpc.gradeBquan) AS qtyB, 
             SUM(fpc.gradeCquan) AS qtyC, 
             SUM(fpc.gradeAprice) AS priceA, 
             SUM(fpc.gradeBprice) AS priceB, 
             SUM(fpc.gradeCprice) AS priceC
            FROM registeredfarmerpayments rp, collectionofficer c, cropvariety cv , cropgroup cg, farmerpaymentscrops fpc
            WHERE rp.id = fpc.registerFarmerId AND rp.collectionOfficerId = c.id AND fpc.cropId = cv.id AND cv.cropGroupId = cg.id AND c.district = ?
            GROUP BY cg.cropNameEnglish, c.district
        `;
        db.query(sql, [district], (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }
            console.log(results);
            
            resolve(results); // Resolve the promise with the query results
        });
    });
};

exports.createCollectionOfficerPersonal = (officerData, companyData, bankData) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Prepare data for QR code generation
            const qrData = `
            {
                "centerId": ${officerData.centerId},
                "firstNameEnglish": "${officerData.firstNameEnglish}",
                "firstNameEnglish": "${officerData.lastNameEnglish}",
                "phoneNumber01": ${officerData.phoneNumber01Code + officerData.phoneNumber01},
                "phoneNumber01": ${officerData.phoneNumber02Code + officerData.phoneNumber02},
                "nic": "${officerData.nic}",
                "companyNameEnglish": "${companyData.companyNameEnglish}",
                "jobRole": "${companyData.jobRole}",
                "accHolderName": "${bankData.accHolderName}",
                "accNumber": "${bankData.accNumber}",
                "bankName": "${bankData.bankName}",
                "branchName": "${bankData.branchName}",
            }
            `;

            const qrCodeBase64 = await QRCode.toDataURL(qrData);

            const qrCodeBuffer = Buffer.from(
                qrCodeBase64.replace(/^data:image\/png;base64,/, ""),
                'base64'
            );

            const sql = `
                INSERT INTO collectionofficer (
                    centerId, firstNameEnglish, firstNameSinhala, firstNameTamil, lastNameEnglish, lastNameSinhala, lastNameTamil,
                    phoneNumber01, phoneNumber02, image, QRcode, nic, email, houseNumber, streetName, city, district,
                    province, country, languages, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,'Not Approved')
            `;

            // Database query with QR image data added
            db.query(
                sql,
                [
                    officerData.centerId,
                    officerData.firstNameEnglish,
                    officerData.firstNameSinhala,
                    officerData.firstNameTamil,
                    officerData.lastNameEnglish,
                    officerData.lastNameSinhala,
                    officerData.lastNameTamil,
                    officerData.phoneNumber01Code + officerData.phoneNumber01,
                    officerData.phoneNumber02Code + officerData.phoneNumber02,
                    officerData.image,
                    qrCodeBuffer,
                    officerData.nic,
                    officerData.email,
                    officerData.houseNumber,
                    officerData.streetName,
                    officerData.city,
                    officerData.district,
                    officerData.province,
                    officerData.country,
                    officerData.languages,
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


exports.getAllCollectionOfficers = (page, limit, searchNIC, companyid) => {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit;

        let countSql = `
            SELECT COUNT(*) as total
            FROM collectionofficer Coff
            JOIN collectionofficercompanydetails Ccom ON Coff.id = Ccom.collectionofficerId
            JOIN collectioncenter CC ON Coff.centerId = CC.id
            WHERE 1 = 1
        `;

        let dataSql = `
            SELECT
                Coff.id,
                Coff.image,
                Coff.firstNameEnglish,
                Coff.lastNameEnglish,
                Ccom.companyNameEnglish,
                Ccom.empId,
                Coff.phoneNumber01,
                Coff.phoneNumber02,
                Coff.nic,
                Coff.district,
                Coff.status,
                CC.centerName
            FROM collectionofficer Coff
            JOIN collectionofficercompanydetails Ccom ON Coff.id = Ccom.collectionofficerId
            JOIN collectioncenter CC ON Coff.centerId = CC.id
            WHERE Coff.status = 'Approved'
        `;

        const countParams = [];
        const dataParams = [];

        // Apply filters for company ID
        if (companyid) {
            countSql += " AND Ccom.id = ?";
            dataSql += " AND Ccom.id = ?";
            countParams.push(companyid);
            dataParams.push(companyid);
        }

        // Apply search filters for NIC or related fields
        if (searchNIC) {
            const searchCondition = `
                AND (
                    Coff.nic LIKE ?
                    OR Coff.firstNameEnglish LIKE ?
                    OR Ccom.companyNameEnglish LIKE ?
                    OR Coff.phoneNumber01 LIKE ?
                    OR Coff.phoneNumber02 LIKE ?
                    OR Coff.district LIKE ?
                )
            `;
            countSql += searchCondition;
            dataSql += searchCondition;
            const searchValue = `%${searchNIC}%`;
            countParams.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue);
            dataParams.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue);
        }

        // Add pagination to the data query
        dataSql += " LIMIT ? OFFSET ?";
        dataParams.push(limit, offset);

        // Execute count query
        db.query(countSql, countParams, (countErr, countResults) => {
            if (countErr) {
                console.error('Error in count query:', countErr);
                return reject(countErr);
            }

            const total = countResults[0].total;

            // Execute data query
            db.query(dataSql, dataParams, (dataErr, dataResults) => {
                if (dataErr) {
                    console.error('Error in data query:', dataErr);
                    return reject(dataErr);
                }

                resolve({ items: dataResults, total });
            });
        });
    });
};





exports.getRegisteredFarmerPaymentsByOfficer = (collectionOfficerId, date) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id 
            FROM registeredfarmerpayments
            WHERE collectionOfficerId = ? 
            AND DATE(createdAt) = ?;
        `;
        const values = [collectionOfficerId, date];

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};


exports.getFarmerPaymentsCropsByRegisteredFarmerId = (registeredFarmerId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT c.varietyNameEnglish, fc.gradeAprice AS 'Grade A', fc.gradeBprice AS 'Grade B', fc.gradeCprice AS 'Grade C',
                   (fc.gradeAquan + fc.gradeBquan + fc.gradeCquan) AS totalQuantity, fc.gradeAquan, fc.gradeBquan, fc.gradeCquan
            FROM farmerpaymentscrops fc
            JOIN cropvariety c ON fc.cropId = c.id
            WHERE fc.registerFarmerId = ?;
        `;
        const values = [registeredFarmerId];

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};






exports.createCollectionOfficerCompany = (companyData, collectionOfficerId) => {
    return new Promise((resolve, reject) => {
        const sql =
            "INSERT INTO collectionofficercompanydetails (collectionOfficerId, companyNameEnglish, companyNameSinhala, companyNameTamil, jobRole, IRMname, companyEmail, assignedDistrict, employeeType, empId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        db.query(
            sql,
            [
                collectionOfficerId,
                companyData.companyNameEnglish,
                companyData.companyNameSinhala,
                companyData.companyNameTamil,
                companyData.jobRole,
                companyData.IRMname,
                companyData.companyEmail,
                companyData.assignedDistrict,
                companyData.employeeType,
                companyData.empId

            ], (err, results) => {
                if (err) {
                    return reject(err); // Reject promise if an error occurs
                }
                resolve(results); // Resolve the promise with the query results
            });
    });
};

exports.createCollectionOfficerBank = (bankData, collectionOfficerId) => {
    return new Promise((resolve, reject) => {
        const sql =
            "INSERT INTO collectionofficerbankdetails (collectionOfficerId, accHolderName, accNumber, bankName, branchName) VALUES (?, ?, ?, ?, ?)";

        db.query(
            sql,
            [
                collectionOfficerId,
                bankData.accHolderName,
                bankData.accNumber,
                bankData.bankName,
                bankData.branchName,
            ], (err, results) => {
                if (err) {
                    return reject(err); // Reject promise if an error occurs
                }
                resolve(results); // Resolve the promise with the query results
            });
    });
};


exports.getCollectionOfficerProvinceReports = (province) => {
    return new Promise((resolve, reject) => {

        const sql = `
            SELECT cg.cropNameEnglish AS cropName,
             c.province, 
             SUM(fpc.gradeAquan) AS qtyA, 
             SUM(fpc.gradeBquan) AS qtyB, 
             SUM(fpc.gradeCquan) AS qtyC, 
             SUM(fpc.gradeAprice) AS priceA, 
             SUM(fpc.gradeBprice) AS priceB, 
             SUM(fpc.gradeCprice) AS priceC
            FROM registeredfarmerpayments rp, collectionofficer c, cropvariety cv , cropgroup cg, farmerpaymentscrops fpc
            WHERE rp.id = fpc.registerFarmerId AND rp.collectionOfficerId = c.id AND fpc.cropId = cv.id AND cv.cropGroupId = cg.id AND c.province = ?
            GROUP BY cg.cropNameEnglish, c.province
        `;
        db.query(sql, [province], (err, results) => {
            if (err) {
                return reject(err); 
            }
            resolve(results);
        });
    });
};



exports.getAllCompanyNamesDao = (district) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, companyNameEnglish
            FROM collectionofficercompanydetails
        `;
        db.query(sql, [district], (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }
            resolve(results); // Resolve the promise with the query results
        });
    });
};



exports.getCollectionOfficerEmailDao = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT c.email, c.firstNameEnglish, ccd.empId AS empId
            FROM collectionofficer c
            LEFT JOIN collectionofficercompanydetails ccd ON c.id = ccd.collectionOfficerId
            WHERE c.id = ?
        `;
        db.query(sql, [id], (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }
            if (results.length > 0) {
                resolve({
                    email: results[0].email, // Resolve with email
                    firstNameEnglish: results[0].firstNameEnglish,
                    empId: results[0].empId, // Resolve with employeeType (empId)
                });
            } else {
                resolve(null); // Resolve with null if no record is found
            }
        });
    });
};


exports.SendGeneratedPasswordDao = async (email, password, empId, firstNameEnglish) => {
    try {
        
        const doc = new PDFDocument();

        const pdfPath = `./uploads/register_details_${empId}.pdf`;

        doc.pipe(fs.createWriteStream(pdfPath));

        const watermarkPath = './assets/bg.png';
        doc.opacity(0.2) 
           .image(watermarkPath, 100, 300, { width: 400 }) 
           .opacity(1);

        doc.fontSize(20)
           .fillColor('#071a51')
           .text('Welcome to AgroWorld (Pvt) Ltd - Registration Confirmation', {
               align: 'center',
           });
        
        doc.moveDown();

        const lineY = doc.y; 

        doc.moveTo(50, lineY)
        .lineTo(550, lineY)
        .stroke();

        doc.moveDown();

        doc.fontSize(12).text(`Dear ${firstNameEnglish},`);

        doc.moveDown();

        doc.fontSize(12).text('Thank you for registering with us! We are excited to have you on board.');

        doc.moveDown();

        doc.fontSize(12)
        .text(
            'You have successfully created an account with AgroWorld (Pvt) Ltd. Our platform will help you with all your agricultural needs, providing guidance, weather reports, asset management tools, and much more. We are committed to helping farmers like you grow and succeed.',
            {
                align: 'justify',
            }
        );

        doc.moveDown();

        doc.fontSize(12).text(`Your User Name/ID: ${empId}`);
        doc.fontSize(12).text(`Your Password: ${password}`);

        doc.moveDown();

        doc.fontSize(12)
        .text(
            'If you have any questions or need assistance, feel free to reach out to our support team at info@agroworld.lk',
            {
                align: 'justify',
            }
        );

        doc.moveDown();
        
        doc.fontSize(12)
        .text(
            'We are here to support you every step of the way!',
            {
                align: 'justify',
            }
        );

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

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,  // or 587 for TLS
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                family: 4,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to AgroWorld (Pvt) Ltd - Registration Confirmation',
            text: `Dear ${firstNameEnglish},\n\nYour registration details are attached in the PDF.`,
            attachments: [
                {
                    filename: `password_${empId}.pdf`,  // PDF file name
                    path: pdfPath,  // Path to the generated PDF
                },
            ],
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);

        return { success: true, message: 'Email sent successfully!' };

    } catch (error) {
        console.error('Error sending email:', error);
        
        return { success: false, message: 'Failed to send email.', error };
    }
};

exports.UpdateCollectionOfficerStatusAndPasswordDao = (params) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE collectionofficer
            SET status = ?, password = ?
            WHERE id = ?
        `;
        db.query(sql, [params.status, params.password, parseInt(params.id)], (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }
            resolve(results); // Resolve with the query results
        });
    });
};




exports.UpdateCollectionOfiicerStatusDao = (params) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE collectionofficer
            SET status = ?
            WHERE id = ?
        `;
        db.query(sql, [params.status, parseInt(params.id)], (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }
            resolve(results); // Resolve the promise with the query results
        });
    });
};



exports.DeleteCollectionOfficerDao = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            DELETE FROM collectionofficer
            WHERE id = ?
        `;
        db.query(sql, [parseInt(id)], (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }
            resolve(results); // Resolve the promise with the query results
        });
    });
};







exports.getOfficerById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                co.*, 
                cocd.companyNameEnglish, cocd.companyNameSinhala, cocd.companyNameTamil,
                cocd.jobRole, cocd.empId, cocd.IRMname, cocd.companyEmail, cocd.assignedDistrict, cocd.employeeType,
                cobd.accHolderName, cobd.accNumber, cobd.bankName, cobd.branchName
            FROM 
                collectionofficer co
            LEFT JOIN 
                collectionofficercompanydetails cocd ON co.id = cocd.collectionOfficerId
            LEFT JOIN 
                collectionofficerbankdetails cobd ON co.id = cobd.collectionOfficerId
            WHERE 
                co.id = ?`;

        db.query(sql, [id], (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }

            if (results.length === 0) {
                return resolve(null); // No officer found
            }

            const officer = results[0];

            // Process image field if present
            if (officer.image) {
                const base64Image = Buffer.from(officer.image).toString("base64");
                officer.image = `data:image/png;base64,${base64Image}`;
            }

            // Process QRcode field if present
            if (officer.QRcode) {
                const base64QRcode = Buffer.from(officer.QRcode).toString("base64");
                officer.QRcode = `data:image/png;base64,${base64QRcode}`;
            }

            // Remove the first 3 characters from empId if it exists
            const empIdWithoutPrefix = officer.empId ? officer.empId.substring(3) : null;

            resolve({
                collectionOfficer: {
                    id: officer.id,
                    centerId: officer.centerId,
                    firstNameEnglish: officer.firstNameEnglish,
                    firstNameSinhala: officer.firstNameSinhala,
                    firstNameTamil: officer.firstNameTamil,
                    lastNameEnglish: officer.lastNameEnglish,
                    lastNameSinhala: officer.lastNameSinhala,
                    lastNameTamil: officer.lastNameTamil,
                    phoneNumber01: officer.phoneNumber01,
                    phoneNumber02: officer.phoneNumber02,
                    image: officer.image,
                    QRcode: officer.QRcode,
                    nic: officer.nic,
                    email: officer.email,
                    passwordUpdated: officer.passwordUpdated,
                    address: {
                        houseNumber: officer.houseNumber,
                        streetName: officer.streetName,
                        city: officer.city,
                        district: officer.district,
                        province: officer.province,
                        country: officer.country,
                    },
                    languages: officer.languages,
                },
                companyDetails: {
                    companyNameEnglish: officer.companyNameEnglish,
                    companyNameSinhala: officer.companyNameSinhala,
                    companyNameTamil: officer.companyNameTamil,
                    jobRole: officer.jobRole,
                    empId: empIdWithoutPrefix, // Updated to exclude first 3 characters
                    IRMname: officer.IRMname,
                    companyEmail: officer.companyEmail,
                    assignedDistrict: officer.assignedDistrict,
                    employeeType: officer.employeeType,
                },
                bankDetails: {
                    accHolderName: officer.accHolderName,
                    accNumber: officer.accNumber,
                    bankName: officer.bankName,
                    branchName: officer.branchName,
                },
            });
        });
    });
};




exports.updateOfficerDetails = (id, 
    centerId,
        firstNameEnglish,
        lastNameEnglish,
        firstNameSinhala,
        lastNameSinhala,
        firstNameTamil,
        lastNameTamil,
        nic,
        email,
        houseNumber,
        streetName,
        city,
        district,
        province,
        country,
        companyNameEnglish,
        companyNameSinhala,
        companyNameTamil,
        IRMname,
        companyEmail,
        assignedDistrict,
        employeeType,
        accHolderName,
        accNumber,
        bankName,
        branchName,
        jobRole,
        empId
) => {
    return new Promise((resolve, reject) => {
       

        db.beginTransaction((err) => {
            if (err) return reject(err);

            const updateOfficerSQL = `
                UPDATE collectionofficer
                SET centerId = ?, firstNameEnglish = ?, lastNameEnglish = ?, firstNameSinhala = ?, lastNameSinhala = ?,
                    firstNameTamil = ?, lastNameTamil = ?, nic = ?, email = ?, houseNumber = ?, streetName = ?, city = ?,
                    district = ?, province = ?, country = ? , status = 'Not Approved'
                WHERE id = ?
            `;

            const updateOfficerParams = [
                centerId,
                firstNameEnglish,
                lastNameEnglish,
                firstNameSinhala,
                lastNameSinhala,
                firstNameTamil,
                lastNameTamil,
                nic,
                email,
                houseNumber,
                streetName,
                city,
                district,
                province,
                country,
                id,
            ];

            const updateBankDetailsSQL = `
                UPDATE collectionofficerbankdetails
                SET accHolderName = ?, accNumber = ?, bankName = ?, branchName = ?
                WHERE collectionOfficerId = ?
            `;

            const updateBankDetailsParams = [
                accHolderName,
                accNumber,
                bankName,
                branchName,
                id,
            ];

            let updateCompanyDetailsSQL = `
                UPDATE collectionofficercompanydetails
                SET companyNameEnglish = ?, companyNameSinhala = ?, companyNameTamil = ?, IRMname = ?, 
                    companyEmail = ?, assignedDistrict = ?, employeeType = ? , 
            `;

            const updateCompanyDetailsParams = [
                companyNameEnglish,
                companyNameSinhala,
                companyNameTamil,
                IRMname,
                companyEmail,
                assignedDistrict,
                employeeType,
            ];

            if(empId){
                updateCompanyDetailsSQL += ` jobRole = ?, empId = ? `
                updateCompanyDetailsParams.push(jobRole)
                updateCompanyDetailsParams.push(empId)
            }

            updateCompanyDetailsSQL += ` WHERE collectionOfficerId = ? `
            updateCompanyDetailsParams.push(id)


            

            db.query(updateOfficerSQL, updateOfficerParams, (err, result) => {
                if (err) {
                    return db.rollback(() => reject(err));
                }

                db.query(updateBankDetailsSQL, updateBankDetailsParams, (err, result) => {
                    if (err) {
                        return db.rollback(() => reject(err));
                    }

                    db.query(updateCompanyDetailsSQL, updateCompanyDetailsParams, (err, result) => {
                        if (err) {
                            return db.rollback(() => reject(err));
                        }

                        db.commit((err) => {
                            if (err) return db.rollback(() => reject(err));
                            resolve(result);
                        });
                    });
                });
            });
        });
    });
};




exports.getOfficerByIdMonthly = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                co.*, 
                cocd.companyNameEnglish, cocd.companyNameSinhala, cocd.companyNameTamil,
                cocd.jobRole, cocd.IRMname, cocd.companyEmail, cocd.assignedDistrict, cocd.employeeType, cocd.empId,
                cobd.accHolderName, cobd.accNumber, cobd.bankName, cobd.branchName
            FROM 
                collectionofficer co
            LEFT JOIN 
                collectionofficercompanydetails cocd ON co.id = cocd.collectionOfficerId
            LEFT JOIN 
                collectionofficerbankdetails cobd ON co.id = cobd.collectionOfficerId
            WHERE 
                co.id = ?`;

        db.query(sql, [id], (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }

            if (results.length === 0) {
                return resolve(null); // No officer found
            }

            const officer = results[0];

            // Process image field if present
            if (officer.image) {
                const base64Image = Buffer.from(officer.image).toString("base64");
                officer.image = `data:image/png;base64,${base64Image}`;
            }

            // Process QRcode field if present
            if (officer.QRcode) {
                const base64QRcode = Buffer.from(officer.QRcode).toString("base64");
                officer.QRcode = `data:image/png;base64,${base64QRcode}`;
            }

            resolve({
                collectionOfficer: {
                    id: officer.id,
                    centerId: officer.centerId,
                    firstNameEnglish: officer.firstNameEnglish,
                    firstNameSinhala: officer.firstNameSinhala,
                    firstNameTamil: officer.firstNameTamil,
                    lastNameEnglish: officer.lastNameEnglish,
                    lastNameSinhala: officer.lastNameSinhala,
                    lastNameTamil: officer.lastNameTamil,
                    phoneNumber01: officer.phoneNumber01,
                    phoneNumber02: officer.phoneNumber02,
                    image: officer.image,
                    QRcode: officer.QRcode,
                    nic: officer.nic,
                    email: officer.email,
                    passwordUpdated: officer.passwordUpdated,
                    address: {
                        houseNumber: officer.houseNumber,
                        streetName: officer.streetName,
                        city: officer.city,
                        district: officer.district,
                        province: officer.province,
                        country: officer.country,
                    },
                    languages: officer.languages,
                },
                companyDetails: {
                    companyNameEnglish: officer.companyNameEnglish,
                    companyNameSinhala: officer.companyNameSinhala,
                    companyNameTamil: officer.companyNameTamil,
                    jobRole: officer.jobRole,
                    IRMname: officer.IRMname,
                    companyEmail: officer.companyEmail,
                    assignedDistrict: officer.assignedDistrict,
                    employeeType: officer.employeeType,
                    employeeId: officer.empId,
                },
                bankDetails: {
                    accHolderName: officer.accHolderName,
                    accNumber: officer.accNumber,
                    bankName: officer.bankName,
                    branchName: officer.branchName,
                },
            });
        });
    });
};





// DAO function to fetch the daily report
exports.getDailyReport = (collectionOfficerId, fromDate, toDate) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          DATE(rfp.createdAt) AS date,
          COUNT(DISTINCT rfp.id) AS totalPayments,
          SUM(IFNULL(fpc.gradeAquan, 0) + IFNULL(fpc.gradeBquan, 0) + IFNULL(fpc.gradeCquan, 0)) AS totalWeight
        FROM 
          registeredfarmerpayments rfp
        LEFT JOIN 
          farmerpaymentscrops fpc ON rfp.id = fpc.registerFarmerId
        WHERE 
          rfp.collectionOfficerId = ? 
          AND rfp.createdAt BETWEEN ? AND ?
        GROUP BY 
          DATE(rfp.createdAt)
        ORDER BY 
          date ASC;
      `;
      
      // Parameters: collectionOfficerId, fromDate, toDate
      const params = [collectionOfficerId, fromDate, toDate];
  
      db.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        
        // Format results as needed
        const reportData = results.map(row => ({
          date: row.date,
          totalPayments: row.totalPayments,
          totalWeight: row.totalWeight ? parseFloat(row.totalWeight) : 0,
        }));
  
        resolve(reportData);
      });
    });
  };
  