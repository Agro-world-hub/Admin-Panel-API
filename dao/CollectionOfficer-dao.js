const db = require("../startup/database");
const QRCode = require('qrcode');


exports.getCollectionOfficerDistrictReports = (district) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT rp.cropName, rp.quality, c.district, SUM(rp.total) AS totPrice, SUM(rp.weight) AS totWeight
            FROM registeredfarmerpayments rp, collectionofficer c
            WHERE rp.collectionOfficerId = c.id AND c.district = ?
            GROUP BY rp.cropName, rp.quality, c.district
        `;
        db.query(sql, [district], (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }
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
                    province, country, languages
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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


exports.getAllCollectionOfficers = (page, limit, searchNIC) => {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit;

        let countSql = "SELECT COUNT(*) as total FROM collectionofficer";
        let dataSql = `
            SELECT
                collectionofficer.id,
                collectionofficer.image,
                collectionofficer.firstNameEnglish, 
                collectionofficer.lastNameEnglish, 
                collectionofficercompanydetails.companyNameEnglish,
                collectionofficer.phoneNumber01,
                collectionofficer.nic,
                collectionofficer.district
            FROM 
                collectionofficer
            JOIN 
                collectionofficercompanydetails 
            ON 
                collectionofficer.id = collectionofficercompanydetails.collectionofficerId
        `;

        const params = [];

        if (searchNIC) {
            countSql += " WHERE collectionofficer.nic LIKE ?";
            dataSql += " WHERE collectionofficer.nic LIKE ?";
            params.push(`%${searchNIC}%`);
        }

        dataSql += " LIMIT ? OFFSET ?";
        params.push(limit, offset);

        // Execute count query
        db.query(countSql, params, (countErr, countResults) => {
            if (countErr) {
                return reject(countErr);
            }

            const total = countResults[0].total;

            // Execute data query
            db.query(dataSql, params, (dataErr, dataResults) => {
                if (dataErr) {
                    return reject(dataErr);
                }

                resolve({ items: dataResults, total });
            });
        });
    });
};


exports.getCollectionOfficerReports = (collectionOfficerId, date) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT cropName, quality, SUM(weight) AS totalQuantity
            FROM registeredfarmerpayments 
            WHERE collectionOfficerId = ? 
            AND DATE(createdAt) = ?
            GROUP BY cropName, quality
            ORDER BY cropName, quality;
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


exports.createCollectionOfficerCompany = (companyData, collectionOfficerId) => {
    return new Promise((resolve, reject) => {
        const sql =
            "INSERT INTO collectionofficercompanydetails (collectionOfficerId, companyNameEnglish, companyNameSinhala, companyNameTamil, jobRole, IRMname, companyEmail, assignedDistrict, employeeType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

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
            SELECT rp.cropName, rp.quality, c.province, SUM(rp.total) AS totPrice, SUM(rp.weight) AS totWeight
            FROM registeredfarmerpayments rp, collectionofficer c
            WHERE rp.collectionOfficerId = c.id AND c.province = ?
            GROUP BY rp.cropName, rp.quality, c.province
        `;
        db.query(sql, [province], (err, results) => {
            if (err) {
                return reject(err); 
            }
            resolve(results);
        });
    });
};