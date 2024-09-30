const db = require("../startup/database");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const { Upload } = require("@aws-sdk/lib-storage");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

exports.loginAdmin = (email) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM adminUsers WHERE mail = ?";
        db.query(sql, [email], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getAllAdminUsers = (limit, offset) => {
    return new Promise((resolve, reject) => {
        const countSql = "SELECT COUNT(*) as total FROM adminUsers";
        const dataSql = "SELECT * FROM adminUsers ORDER BY created_at DESC LIMIT ? OFFSET ?";

        db.query(countSql, (countErr, countResults) => {
            if (countErr) {
                reject(countErr);
            } else {
                db.query(dataSql, [limit, offset], (dataErr, dataResults) => {
                    if (dataErr) {
                        reject(dataErr);
                    } else {
                        resolve({
                            total: countResults[0].total,
                            items: dataResults
                        });
                    }
                });
            }
        });
    });
};

exports.adminCreateUser = (firstName, lastName, phoneNumber, NICnumber) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO users (`firstName`, `lastName`, `phoneNumber`, `NICnumber`) VALUES (?)";
        const values = [firstName, lastName, phoneNumber, NICnumber];

        db.query(sql, [values], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getAllUsers = (limit, offset, searchNIC) => {
    return new Promise((resolve, reject) => {
        let countSql = "SELECT COUNT(*) as total FROM users";
        let dataSql = `SELECT * FROM users`;
        const params = [];

        if (searchNIC) {
            countSql += " WHERE users.NICnumber LIKE ?";
            dataSql += " WHERE users.NICnumber LIKE ?";
            params.push(`%${searchNIC}%`);
        }
        dataSql += " ORDER BY created_at DESC";
        dataSql += " LIMIT ? OFFSET ?";
        params.push(limit, offset);

        db.query(countSql, params, (countErr, countResults) => {
            if (countErr) {
                reject(countErr);
            } else {
                const total = countResults[0].total;

                db.query(dataSql, params, (dataErr, dataResults) => {
                    if (dataErr) {
                        reject(dataErr);
                    } else {
                        resolve({
                            total: total,
                            items: dataResults
                        });
                    }
                });
            }
        });
    });
};


exports.createCropCallender = async (
            cropName,
            sinhalaCropName,
            tamilCropName,
            variety,
            sinhalaVariety,
            tamilVariety,
            cultivationMethod,
            natureOfCultivation,
            cropDuration,
            cropCategory,
            specialNotes,
            sinhalaSpecialNotes,
            tamilSpecialNotes,
            suitableAreas,
            cropColor,
            imagePath
) => {
    return new Promise((resolve, reject) => {
        const sql =
            "INSERT INTO cropCalender (cropName, sinhalaCropName, tamilCropName, variety, sinhalaVariety, tamilVariety, cultivationMethod, natureOfCultivation, cropDuration,Category, specialNotes, sinhalaSpecialNotes, tamilSpecialNotes, suitableAreas,cropColor,image) VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?)";
        const values = [
            cropName,
            sinhalaCropName,
            tamilCropName,
            variety,
            sinhalaVariety,
            tamilVariety,
            cultivationMethod,
            natureOfCultivation,
            cropDuration,
            cropCategory,
            specialNotes,
            sinhalaSpecialNotes,
            tamilSpecialNotes,
            suitableAreas,
            cropColor,
            imagePath
        ];

        db.query(sql, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.insertId);
            }
        });
    });
};

