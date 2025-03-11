const {plantcare, collectionofficer, marketPlace, dash} = require('../startup/database')

// exports.getOfficerTargetDao = (userId, status, search) => {
//     return new Promise((resolve, reject) => {
//         let sql =
//             `SELECT 
//             ODT.id, 
//             ODT.dailyTargetId, 
//             ODT.varietyId, 
//             CV.varietyNameEnglish, 
//             CG.cropNameEnglish, 
//             ODT.target, 
//             ODT.grade, 
//             ODT.complete, 
//             DT.toDate, 
//             DT.toTime, 
//             CO.empId,
//             CASE 
//                 WHEN ODT.target > ODT.complete THEN 'Pending'
//                 WHEN ODT.target < ODT.complete THEN 'Exceeded'
//                 WHEN ODT.target = ODT.complete THEN 'Completed'
//             END AS status,
//             CASE 
//                 WHEN ODT.complete > ODT.target THEN 0.00
//                 ELSE ODT.target - ODT.complete
//             END AS remaining
//         FROM dailytarget DT 
//         JOIN officerdailytarget ODT ON ODT.dailyTargetId = DT.id 
//         JOIN plant_care.cropvariety CV ON ODT.varietyId = CV.id 
//         JOIN plant_care.cropgroup CG ON CV.cropGroupId = CG.id
//         JOIN collectionofficer CO ON ODT.officerId = CO.id
//         WHERE CO.id = ?`;

//         const params = [userId];

//         // Add the status condition if it is provided
//         if (status) {
//             sql += ` AND (
//                 CASE 
//                     WHEN ODT.target > ODT.complete THEN 'Pending'
//                     WHEN ODT.target < ODT.complete THEN 'Exceeded'
//                     WHEN ODT.target = ODT.complete THEN 'Completed'
//                 END
//             ) = ?`;
//             params.push(status);
//         }

//         if (search) {
//             sql += ` AND (CV.varietyNameEnglish LIKE ? OR CG.cropNameEnglish LIKE ?)`;
//             params.push(`%${search}%`, `%${search}%`);
//         }

//         console.log("Executing SQL:", sql);
//         console.log("With Parameters:", params);

//         collectionofficer.query(sql, params, (err, results) => {
//             if (err) {
//                 console.error("Error executing query:", err);
//                 return reject(err);
//             }
//             console.log("Query Results:", results);
//             resolve(results);
//         });
//     });
// };

exports.getOfficerTargetDao = (userId) => {
    return new Promise((resolve, reject) => {
        let sql =
            `SELECT 
            ODT.id, 
            ODT.dailyTargetId, 
            ODT.varietyId, 
            CV.varietyNameEnglish, 
            CG.cropNameEnglish, 
            ODT.target, 
            ODT.grade, 
            ODT.complete, 
            DT.toDate, 
            DT.toTime, 
            CO.empId,
            CASE 
                WHEN ODT.target > ODT.complete THEN 'Pending'
                WHEN ODT.target < ODT.complete THEN 'Exceeded'
                WHEN ODT.target = ODT.complete THEN 'Completed'
            END AS status,
            CASE 
                WHEN ODT.complete > ODT.target THEN 0.00
                ELSE ODT.target - ODT.complete
            END AS remaining
        FROM dailytarget DT 
        JOIN officerdailytarget ODT ON ODT.dailyTargetId = DT.id 
        JOIN plant_care.cropvariety CV ON ODT.varietyId = CV.id 
        JOIN plant_care.cropgroup CG ON CV.cropGroupId = CG.id
        JOIN collectionofficer CO ON ODT.officerId = CO.id
        WHERE CO.id = ?`;

        const params = [userId];

        console.log("Executing SQL:", sql);
        console.log("With Parameters:", params);

        collectionofficer.query(sql, params, (err, results) => {
            if (err) {
                console.error("Error executing query:", err);
                return reject(err);
            }
            console.log("Query Results:", results);
            resolve(results);
        });
    });
};