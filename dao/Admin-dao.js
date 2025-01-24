const {
  plantcare,
  collectionofficer,
  marketPlace,
  dash,
} = require("../startup/database");
const path = require("path");
const { Upload } = require("@aws-sdk/lib-storage");
const Joi = require("joi");

exports.loginAdmin = (email) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM adminusers WHERE mail = ?";
    plantcare.query(sql, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getAllAdminUsers = (limit, offset, role, search) => {
  return new Promise((resolve, reject) => {
    let countSql = `
      SELECT COUNT(DISTINCT AU.id) as total 
      FROM adminusers AU 
      JOIN adminroles AR ON AU.role = AR.id
    `;

    const dataParms = [];
    let dataSql = `
      SELECT AU.id, AU.mail, AU.userName, AR.role  
      FROM adminusers AU 
      JOIN adminroles AR ON AU.role = AR.id 
      WHERE 1=1
    `;

    if (role) {
      dataSql += ` AND AR.id = ? `;
      countSql += ` AND AR.id = ? `;
      dataParms.push(role);
    }

    if (search) {
      dataSql += ` AND (AU.mail LIKE ? OR AU.userName LIKE ?) `;
      countSql += ` AND (AU.mail LIKE ? OR AU.userName LIKE ?) `;
      dataParms.push(`%${search}%`, `%${search}%`);
    }

    dataSql += ` ORDER BY AU.created_at DESC LIMIT ? OFFSET ? `;
    dataParms.push(limit, offset);

    plantcare.query(countSql, dataParms, (countErr, countResults) => {
      if (countErr) {
        reject(countErr);
      } else {
        plantcare.query(dataSql, dataParms, (dataErr, dataResults) => {
          if (dataErr) {
            reject(dataErr);
          } else {
            resolve({
              total: countResults[0].total,
              items: dataResults,
            });
          }
        });
      }
    });
  });
};

exports.adminCreateUser = (firstName, lastName, phoneNumber, NICnumber) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO users (`firstName`, `lastName`, `phoneNumber`, `NICnumber`) VALUES (?)";
    const values = [firstName, lastName, phoneNumber, NICnumber];

    plantcare.query(sql, [values], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getAllUsers = (limit, offset, searchItem) => {
  return new Promise((resolve, reject) => {
    let countSql = "SELECT COUNT(*) as total FROM users";
    let dataSql = "SELECT * FROM users";
    const params = [];

    // Add search condition for NICnumber if provided
    if (searchItem) {
      countSql +=
        " WHERE users.NICnumber LIKE ? OR users.firstName LIKE ? OR users.lastName LIKE ? OR users.phoneNumber LIKE ?";
      dataSql +=
        " WHERE users.NICnumber LIKE ? OR users.firstName LIKE ? OR users.lastName LIKE ? OR users.phoneNumber LIKE ?";
      const searchQuery = `%${searchItem}%`;
      params.push(searchQuery, searchQuery, searchQuery, searchQuery);
    }

    // Add order, limit, and offset clauses
    dataSql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    // Execute the count query
    plantcare.query(countSql, params, (countErr, countResults) => {
      if (countErr) {
        return reject(countErr);
      }

      const total = countResults[0].total;

      // Execute the data query
      plantcare.query(dataSql, params, (dataErr, dataResults) => {
        if (dataErr) {
          return reject(dataErr);
        }

        // Process each user's image
        // const processedDataResults = dataResults.map((user) => {
        //   if (user.profileImage) {
        //     const base64Image = Buffer.from(user.profileImage).toString(
        //       "base64"
        //     );
        //     const mimeType = "image/png"; // Adjust the MIME type if needed
        //     user.profileImage = `data:${mimeType};base64,${base64Image}`;
        //   }
        //   return user;
        // });

        // Resolve with total count and the processed results
        resolve({
          total: total,
          items: dataResults,
        });
      });
    });
  });
};

exports.createOngoingCultivations = (userId, cropCalenderId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO ongoingcultivations (`userId`, `cropCalenderId`) VALUES (?)";
    const values = [userId, cropCalenderId];

    plantcare.query(sql, [values], (err, results) => {
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
  imageBuffer, // accept the image buffer
  status,
  createdBy,
  publishDate,
  expireDate
) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO content (titleEnglish, titleSinhala, titleTamil, descriptionEnglish, descriptionSinhala, descriptionTamil, image, status, createdBy,publishDate, expireDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      titleEnglish,
      titleSinhala,
      titleTamil,
      descriptionEnglish,
      descriptionSinhala,
      descriptionTamil,
      imageBuffer, // pass the buffer as image
      status,
      createdBy,
      publishDate,
      expireDate,
    ];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};

exports.getAllNews = async (limit, offset, status, createdAt) => {
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
      const formattedCreatedAt = new Date(createdAt)
        .toISOString()
        .split("T")[0];
      whereClauses.push("DATE(createdAt) = ?");
      queryParams.push(formattedCreatedAt);
    }

    if (whereClauses.length > 0) {
      const whereClause = " WHERE " + whereClauses.join(" AND ");
      countsSql += whereClause;
      dataSql += whereClause;
    }

    dataSql += " ORDER BY createdAt DESC";
    dataSql += " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    console.log(
      "Executing count query:",
      countsSql,
      "with params:",
      queryParams.slice(0, -2)
    );
    plantcare.query(
      countsSql,
      queryParams.slice(0, -2),
      (countErr, countResults) => {
        if (countErr) {
          console.error("Error in count query:", countErr);
          reject(countErr);
          return;
        }

        const total = countResults[0].total;
        console.log("Total count:", total);

        if (total === 0) {
          resolve({ items: [], total: 0 });
          return;
        }

        console.log(
          "Executing data query:",
          dataSql,
          "with params:",
          queryParams
        );
        plantcare.query(dataSql, queryParams, (dataErr, dataResults) => {
          if (dataErr) {
            console.error("Error in data query:", dataErr);
            reject(dataErr);
            return;
          }

          // Convert the image blob to base64 and include in the response
          const newsItems = dataResults.map((news) => {
            return news;
          });

          console.log("Data query results:", newsItems.length);
          resolve({ items: newsItems, total: total });
        });
      }
    );
  });
};