exports.insertXLSXData = (cropId, data) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO cropcalendardays 
            (cropId, taskIndex, days, taskTypeEnglish, taskTypeSinhala, taskTypeTamil, 
            taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil, 
            taskEnglish, taskSinhala, taskTamil, 
            taskDescriptionEnglish, taskDescriptionSinhala, taskDescriptionTamil) 
            VALUES ?`;

        const values = data.map((row) => [
            cropId,
            row["Task index"],
            row.Day,
            row["Task type (English)"],
            row["Task type (Sinhala)"],
            row["Task type (Tamil)"],
            row["Task Category (English)"],
            row["Task Category (Sinhala)"],
            row["Task Category (Tamil)"],
            row["Task (English)"],
            row["Task (Sinhala)"],
            row["Task (Tamil)"],
            row["Task description (English)"],
            row["Task description (Sinhala)"],
            row["Task description (Tamil)"],
        ]);

        db.query(sql, [values], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
};

exports.getAllCropCalendars = (limit, offset) => {
    return new Promise((resolve, reject) => {
        const countSql = "SELECT COUNT(*) as total FROM cropCalender";
        const dataSql = "SELECT * FROM cropCalender ORDER BY createdAt DESC LIMIT ? OFFSET ?";

        db.query(countSql, (countErr, countResults) => {
            if (countErr) {
                reject(countErr);
            } else {
                db.query(dataSql, [limit, offset], (dataErr, dataResults) => {
                    if (dataErr) {
                        reject(dataErr);
                    } else {
                        resolve({
                            total: countResults[0].total,
                            items: dataResults
                        });
                    }
                });
            }
        });
    });
};

exports.createOngoingCultivations = (userId, cropCalenderId) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO ongoingCultivations (`userId`, `cropCalenderId`) VALUES (?)";
        const values = [userId, cropCalenderId];

        db.query(sql, [values], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.createNews = async (
    titleEnglish,
    titleSinhala,
    titleTamil,
    descriptionEnglish,
    descriptionSinhala,
    descriptionTamil,
    imagePath,
    status,
    createdBy
) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO content (titleEnglish, titleSinhala, titleTamil, descriptionEnglish, descriptionSinhala, descriptionTamil, image, status, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [
            titleEnglish,
            titleSinhala,
            titleTamil,
            descriptionEnglish,
            descriptionSinhala,
            descriptionTamil,
            imagePath,
            status,
            createdBy
        ];

        db.query(sql, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.insertId);
            }
        });
    });
};


exports.getAllNews = async (status, createdAt, limit, offset) => {
    return new Promise((resolve, reject) => {
        let countsSql = "SELECT COUNT(*) as total FROM content";
        let dataSql = "SELECT * FROM content";
        let whereClauses = [];
        let queryParams = [];

        if (status) {
            whereClauses.push("status = ?");
            queryParams.push(status);
        }

        if (createdAt) {
            whereClauses.push("DATE(createdAt) = ?");
            queryParams.push(createdAt);
        }

        if (whereClauses.length > 0) {
            const whereClause = " WHERE " + whereClauses.join(" AND ");
            countsSql += whereClause;
            dataSql += whereClause;
        }

        dataSql += " ORDER BY createdAt DESC";
        dataSql += " LIMIT ? OFFSET ?";
        queryParams.push(limit, offset);

        console.log('Executing count query:', countsSql, 'with params:', queryParams.slice(0, -2));
        db.query(countsSql, queryParams.slice(0, -2), (countErr, countResults) => {
            if (countErr) {
                console.error('Error in count query:', countErr);
                reject(countErr);
                return;
            }

            const total = countResults[0].total;
            console.log('Total count:', total);

            if (total === 0) {
                resolve({ items: [], total: 0 });
                return;
            }

            console.log('Executing data query:', dataSql, 'with params:', queryParams);
            db.query(dataSql, queryParams, (dataErr, dataResults) => {
                if (dataErr) {
                    console.error('Error in data query:', dataErr);
                    reject(dataErr);
                    return;
                }
                console.log('Data query results:', dataResults.length);
                resolve({ items: dataResults, total: total });
            });
        });
    });
};

exports.deleteCropCalender = async (id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM cropcalender WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.affectedRows);
            }
        });
    });
};

exports.editCropCalender = async (id, updateData, imagePath) => {
    return new Promise((resolve, reject) => {
        let sql = `
            UPDATE cropcalender 
            SET 
                cropName = ?, 
                variety = ?, 
                CultivationMethod = ?, 
                NatureOfCultivation = ?, 
                CropDuration = ?, 
                SpecialNotes = ?,
                SuitableAreas = ?,
                cropColor = ?
        `;

        let values = [
            updateData.cropName,
            updateData.variety,
            updateData.CultivationMethod,
            updateData.NatureOfCultivation,
            updateData.CropDuration,
            updateData.SpecialNotes,
            updateData.SuitableAreas,
            updateData.cropColor
        ];

        if (imagePath) {
            sql += `, image = ?`;
            values.push(imagePath);
        }

        sql += ` WHERE id = ?`;
        values.push(id);

        db.query(sql, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.affectedRows);
            }
        });
    });
};

exports.createCropCalenderTasks = async (cropId, tasks) => {
    return new Promise((resolve, reject) => {
        const sql =
            "INSERT INTO cropcalenderdays (cropId, task, description, daysnum) VALUES ?";

        const values = tasks.map((task) => [
            cropId,
            task.title, // Adjust as needed based on task object structure
            task.description,
            task.daysnum,
        ]);

        db.query(sql, [values], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getNewsById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM content WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getCropCalenderById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM cropcalender WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getNewsStatusById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT status FROM content WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.updateNewsStatusById = (id, status) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE content SET status = ? WHERE id = ?";
        db.query(sql, [status, id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};


exports.createMarketPrice = (
    titleEnglish,
    titleSinhala,
    titleTamil,
    descriptionEnglish,
    descriptionSinhala,
    descriptionTamil,
    imagePath,
    status,
    price,
    createdBy
) => {
    return new Promise((resolve, reject) => {
        const sql =
            "INSERT INTO marketprice (titleEnglish, titleSinhala, titleTamil, descriptionEnglish, descriptionSinhala, descriptionTamil, image, status, price, createdBy) VALUES (?,?,?,?,?,?,?,?,?,?)";
        const values = [
            titleEnglish,
            titleSinhala,
            titleTamil,
            descriptionEnglish,
            descriptionSinhala,
            descriptionTamil,
            imagePath,
            status,
            price,
            createdBy,
        ];

        db.query(sql, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.insertId);
            }
        });
    });
};


exports.getAllMarketPrice = (status, createdAt, limit, offset) => {
    return new Promise((resolve, reject) => {
        let countsSql = "SELECT COUNT(*) as total FROM marketprice";
        let dataSql = "SELECT * FROM marketprice";
        let whereClauses = [];
        let queryParams = [];

        if (status) {
            whereClauses.push("status = ?");
            queryParams.push(status);
        }

        if (createdAt) {
            whereClauses.push("DATE(createdAt) = ?");
            queryParams.push(createdAt);
        }

        if (whereClauses.length > 0) {
            const whereClause = " WHERE " + whereClauses.join(" AND ");
            countsSql += whereClause;
            dataSql += whereClause;
        }

        dataSql += " ORDER BY createdAt DESC";
        dataSql += " LIMIT ? OFFSET ?";
        queryParams.push(limit, offset);

        db.query(countsSql, queryParams.slice(0, -2), (countErr, countResults) => {
            if (countErr) {
                return reject(countErr);
            }

            const total = countResults[0].total;

            db.query(dataSql, queryParams, (dataErr, dataResults) => {
                if (dataErr) {
                    return reject(dataErr);
                }

                resolve({ total, dataResults });
            });
        });
    });
};

exports.deleteMarketPriceById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM marketprice WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};


exports.getMarketPriceStatusById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT status FROM marketprice WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

exports.updateMarketPriceStatusById = (id, newStatus) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE marketprice SET status = ? WHERE id = ?";
        db.query(sql, [newStatus, id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

exports.getMarketPriceById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM marketprice WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

exports.editMarketPrice = (id, data) => {
    return new Promise((resolve, reject) => {
        let sql = `
            UPDATE marketprice 
            SET 
                titleEnglish = ?, 
                titleSinhala = ?, 
                titleTamil = ?, 
                descriptionEnglish = ?, 
                descriptionSinhala = ?, 
                descriptionTamil = ?,
                price = ?
        `;
        let values = [
            data.titleEnglish,
            data.titleSinhala,
            data.titleTamil,
            data.descriptionEnglish,
            data.descriptionSinhala,
            data.descriptionTamil,
            data.price,
        ];

        if (data.imagePath) {
            sql += `, image = ?`;
            values.push(data.imagePath);
        }

        sql += ` WHERE id = ?`;
        values.push(id);

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};


exports.getAllOngoingCultivations = (searchNIC, limit, offset) => {
    return new Promise((resolve, reject) => {
        let countSql = `
            SELECT COUNT(*) as total 
            FROM ongoingCultivations 
            JOIN users ON ongoingCultivations.userId = users.id
        `;
        let dataSql = `
            SELECT 
                ongoingCultivations.id AS cultivationId, 
                users.id,
                users.firstName, 
                users.lastName, 
                users.NICnumber 
            FROM 
                ongoingCultivations 
            JOIN 
                users ON ongoingCultivations.userId = users.id
        `;
        const params = [];

        if (searchNIC) {
            countSql += " WHERE users.NICnumber LIKE ?";
            dataSql += " WHERE users.NICnumber LIKE ?";
            params.push(`%${searchNIC}%`);
        }

        dataSql += " ORDER BY ongoingCultivations.createdAt DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        // Fetch total count
        db.query(countSql, params.slice(0, -2), (countErr, countResults) => {
            if (countErr) {
                return reject(countErr);
            }

            const total = countResults[0].total;

            // Fetch paginated data
            db.query(dataSql, params, (dataErr, dataResults) => {
                if (dataErr) {
                    return reject(dataErr);
                }
                resolve({ total, items: dataResults });
            });
        });
    });
};

exports.getOngoingCultivationsWithUserDetails = () => {
    const sql = `
        SELECT 
            ongoingCultivations.id AS cultivationId, 
            users.firstName, 
            users.lastName 
        FROM 
            ongoingCultivations 
        JOIN 
            users ON ongoingCultivations.userId = users.id;
    `;

    return new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
            if (err) {
                reject("Error fetching ongoing cultivations: " + err);
            } else {
                resolve(results);
            }
        });
    });
};


exports.getOngoingCultivationsById = (id) => {
    const sql = `
        SELECT 
            ongoingcultivationscrops.id AS ongoingcultivationscropsid, 
            ongoingCultivationId,
            cropCalendar,
            cropcalender.cropName,
            cropcalender.variety,
            cropcalender.CultivationMethod,
            cropcalender.NatureOfCultivation,
            cropcalender.CropDuration
        FROM 
            ongoingcultivationscrops
        JOIN 
            cropcalender ON ongoingcultivationscrops.cropCalendar = cropcalender.id
        WHERE
            ongoingCultivationId = ?`;

    return new Promise((resolve, reject) => {
        db.query(sql, [id], (err, results) => {
            if (err) {
                reject("Error fetching cultivation crops by ID: " + err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getFixedAssetsByCategory = (userId, category) => {
    const validCategories = {
        'Building and Infrastructures': `
            SELECT 
                fixedasset.id AS fixedassetId,
                fixedasset.category AS fixedassetcategory,
                buildingfixedasset.type,
                buildingfixedasset.floorArea,
                buildingfixedasset.ownership,
                buildingfixedasset.generalCondition,
                buildingfixedasset.district
            FROM 
                fixedasset
            JOIN 
                buildingfixedasset ON fixedasset.id = buildingfixedasset.fixedAssetId
            WHERE 
                fixedasset.userId = ?;
        `,
        'Land': `
            SELECT 
                fixedasset.id AS fixedassetId,
                fixedasset.category AS fixedassetcategory,
                landfixedasset.extentha,
                landfixedasset.extentac,
                landfixedasset.extentp,
                landfixedasset.ownership,
                landfixedasset.district,
                landfixedasset.perennialCrop
            FROM 
                fixedasset
            JOIN 
                landfixedasset ON fixedasset.id = landfixedasset.fixedAssetId
            WHERE 
                fixedasset.userId = ?;
        `,
        'Machinery and Vehicles': `
            SELECT
                fixedasset.id AS fixedassetId,
                fixedasset.category AS fixedassetcategory,
                machtoolsfixedasset.asset,
                machtoolsfixedasset.assetType,
                machtoolsfixedasset.mentionOther,
                machtoolsfixedasset.numberOfUnits,
                machtoolsfixedasset.unitPrice,
                machtoolsfixedasset.totalPrice,
                machtoolsfixedasset.warranty,
                COALESCE(machtoolsfixedassetwarranty.warrantystatus, 'No data') AS warrantystatus
            FROM
                fixedasset
            JOIN
                machtoolsfixedasset ON fixedasset.id = machtoolsfixedasset.fixedAssetId
            LEFT JOIN
                machtoolsfixedassetwarranty ON machtoolsfixedasset.id = machtoolsfixedassetwarranty.machToolsId
            WHERE 
                fixedasset.userId = ?;
        `,
        'Tools and Equipments': `
            SELECT
                fixedasset.id AS fixedassetId,
                fixedasset.category AS fixedassetcategory,
                machtoolsfixedasset.asset,
                machtoolsfixedasset.assetType,
                machtoolsfixedasset.mentionOther,
                machtoolsfixedasset.numberOfUnits,
                machtoolsfixedasset.unitPrice,
                machtoolsfixedasset.totalPrice,
                machtoolsfixedasset.warranty,
                COALESCE(machtoolsfixedassetwarranty.warrantystatus, 'No data') AS warrantystatus
            FROM
                fixedasset
            JOIN
                machtoolsfixedasset ON fixedasset.id = machtoolsfixedasset.fixedAssetId
            LEFT JOIN
                machtoolsfixedassetwarranty ON machtoolsfixedasset.id = machtoolsfixedassetwarranty.machToolsId
            WHERE 
                fixedasset.userId = ?;
        `
    };

    const sql = validCategories[category];

    if (!sql) {
        return Promise.reject("Invalid category.");
    }

    return new Promise((resolve, reject) => {
        db.query(sql, [userId], (err, results) => {
            if (err) {
                reject("Error fetching assets: " + err);
            } else {
                resolve(results);
            }
        });
    });
};


exports.getCurrentAssetsByCategory = (userId, category) => {
    const sql = `SELECT * FROM currentasset WHERE userId = ? AND category = ?`;
    const values = [userId, category];

    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
            if (err) {
                reject("Error fetching current assets: " + err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.deleteAdminUserById = (id) => {
    const sql = "DELETE FROM adminusers WHERE id = ?";
    
    return new Promise((resolve, reject) => {
        db.query(sql, [id], (err, results) => {
            if (err) {
                reject("Error executing delete query: " + err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.updateAdminUserById = (id, mail, userName, role) => {
    const sql = `
        UPDATE adminusers 
        SET 
            mail = ?, 
            userName = ?, 
            role = ? 
        WHERE id = ?`;

    return new Promise((resolve, reject) => {
        db.query(sql, [mail, userName, role, id], (err, results) => {
            if (err) {
                reject("Error executing update query: " + err);
            } else {
                resolve(results);
            }
        });
    });
};


exports.updateAdminUser = (id, mail, userName, role) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE adminusers 
            SET 
                mail = ?, 
                userName = ?, 
                role = ?
            WHERE id = ?
        `;

        const values = [mail, userName, role, id];

        db.query(sql, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};


