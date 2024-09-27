const db = require("../startup/database");

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

exports.createCollectionOfficer = (officerData) => {
    return new Promise((resolve, reject) => {
        const sql =
            "INSERT INTO collectionofficer (firstName, lastName, phoneNumber01, phoneNumber02, image, nic, email, houseNumber, streetName, district, province, country, languages) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        db.query(sql, officerData, (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }
            resolve(results); // Resolve the promise with the query results
        });
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
                collectionofficer.firstName, 
                collectionofficer.lastName, 
                collectionofficercompanydetails.companyName,
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