exports.getNewsById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM content WHERE id = ?";
    plantcare.query(sql, [id], (err, results) => {
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
    plantcare.query(sql, [id], (err, results) => {
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
    plantcare.query(sql, [id], (err, results) => {
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
    plantcare.query(sql, [status, id], (err, results) => {
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
  imageBuffer,
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
      imageBuffer,
      status,
      price,
      createdBy,
    ];

    collectionofficer.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};

exports.getAllMarketPrice = (status, createdAt, limit, offset) => {
  console.log("Create AT: ", createdAt);

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
      const formattedCreatedAt = new Date(createdAt)
        .toISOString()
        .split("T")[0];
      whereClauses.push("DATE(createdAt) = ?");
      queryParams.push(formattedCreatedAt);
    }

    if (whereClauses.length > 0) {
      const whereClause = " WHERE " + whereClauses.join(" AND ");
      countsSql += whereClause;
      dataSql += whereClause;
    }

    dataSql += " ORDER BY createdAt DESC";
    dataSql += " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    collectionofficer.query(
      countsSql,
      queryParams.slice(0, -2),
      (countErr, countResults) => {
        if (countErr) {
          return reject(countErr);
        }

        const total = countResults[0].total;

        collectionofficer.query(
          dataSql,
          queryParams,
          (dataErr, dataResults) => {
            if (dataErr) {
              return reject(dataErr);
            }

            resolve({ total, dataResults });
          }
        );
      }
    );
  });
};

exports.deleteMarketPriceById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM marketprice WHERE id = ?";
    collectionofficer.query(sql, [id], (err, results) => {
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
    collectionofficer.query(sql, [id], (err, results) => {
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
    collectionofficer.query(sql, [newStatus, id], (err, results) => {
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
    collectionofficer.query(sql, [id], (err, results) => {
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

    if (data.imageData) {
      sql += `, image = ?`;
      values.push(data.imageData);
    }

    sql += ` WHERE id = ?`;
    values.push(id);

    collectionofficer.query(sql, values, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.getAllOngoingCultivations = (searchItem, limit, offset) => {
  return new Promise((resolve, reject) => {
    let countSql = `
            SELECT 
                COUNT(*) as total 
            FROM 
                ongoingcultivations OC , users U , ongoingcultivationscrops OCC
            WHERE 
                OC.userId = U.id AND OC.id = OCC.ongoingCultivationId
        `;
    let dataSql = `
            SELECT 
                OC.id AS cultivationId, 
                U.id,
                U.firstName, 
                U.lastName, 
                U.NICnumber,
                COUNT(OCC.cropCalendar) AS CropCount
            FROM 
                ongoingcultivations OC , users U , ongoingcultivationscrops OCC
            WHERE 
                OC.userId = U.id AND OC.id = OCC.ongoingCultivationId
            
        `;
    const params = [];

    if (searchItem) {
      countSql +=
        " AND U.NICnumber LIKE ? OR U.firstName LIKE ? OR U.lastName LIKE ?";
      dataSql +=
        " AND U.NICnumber LIKE ? OR U.firstName LIKE ? OR U.lastName LIKE ?";
      const searchQuery = `%${searchItem}%`;
      params.push(searchQuery, searchQuery, searchQuery);
    }

    dataSql +=
      "GROUP BY OC.id, U.id, U.firstName, U.lastName, U.NICnumber ORDER BY OC.createdAt DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    // Fetch total count
    plantcare.query(countSql, params.slice(0, -2), (countErr, countResults) => {
      if (countErr) {
        return reject(countErr);
      }

      const total = countResults[0].total;

      // Fetch paginated data
      plantcare.query(dataSql, params, (dataErr, dataResults) => {
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
            ongoingcultivations 
        JOIN 
            users ON ongoingCultivations.userId = users.id;
    `;

  return new Promise((resolve, reject) => {
    plantcare.query(sql, (err, results) => {
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
            ongoingcultivationscrops.ongoingCultivationId,
            ongoingcultivationscrops.cropCalendar,
            cropgroup.cropNameEnglish AS cropName,
            cropvariety.varietyNameEnglish AS variety,
            cropcalender.method AS cultivationMethod,
            cropcalender.natOfCul AS natureOfCultivation,
            cropcalender.cropDuration AS cropDuration
        FROM 
            ongoingcultivationscrops
        JOIN 
            cropcalender ON ongoingcultivationscrops.cropCalendar = cropcalender.id
        JOIN 
            cropvariety ON cropcalender.cropVarietyId = cropvariety.id
        JOIN 
            cropgroup ON cropvariety.cropGroupId = cropgroup.id
        WHERE
            ongoingcultivationscrops.ongoingCultivationId = ?`;

  return new Promise((resolve, reject) => {
    plantcare.query(sql, [id], (err, results) => {
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
    "Building and Infrastructures": `
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
    Land: `
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
    "Machinery and Vehicles": `
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
    "Tools and Equipments": `
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
  };

  const sql = validCategories[category];

  if (!sql) {
    return Promise.reject("Invalid category.");
  }

  return new Promise((resolve, reject) => {
    plantcare.query(sql, [userId], (err, results) => {
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
    plantcare.query(sql, values, (err, results) => {
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
    plantcare.query(sql, [id], (err, results) => {
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
    plantcare.query(sql, [mail, userName, role, id], (err, results) => {
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

    plantcare.query(sql, values, (err, results) => {
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

    plantcare.query(sql, [id], (err, results) => {
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
    plantcare.query(sql, [id], (err, results) => {
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
    plantcare.query(sql, [newPassword, id], (err, results) => {
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
    plantcare.query(sql, [id], (err, results) => {
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
    const {
      firstName,
      lastName,
      phoneNumber,
      NICnumber,
      district,
      membership,
      profileImage,
    } = userData;

    let sql = `
      UPDATE users 
      SET 
          firstName = ?, 
          lastName = ?, 
          phoneNumber = ?, 
          NICnumber = ?, 
          district = ?, 
          membership = ?
    `;
    let values = [
      firstName,
      lastName,
      phoneNumber,
      NICnumber,
      district,
      membership,
    ];

    if (profileImage) {
      sql += `, profileImage = ?`;
      values.push(profileImage);
    }

    sql += ` WHERE id = ?`;
    values.push(id);

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// exports.createPlantCareUser = (userData) => {
//   return new Promise((resolve, reject) => {
//     const { firstName, lastName, phoneNumber, NICnumber, fileBuffer } =
//       userData;

//     const sql = `
//             INSERT INTO users (firstName, lastName, phoneNumber, NICnumber, profileImage)
//             VALUES (?, ?, ?, ?, ?)
//         `;
//     const values = [firstName, lastName, phoneNumber, NICnumber, fileBuffer];

//     db.query(sql, values, (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(results.insertId); // Return the newly created user ID
//       }
//     });
//   });
// };

exports.createPlantCareUser = (userData) => {
  return new Promise((resolve, reject) => {
    const {
      firstName,
      lastName,
      phoneNumber,
      NICnumber,
      district,
      membership,
      profileImageUrl,
    } = userData;

    // SQL query to check if phoneNumber or NICnumber already exists
    const checkSql = `
            SELECT id FROM users WHERE phoneNumber = ? OR NICnumber = ?
        `;
    const checkValues = [phoneNumber, NICnumber];

    plantcare.query(checkSql, checkValues, (checkErr, checkResults) => {
      if (checkErr) {
        return reject(checkErr); // Return the database error
      }

      if (checkResults.length > 0) {
        // If a match is found, reject with an error message
        return reject(new Error("Phone number or NIC number already exists"));
      }

      // Proceed with the INSERT operation
      const insertSql = `
            INSERT INTO users (firstName, lastName, phoneNumber, NICnumber, district, membership, profileImage) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
      const insertValues = [
        firstName,
        lastName,
        phoneNumber,
        NICnumber,
        district,
        membership,
        profileImageUrl,
      ];

      plantcare.query(insertSql, insertValues, (insertErr, insertResults) => {
        if (insertErr) {
          console.log(insertErr);

          reject(insertErr); // Return the database error
        } else {
          resolve(insertResults.insertId); // Return the newly created user ID
        }
      });
    });
  });
};

exports.getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE id = ?";
    plantcare.query(sql, [userId], (err, results) => {
      if (err) {
        return reject(err);
      }

      // if (results[0].profileImage) {
      //   const base64Image = Buffer.from(results[0].profileImage).toString(
      //     "base64"
      //   );
      //   const mimeType = "image/png"; // Adjust MIME type if necessary, depending on the image type
      //   results[0].profileImage = `data:${mimeType};base64,${base64Image}`;
      // }
      resolve(results[0]); // Return the first result
    });
  });
};

exports.createAdmin = (adminData, hashedPassword) => {
  return new Promise((resolve, reject) => {
    const sql = `
            INSERT INTO adminusers (mail, role, userName, password) 
            VALUES (?, ?, ?, ?)
        `;
    const values = [
      adminData.mail,
      adminData.role,
      adminData.userName,
      hashedPassword,
    ];

    plantcare.query(sql, values, (err, results) => {
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

    plantcare.query(sql, values, (err, results) => {
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

    plantcare.query(sql, values, (err, results) => {
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

    plantcare.query(sql, values, (err, results) => {
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

    plantcare.query(sql, values, (err, results) => {
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

exports.editTask = (
  taskEnglish,
  taskSinhala,
  taskTamil,
  taskTypeEnglish,
  taskTypeSinhala,
  taskTypeTamil,
  taskCategoryEnglish,
  taskCategorySinhala,
  taskCategoryTamil,
  taskDescriptionEnglish,
  taskDescriptionSinhala,
  taskDescriptionTamil,
  reqImages,
  imageLink,
  videoLinkEnglish,
  videoLinkSinhala,
  videoLinkTamil,
  id
) => {
  return new Promise((resolve, reject) => {
    const sql = `
            UPDATE cropcalendardays 
            SET taskEnglish=?, taskSinhala=?, taskTamil=?, taskTypeEnglish=?, taskTypeSinhala=?, taskTypeTamil=?, 
                taskCategoryEnglish=?, taskCategorySinhala=?, taskCategoryTamil=?, taskDescriptionEnglish=?, taskDescriptionSinhala=?, taskDescriptionTamil=?, reqImages=?, imageLink=?, videoLinkEnglish=?, videoLinkSinhala=?, videoLinkTamil=?
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
      taskDescriptionEnglish,
      taskDescriptionSinhala,
      taskDescriptionTamil,
      reqImages,
      imageLink,
      videoLinkEnglish,
      videoLinkSinhala,
      videoLinkTamil,
      id,
    ];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        return reject(err); // Reject the promise on error
      }

      resolve(results); // Resolve the promise with the results
    });
  });
};

exports.getAllPost = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM publicforumposts ORDER BY createdAt DESC `;

    plantcare.query(sql, (err, results) => {
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

// exports.getAllUserTaskByCropId = (cropId, userId) => {
//   return new Promise((resolve, reject) => {
//     const countSql = `SELECT COUNT(*) as total FROM slavecropcalendardays WHERE
//     slavecropcalendardays.cropCalendarId = ?
//     AND slavecropcalendardays.userId = ?`;
//     const sql = `
//             SELECT
//     slavecropcalendardays.id AS slavecropcalendardaysId,
//     slavecropcalendardays.cropCalendarId,
//     slavecropcalendardays.taskIndex,
//     slavecropcalendardays.days,
//     slavecropcalendardays.taskEnglish,
//     slavecropcalendardays.status
// FROM
//     slavecropcalendardays
// WHERE
//     slavecropcalendardays.cropCalendarId = ?
//     AND slavecropcalendardays.userId = ?
// ORDER BY slavecropcalendardays.taskIndex;

//         `;
//     const values = [cropId, userId];

//     db.query(sql, values, (err, results) => {
//       if (err) {
//         return reject(err); // Reject promise if an error occurs
//       }
//       resolve(results); // Resolve the promise with the query results
//     });
//   });
// };

exports.getAllUserTaskByCropId = (cropId, userId, limit, offset) => {
  return new Promise((resolve, reject) => {
    const countSql = `
      SELECT COUNT(*) as total 
      FROM slavecropcalendardays 
      WHERE cropCalendarId = ? AND userId = ?`;

    const dataSql = `
      SELECT 
        slavecropcalendardays.id AS slavecropcalendardaysId,
        slavecropcalendardays.cropCalendarId,
        slavecropcalendardays.taskIndex, 
        slavecropcalendardays.startingDate, 
        slavecropcalendardays.taskEnglish,
        slavecropcalendardays.imageLink,
        slavecropcalendardays.videoLinkEnglish,
        slavecropcalendardays.videoLinkSinhala,
        slavecropcalendardays.videoLinkTamil,
        slavecropcalendardays.status
      FROM 
        slavecropcalendardays
      WHERE 
        slavecropcalendardays.cropCalendarId = ? 
        AND slavecropcalendardays.userId = ?
      ORDER BY slavecropcalendardays.taskIndex
      LIMIT ? OFFSET ?`;

    const values = [cropId, userId, limit, offset];

    // First, query the total count of the tasks
    plantcare.query(countSql, [cropId, userId], (countErr, countResults) => {
      if (countErr) {
        return reject(countErr);
      }

      // Next, query the task data with pagination (limit and offset)
      plantcare.query(dataSql, values, (dataErr, dataResults) => {
        if (dataErr) {
          return reject(dataErr);
        }

        // Resolve with total count and paginated items
        resolve({
          total: countResults[0].total, // The total count of tasks
          items: dataResults, // The list of tasks for the user
        });
      });
    });
  });
};

exports.getUserTaskStatusById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT status FROM slavecropcalendardays WHERE id = ?";
    plantcare.query(sql, [id], (err, results) => {
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
    plantcare.query(sql, [newStatus, id], (err, results) => {
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

    plantcare.query(sql, values, (err, results) => {
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

exports.editUserTask = (
  taskEnglish,
  taskSinhala,
  taskTamil,
  taskTypeEnglish,
  taskTypeSinhala,
  taskTypeTamil,
  taskCategoryEnglish,
  taskCategorySinhala,
  taskCategoryTamil,
  startingDate,
  reqImages,
  imageLink,
  videoLink,
  id
) => {
  return new Promise((resolve, reject) => {
    const sql = `
            UPDATE slavecropcalendardays 
            SET taskEnglish=?, taskSinhala=?, taskTamil=?, taskTypeEnglish=?, taskTypeSinhala=?, taskTypeTamil=?, 
                taskCategoryEnglish=?, taskCategorySinhala=?, taskCategoryTamil=? , startingDate=?, reqImages=?,imageLink=?, videoLink= ?
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
      startingDate,
      reqImages,
      imageLink,
      videoLink,
      id,
    ];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        return reject(err); // Reject the promise on error
      }

      resolve(results); // Resolve the promise with the results
    });
  });
};

//post reply
exports.getAllPostReplyDao = (postid) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT p.id, p.replyMessage, p.createdAt, u.firstName, u.lastName FROM publicforumreplies p LEFT JOIN users u ON p.replyId = u.id WHERE p.chatId = ?";
    const values = [postid];

    plantcare.query(sql, values, (err, results) => {
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

// replyDao.js

exports.getReplyCount = () => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT chatId, COUNT(id) AS replyCount FROM publicforumreplies GROUP BY chatId";

    plantcare.query(sql, (err, results) => {
      if (err) {
        return reject(err); // Handle error in the promise
      }

      // Return the count result
      resolve(results);
    });
  });
};

exports.deleteReply = (id) => {
  const sql = "DELETE FROM publicforumreplies WHERE id = ?";

  return new Promise((resolve, reject) => {
    plantcare.query(sql, [id], (err, results) => {
      if (err) {
        reject("Error executing delete query: " + err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.shiftUpTaskIndexDao = (taskId, indexId) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE  cropcalendardays SET taskIndex = ? WHERE id = ?";
    const values = [indexId, taskId];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results[0]); // Resolve the promise with the first result
    });
  });
};

exports.getAllTaskIdDao = (cropId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, taskIndex FROM cropcalendardays WHERE cropId = ?";
    const values = [cropId];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results); // No need to wrap in arrays, return results directly
    });
  });
};

exports.addNewTaskDao = (task, indexId, cropId) => {
  console.log("Dao Task: ", task);

  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO cropcalendardays ( cropId, taskIndex, startingDate, taskTypeEnglish, taskTypeSinhala, taskTypeTamil, taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil, taskEnglish, taskSinhala, taskTamil, taskDescriptionEnglish, taskDescriptionSinhala, taskDescriptionTamil, reqImages, imageLink, videoLink) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const values = [
      cropId,
      indexId,
      task.startingDate,
      task.taskTypeEnglish,
      task.taskTypeSinhala,
      task.taskTypeTamil,
      task.taskCategoryEnglish,
      task.taskCategorySinhala,
      task.taskCategoryTamil,
      task.taskEnglish,
      task.taskSinhala,
      task.taskTamil,
      task.taskDescriptionEnglish,
      task.taskDescriptionSinhala,
      task.taskDescriptionTamil,
      task.reqImages,
      task.imageLink,
      task.videoLink,
    ];

    // Ensure that the values array length matches the expected column count
    if (values.length !== 18) {
      return reject(
        new Error("Mismatch between column count and value count.")
      );
    }

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.addNewReplyDao = (chatId, replyId, replyMessage) => {
  console.log("Dao Reply: ", replyMessage);

  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO publicforumreplies (chatId, replyMessage) VALUES (?, ?)";
    const values = [chatId, replyMessage];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        console.error("Error executing query:", err); // Improved error logging
        return reject(err);
      } else {
        console.log("Insert successful:", results);
        resolve(results);
      }
    });
  });
};

exports.deletePublicForumPost = (id) => {
  const sql = "DELETE FROM publicforumposts WHERE id = ?";

  return new Promise((resolve, reject) => {
    plantcare.query(sql, [id], (err, results) => {
      if (err) {
        reject("Error executing delete query: " + err);
      } else {
        resolve(results);
      }
    });
  });
};

//User separate task
exports.shiftUpTaskIndexDaoU = (taskId, indexId) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE  slavecropcalendardays SET taskIndex = ? WHERE id = ?";
    const values = [indexId, taskId];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results[0]); // Resolve the promise with the first result
    });
  });
};

exports.getAllTaskIdDaoU = (cropId, userId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT id, taskIndex FROM slavecropcalendardays WHERE cropCalendarId  = ? AND userId = ?";
    const values = [cropId, userId];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results); // No need to wrap in arrays, return results directly
    });
  });
};

exports.addNewTaskDaoU = (task, indexId, userId, cropId, onCulscropID) => {
  console.log("Dao Task: ", task);
  const defStatus = "Pending";

  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO slavecropcalendardays (userId, onCulscropID, cropCalendarId, taskIndex, startingDate, taskTypeEnglish, taskTypeSinhala, taskTypeTamil, taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil, taskEnglish, taskSinhala, taskTamil, taskDescriptionEnglish, taskDescriptionSinhala, taskDescriptionTamil, reqImages, imageLink, videoLink, status) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const values = [
      userId,
      onCulscropID,
      cropId,
      indexId,
      task.startingDate,
      task.taskTypeEnglish,
      task.taskTypeSinhala,
      task.taskTypeTamil,
      task.taskCategoryEnglish,
      task.taskCategorySinhala,
      task.taskCategoryTamil,
      task.taskEnglish,
      task.taskSinhala,
      task.taskTamil,
      task.taskDescriptionEnglish,
      task.taskDescriptionSinhala,
      task.taskDescriptionTamil,
      task.reqImages,
      task.imageLink,
      task.videoLink,
      defStatus,
    ];

    // Ensure that the values array length matches the expected column count
    if (values.length !== 21) {
      return reject(
        new Error("Mismatch between column count and value count.")
      );
    }

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.insertUserXLSXData = (data) => {
  return new Promise((resolve, reject) => {
    // Define validation schema
    const schema = Joi.object({
      "First Name": Joi.string().trim().min(2).max(50).required(),
      "Last Name": Joi.string().trim().min(2).max(50).required(),
      "Phone Number": Joi.alternatives()
        .try(
          Joi.string().pattern(/^\+94\d{9}$/),
          Joi.number().integer().min(94000000000).max(94999999999)
        )
        .required(),
      "NIC Number": Joi.alternatives()
        .try(
          Joi.string().pattern(/^(19\d{9}|\d{9}[vV])$/),
          Joi.number().integer().min(10000000000).max(199999999999)
        )
        .required(),
    }).required();

    // Validate all data
    const validatedData = [];
    for (let i = 0; i < data.length; i++) {
      const { error, value } = schema.validate(data[i]);
      if (error) {
        return reject(
          new Error(
            `Validation error in row ${i + 1}: ${error.details[0].message}`
          )
        );
      }
      validatedData.push(value);
    }

    const sql = `
      INSERT INTO users 
      (firstName, lastName, phoneNumber, NICnumber) 
      VALUES ?`;

    const values = validatedData.map((row) => [
      row["First Name"],
      row["Last Name"],
      String(row["Phone Number"]).startsWith("+")
        ? row["Phone Number"]
        : `+${row["Phone Number"]}`,
      String(row["NIC Number"]),
    ]);

    plantcare.query(sql, [values], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          message: "All data validated and inserted successfully",
          totalRows: data.length,
          insertedRows: result.affectedRows,
        });
      }
    });
  });
};

exports.getAllRoles = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM adminroles";

    plantcare.query(sql, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results); // No need to wrap in arrays, return results directly
    });
  });
};

exports.deleteUserCropTask = (taskId) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM slavecropcalendardays WHERE id = ?";
    const values = [taskId];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }
      resolve(results); // Resolve the promise with the query results
    });
  });
};

exports.getAllUserTaskIdDao = (cropId, userId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT id, taskIndex FROM slavecropcalendardays WHERE cropCalendarId = ? AND userId = ?";
    const values = [cropId, userId];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results); // No need to wrap in arrays, return results directly
    });
  });
};

exports.shiftUpUserTaskIndexDao = (taskId, indexId) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE  slavecropcalendardays SET taskIndex = ? WHERE id = ?";
    const values = [indexId, taskId];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results[0]); // Resolve the promise with the first result
    });
  });
};

exports.getPaymentSlipReportrrrr = (officerID) => {
  return new Promise((resolve, reject) => {
    const dataSql = `
      SELECT u.id, co.firstNameEnglish AS officerFirstName, co.lastNameEnglish AS officerLastName, u.firstName, u.lastName, u.NICnumber, SUM(gradeAprice)+SUM(gradeBprice)+SUM(gradeCprice) AS total
      FROM registeredfarmerpayments rp, plant_care.users u ,farmerpaymentscrops fpc, collectionofficer co
      WHERE rp.userId = u.id AND rp.id = fpc.registerFarmerId 
      GROUP BY u.id, co.firstNameEnglish, co.lastNameEnglish, u.firstName, u.lastName, u.NICnumber
    `;
    collectionofficer.query(dataSql, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// exports.getPaymentSlipReport = (officerID, limit, offset) => {
//   return new Promise((resolve, reject) => {
//     // SQL query to count the total number of rows
//     const countSql = `
//       SELECT COUNT(*) AS total
//       FROM registeredfarmerpayments
//       WHERE collectionOfficerId = ?
//     `;

//     // SQL query to fetch paginated results
//     const dataSql = `
//       SELECT
//         rp.id,
//         u.id AS userId,
//         u.firstName,
//         u.lastName,
//         u.NICnumber,
//         co.firstNameEnglish AS officerFirstName,
//         co.lastNameEnglish AS officerLastName,
//         rp.createdAt
//       FROM
//         registeredfarmerpayments rp
//       JOIN
//         users u ON rp.userId = u.id
//       JOIN
//         collectionofficer co ON rp.collectionOfficerId = co.id
//       WHERE
//         rp.collectionOfficerId = ?
//       ORDER BY
//         rp.createdAt DESC
//       LIMIT ?
//       OFFSET ?
//     `;

//     // Execute the count query
//     db.query(countSql, [officerID], (countErr, countResults) => {
//       if (countErr) {
//         return reject(countErr);
//       }

//       const total = countResults[0].total;

//       // Execute the data query
//       db.query(dataSql, [officerID, limit, offset], (dataErr, dataResults) => {
//         if (dataErr) {
//           return reject(dataErr);
//         }

//         // Optional: Process each user's data (if needed)
//         const processedDataResults = dataResults.map((user) => {
//           return user;
//         });

//         // Resolve with total count and the processed results
//         resolve({
//           total: total,
//           items: processedDataResults,
//         });
//       });
//     });
//   });
// };

exports.getPaymentSlipReport = (
  officerID,
  limit,
  offset,
  date = null,
  search = null
) => {
  return new Promise((resolve, reject) => {
    // Base SQL queries
    let countSql = `
      SELECT COUNT(*) AS total 
      FROM registeredfarmerpayments rp 
      JOIN plant_care.users u ON rp.userId = u.id 
      WHERE rp.collectionOfficerId = ? 
    `;
    let dataSql = `
      SELECT 
          rp.id,
          u.id AS userId,
          u.firstName,
          u.lastName,
          u.NICnumber,
          co.firstNameEnglish AS officerFirstName,
          co.lastNameEnglish AS officerLastName,
          rp.createdAt
      FROM 
          registeredfarmerpayments rp
      JOIN 
          plant_care.users u ON rp.userId = u.id
      JOIN 
          collectionofficer co ON rp.collectionOfficerId = co.id
      WHERE 
          rp.collectionOfficerId = ? 
    `;

    const params = [officerID];

    // Add date filter if provided
    if (date) {
      countSql += " AND DATE(rp.createdAt) = ?";
      dataSql += " AND DATE(rp.createdAt) = ?";
      params.push(date);
    }

    // Add search filter if provided
    if (search) {
      const searchQuery = `%${search}%`;
      countSql +=
        " AND (u.firstName LIKE ? OR u.lastName LIKE ? OR u.NICnumber LIKE ?)";
      dataSql +=
        " AND (u.firstName LIKE ? OR u.lastName LIKE ? OR u.NICnumber LIKE ?)";
      params.push(searchQuery, searchQuery, searchQuery);
    }

    // Add pagination parameters
    dataSql += " ORDER BY rp.createdAt DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    // Execute the count query
    collectionofficer.query(
      countSql,
      params.slice(0, params.length - 2),
      (countErr, countResults) => {
        if (countErr) {
          console.error("Error in count query:", countErr);
          return reject(countErr);
        }

        const total = countResults[0]?.total || 0;

        // Execute the data query
        collectionofficer.query(dataSql, params, (dataErr, dataResults) => {
          if (dataErr) {
            console.error("Error in data query:", dataErr);
            return reject(dataErr);
          }

          resolve({
            total: total,
            items: dataResults,
          });
        });
      }
    );
  });
};

exports.getFarmerListReport = (id) => {
  return new Promise((resolve, reject) => {
    const dataSql = `
      SELECT 
  rp.id,
  u.id AS userId,
  u.firstName,
  u.lastName,
  u.NICnumber,
  co.firstNameEnglish AS officerFirstName,
  co.lastNameEnglish AS officerLastName
FROM 
  registeredfarmerpayments rp
JOIN 
  plant_care.users u ON rp.userId = u.id
JOIN 
  collectionofficer co ON rp.collectionOfficerId = co.id
WHERE 
  rp.collectionOfficerId = ?
ORDER BY 
  rp.createdAt DESC
LIMIT 10 OFFSET 2;

    `;

    collectionofficer.query(dataSql, [id], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

exports.getFarmerCropListReport = (id) => {
  return new Promise((resolve, reject) => {
    const dataSql = `
SELECT 
  fp.id,
  cv.varietyNameEnglish,
  cg.cropNameEnglish,
  fp.gradeAprice,
  fp.gradeBprice,
  fp.gradeCprice,
  fp.gradeAquan,
  fp.gradeBquan,
  fp.gradeCquan
FROM 
  farmerpaymentscrops fp
JOIN 
  plant_care.cropvariety cv ON fp.cropId = cv.id
JOIN 
  plant_care.cropgroup cg ON cv.cropGroupId  = cg.id
WHERE 
  fp.registerFarmerId  = ?
    `;

    collectionofficer.query(dataSql, [id], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

exports.getReportfarmerDetails = (userId) => {
  return new Promise((resolve, reject) => {
    const dataSql = `
      SELECT 
        u.id,
        u.firstName,
        u.lastName,
        u.phoneNumber,
        u.NICnumber,
        u.farmerQr,
        u.houseNo,
        u.streetName,
        u.city,
        ub.accNumber,
        ub.accHolderName,
        ub.bankName,
        ub.branchName
      FROM 
        users u
      LEFT JOIN 
        userbankdetails ub ON u.id = ub.userId 
      WHERE 
        u.id  = ?
    `;

    plantcare.query(dataSql, [userId], (error, results) => {
      if (error) {
        return reject(error);
      }

      if (results.length === 0) {
        return resolve(null); // No user found with the given ID
      }
      resolve(results[0]);
    });
  });
};

exports.insertUserXLSXData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Define validation schema
      const schema = Joi.object({
        "First Name": Joi.string().trim().min(2).max(50).required(),
        "Last Name": Joi.string().trim().min(2).max(50).required(),
        "Phone Number": Joi.alternatives()
          .try(
            Joi.string().pattern(/^\+94\d{9}$/),
            Joi.number().integer().min(94000000000).max(94999999999)
          )
          .required(),
        "NIC Number": Joi.alternatives()
          .try(
            Joi.string().pattern(/^(19\d{9}|\d{9}[vV])$/),
            Joi.number().integer().min(10000000000).max(199999999999)
          )
          .required(),
      }).required();

      // Validate all data
      const validatedData = [];
      for (let i = 0; i < data.length; i++) {
        const { error, value } = schema.validate(data[i]);
        if (error) {
          reject(
            new Error(
              `Validation error in row ${i + 1}: ${error.details[0].message}`
            )
          );
          return;
        }
        validatedData.push(value);
      }

      // Check for existing users
      const existingUsers = await new Promise((resolve, reject) => {
        const phones = validatedData.map((row) =>
          String(row["Phone Number"]).startsWith("+")
            ? row["Phone Number"]
            : `+${row["Phone Number"]}`
        );
        const nics = validatedData.map((row) => String(row["NIC Number"]));

        const sql = `
          SELECT firstName, lastName, phoneNumber, NICnumber 
          FROM users 
          WHERE phoneNumber IN (?) OR NICnumber IN (?)
        `;

        plantcare.query(sql, [phones, nics], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (existingUsers.length > 0) {
        // Filter out existing users
        const existingPhones = new Set(
          existingUsers.map((user) => user.phoneNumber)
        );
        const existingNICs = new Set(
          existingUsers.map((user) => user.NICnumber)
        );

        const newUsers = validatedData.filter((user) => {
          const phone = String(user["Phone Number"]).startsWith("+")
            ? user["Phone Number"]
            : `+${user["Phone Number"]}`;
          const nic = String(user["NIC Number"]);
          return !existingPhones.has(phone) && !existingNICs.has(nic);
        });

        // Insert only new users
        if (newUsers.length > 0) {
          const sql = `
            INSERT INTO users 
            (firstName, lastName, phoneNumber, NICnumber) 
            VALUES ?
          `;

          const values = newUsers.map((row) => [
            row["First Name"],
            row["Last Name"],
            String(row["Phone Number"]).startsWith("+")
              ? row["Phone Number"]
              : `+${row["Phone Number"]}`,
            String(row["NIC Number"]),
          ]);

          await new Promise((resolve, reject) => {
            plantcare.query(sql, [values], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        }

        resolve({
          message: "Partial data inserted. Some users already exist.",
          existingUsers: existingUsers,
          totalRows: data.length,
          insertedRows: newUsers.length,
        });
      } else {
        // Insert all users if none exist
        const sql = `
          INSERT INTO users 
          (firstName, lastName, phoneNumber, NICnumber) 
          VALUES ?
        `;

        const values = validatedData.map((row) => [
          row["First Name"],
          row["Last Name"],
          String(row["Phone Number"]).startsWith("+")
            ? row["Phone Number"]
            : `+${row["Phone Number"]}`,
          String(row["NIC Number"]),
        ]);

        const result = await new Promise((resolve, reject) => {
          plantcare.query(sql, [values], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        resolve({
          message: "All data validated and inserted successfully",
          totalRows: data.length,
          insertedRows: result.affectedRows,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

// exports.getUserFeedbackDetails = () => {
//   return new Promise((resolve, reject) => {
//     const sql = `
// SELECT
//     du.firstName,
//     du.lastName,
//     du.createdAt AS deletedUserCreatedAt,
//     GROUP_CONCAT(fl.orderNumber ORDER BY fl.orderNumber ASC) AS orderNumbers,
//     GROUP_CONCAT(fl.feedbackEnglish ORDER BY fl.orderNumber ASC) AS feedbacks
// FROM
//     userfeedback uf
// JOIN
//     deleteduser du ON uf.deletedUserId = du.id
// JOIN
//     feedbacklist fl ON uf.feedbackId = fl.id
// GROUP BY
//     du.firstName, du.lastName, du.createdAt
// ORDER BY
//     du.createdAt;

//     `;

//     console.log("Executing full SQL query:", sql);

//     plantcare.query(sql, (err, results) => {
//       if (err) {
//         console.error("Error details:", err); // Log the full error details
//         return reject(
//           new Error("An error occurred while fetching user feedback details")
//         );
//       }

//       console.log("Query Results:", results); // Log the results for debugging
//       resolve(results); // Resolve the promise with the results
//     });
//   });
// };

exports.getUserFeedbackDetails = (page, limit) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit; // Calculate the offset for pagination

    const sql = `
    SELECT 
        du.firstName,
        du.lastName,
        du.createdAt AS deletedUserCreatedAt,
        GROUP_CONCAT(fl.orderNumber ORDER BY fl.orderNumber ASC) AS orderNumbers,
        GROUP_CONCAT(fl.feedbackEnglish ORDER BY fl.orderNumber ASC) AS feedbacks
    FROM 
        userfeedback uf
    JOIN 
        deleteduser du ON uf.deletedUserId = du.id
    JOIN 
        feedbacklist fl ON uf.feedbackId = fl.id
    GROUP BY 
        du.firstName, du.lastName, du.createdAt
    ORDER BY 
        du.createdAt
    LIMIT ? OFFSET ?;
    `;

    console.log("Executing paginated SQL query:", sql);

    plantcare.query(sql, [limit, offset], (err, results) => {
      if (err) {
        console.error("Error details:", err); // Log the full error details
        return reject(
          new Error("An error occurred while fetching user feedback details")
        );
      }

      console.log("Query Results:", results); // Log the results for debugging
      resolve(results); // Resolve the promise with the results
    });
  });
};

exports.createFeedback = async (
  orderNumber,
  feedbackEnglish,
  feedbackSinahala,
  feedbackTamil
) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO feedbacklist (orderNumber, feedbackEnglish, feedbackSinahala, feedbackTamil) VALUES (?, ?, ?, ?)";
    const values = [
      orderNumber,
      feedbackEnglish,
      feedbackSinahala,
      feedbackTamil,
    ];

    plantcare.query(sql, values, (err, results) => {
      if (err) {
        return reject(err); // Handle error in the promise
      }

      // Return the grouped result
      resolve(results);
    });
  });
};

exports.getNextOrderNumber = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COALESCE(MAX(orderNumber), 0) + 1 AS nextOrderNumber
      FROM feedbacklist
    `;

    plantcare.query(query, (error, results) => {
      if (error) {
        return reject(error); // Handle error
      }

      resolve(results[0].nextOrderNumber); // Return the next order number
    });
  });
};

exports.getAllfeedackList = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM feedbacklist ORDER BY orderNumber";

    plantcare.query(sql, (err, results) => {
      if (err) {
        return reject(err); // Reject promise if an error occurs
      }

      resolve(results); // No need to wrap in arrays, return results directly
    });
  });
};

exports.getUserFeedbackCount = () => {
  return new Promise((resolve, reject) => {
    const sql = `
SELECT COUNT (*) AS Total FROM userfeedback`;

    console.log("Executing full SQL query:", sql);

    plantcare.query(sql, (err, results) => {
      if (err) {
        console.error("Error details:", err); // Log the full error details
        return reject(
          new Error("An error occurred while fetching user feedback details")
        );
      }

      console.log("Query Results:", results); // Log the results for debugging
      resolve(results[0]); // Resolve the promise with the results
    });
  });
};

exports.getDeletedUserCount = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT COUNT(*) AS Total FROM deleteduser`;

    console.log("Executing full SQL query:", sql);

    plantcare.query(sql, (err, results) => {
      if (err) {
        console.error("Error details:", err); // Log the full error details
        return reject(
          new Error("An error occurred while fetching deleted user count")
        );
      }

      console.log("Query Results:", results); // Log the results for debugging
      resolve(results[0]); // Resolve the promise with the results
    });
  });
};

exports.updateFeedbackOrder = async (feedbacks) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE feedbacklist SET orderNumber = ? WHERE id = ?";

    const queries = feedbacks.map((feedback) => {
      return new Promise((resolveInner, rejectInner) => {
        plantcare.query(
          sql,
          [feedback.orderNumber, feedback.id],
          (err, results) => {
            if (err) {
              return rejectInner(err);
            }
            resolveInner(results);
          }
        );
      });
    });
    Promise.all(queries)
      .then((results) => resolve(results))
      .catch((err) => reject(err));
  });
};

exports.getFeedbackById = async (feedbackId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM feedbacklist WHERE id = ?";
    plantcare.query(sql, [feedbackId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results[0]);
    });
  });
};

exports.deleteFeedbackAndUpdateOrder = async (feedbackId, orderNumber) => {
  return new Promise((resolve, reject) => {
    const deleteSql = "DELETE FROM feedbacklist WHERE id = ?";
    const updateSql =
      "UPDATE feedbacklist SET orderNumber = orderNumber - 1 WHERE orderNumber > ?";

    plantcare.query(deleteSql, [feedbackId], (deleteErr, deleteResults) => {
      if (deleteErr) {
        return reject(deleteErr);
      }
      plantcare.query(updateSql, [orderNumber], (updateErr, updateResults) => {
        if (updateErr) {
          return reject(updateErr);
        }

        resolve({
          deleteResults,
          updateResults,
        });
      });
    });
  });
};

exports.getAllfeedackListForBarChart = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        fl.orderNumber,
        COUNT(uf.feedbackId) AS feedbackCount
      FROM 
        feedbacklist fl
      LEFT JOIN 
        userfeedback uf
      ON 
        fl.id = uf.feedbackId
      GROUP BY 
        fl.orderNumber
      ORDER BY 
        fl.orderNumber;
    `;

    plantcare.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }

      resolve(results);
    });
  });
};