exports.getAdminUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM adminusers WHERE id = ?";

        db.query(sql, [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.getAdminPasswordById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT password FROM adminusers WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Update the password for a given admin user
exports.updateAdminPasswordById = (id, newPassword) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE adminusers SET password = ? WHERE id = ?";
        db.query(sql, [newPassword, id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.deletePlantCareUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM users WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};



exports.updatePlantCareUserById = (userData, id) => {
    return new Promise((resolve, reject) => {
        const { firstName, lastName, phoneNumber, NICnumber, imagePath } = userData;

        let sql = `
            UPDATE users 
            SET 
                firstName = ?, 
                lastName = ?, 
                phoneNumber = ?, 
                NICnumber = ?
        `;
        let values = [firstName, lastName, phoneNumber, NICnumber];

        if (imagePath) {
            sql += `, profileImage = ?`;
            values.push(imagePath);
        }

        sql += ` WHERE id = ?`;
        values.push(id);

        db.query(sql, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};


exports.createPlantCareUser = (userData) => {
    return new Promise((resolve, reject) => {
        const { firstName, lastName, phoneNumber, NICnumber, imagePath } = userData;

        const sql = `
            INSERT INTO users (firstName, lastName, phoneNumber, NICnumber, profileImage) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [firstName, lastName, phoneNumber, NICnumber, imagePath];

        db.query(sql, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.insertId); // Return the newly created user ID
            }
        });
    });
};

exports.getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE id = ?";
        db.query(sql, [userId], (err, results) => {
            if (err) {
                return reject(err);
            } 
            if (results.length === 0) {
                return resolve(null); // No user found
            }
            resolve(results[0]); // Return the first result
        });
    });
};

exports.createAdmin = (adminData) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO adminusers (mail, role, userName, password) 
            VALUES (?, ?, ?, ?)
        `;
        const values = [adminData.mail, adminData.role, adminData.userName, adminData.password];

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err); // Pass the error back if it occurs
            }
            resolve(results); // Resolve with the results
        });
    });
};

exports.getCurrentAssetGroup = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT category, SUM(total) as totPrice 
            FROM currentasset 
            WHERE userId = ? 
            GROUP BY category
        `;
        const values = [userId];

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err); // Reject promise on error
            }
            resolve(results); // Resolve promise with the query results
        });
    });
};


exports.getCurrentAssetRecordById = (currentAssetId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, currentAssetId, 
                   COALESCE(numOfPlusUnit, 0) AS numOfPlusUnit, 
                   COALESCE(numOfMinUnit, 0) AS numOfMinUnit, 
                   totalPrice, createdAt  
            FROM currentassetrecord 
            WHERE currentAssetId = ?
        `;
        const values = [currentAssetId];

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }
            resolve(results); // Resolve the promise with the query results
        });
    });
};


exports.getAllTaskByCropId = (cropId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT * 
            FROM cropCalender cc 
            JOIN cropcalendardays cd ON cc.id = cd.cropId 
            WHERE cc.id = ?
        `;
        const values = [cropId];

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }
            resolve(results); // Resolve the promise with the query results
        });
    });
};

exports.deleteCropTask = (taskId) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM cropcalendardays WHERE id = ?";
        const values = [taskId];

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }
            resolve(results); // Resolve the promise with the query results
        });
    });
};

exports.getCropCalendarDayById = (taskId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM cropcalendardays WHERE id = ?";
        const values = [taskId];

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }

            // Return null if no record is found
            if (results.length === 0) {
                return resolve(null);
            }

            resolve(results[0]); // Resolve the promise with the first result
        });
    });
};


exports.editTask = (taskEnglish, taskSinhala, taskTamil, taskTypeEnglish, taskTypeSinhala, taskTypeTamil, taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil, id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE cropcalendardays 
            SET taskEnglish=?, taskSinhala=?, taskTamil=?, taskTypeEnglish=?, taskTypeSinhala=?, taskTypeTamil=?, 
                taskCategoryEnglish=?, taskCategorySinhala=?, taskCategoryTamil=? 
            WHERE id = ?
        `;
        const values = [
            taskEnglish,
            taskSinhala,
            taskTamil,
            taskTypeEnglish,
            taskTypeSinhala,
            taskTypeTamil,
            taskCategoryEnglish,
            taskCategorySinhala,
            taskCategoryTamil,
            id
        ];

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err); // Reject the promise on error
            }

            resolve(results); // Resolve the promise with the results
        });
    });
};

exports.getAllUserTaskByCropId = (cropId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
    slavecropcalendardays.id AS slavecropcalendardaysId,
    slavecropcalendardays.cropCalendarId,
    slavecropcalendardays.taskIndex, 
    slavecropcalendardays.days, 
    slavecropcalendardays.taskEnglish,
    slavecropcalendardays.status
FROM 
    slavecropcalendardays
WHERE 
    slavecropcalendardays.cropCalendarId = ? 
    AND slavecropcalendardays.userId = ?;

        `;
        const values = [cropId, userId];

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }
            resolve(results); // Resolve the promise with the query results
        });
    });
};

exports.deleteUserTasks = (id) => {
    const sql = "DELETE FROM slavecropcalendardays WHERE id = ?";
    
    return new Promise((resolve, reject) => {
        db.query(sql, [id], (err, results) => {
            if (err) {
                reject("Error executing delete query: " + err);
            } else {
                resolve(results);
            }
        });
    });
};


exports.getUserTaskStatusById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT status FROM slavecropcalendardays WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

exports.updateUserTaskStatusById = (id, newStatus) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE slavecropcalendardays SET status = ? WHERE id = ?";
        db.query(sql, [newStatus, id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};



exports.getSlaveCropCalendarDayById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM slavecropcalendardays WHERE id = ?";
        const values = [id];

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err); // Reject promise if an error occurs
            }

            // Return null if no record is found
            if (results.length === 0) {
                return resolve(null);
            }

            resolve(results[0]); // Resolve the promise with the first result
        });
    });
};


//post reply
exports.getAllPostReplyDao = (postid) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT p.id, p.replyMessage, p.createdAt, u.firstName, u.lastName FROM publicforumreplies p ,users u WHERE p.replyId=u.id AND chatId = ?";
        const values = [postid];

        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err); 
            }

            
            if (results.length === 0) {
                return resolve(null);
            }

            resolve(results); 
        });
    });
};


exports.deleteReply = (id) => {
    const sql = "DELETE FROM publicforumreplies WHERE id = ?";
    
    return new Promise((resolve, reject) => {
        db.query(sql, [id], (err, results) => {
            if (err) {
                reject("Error executing delete query: " + err);
            } else {
                resolve(results);
            }
        });
    });
};