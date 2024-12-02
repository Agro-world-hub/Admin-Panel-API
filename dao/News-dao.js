const db = require("../startup/database"); // Replace with your actual DB connection

exports.deleteNews = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM content WHERE id = ?';
        db.query(sql, [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

exports.updateNews = (newsData, id) => {
    return new Promise((resolve, reject) => {
        const { titleEnglish, titleSinhala, titleTamil, descriptionEnglish, descriptionSinhala, descriptionTamil, image,  publishDate, expireDate } = newsData;
        
        let sql = `
            UPDATE content 
            SET 
                titleEnglish = ?, 
                titleSinhala = ?, 
                titleTamil = ?, 
                descriptionEnglish = ?, 
                descriptionSinhala = ?, 
                descriptionTamil = ?,
                publishDate = ?,
                expireDate = ?
        `;
        
        let values = [
            titleEnglish,
            titleSinhala,
            titleTamil,
            descriptionEnglish,
            descriptionSinhala,
            descriptionTamil,
            publishDate,
            expireDate
        ];

        if (image) {
            sql += `, image = ?`;  // Update the image field with binary data
            values.push(image);
        }

        sql += ` WHERE id = ?`;
        values.push(id);

        db.query(sql, values, (err, results) => {
            if (err) {
                console.log(err);
                
                return reject(err);
            }
            resolve(results);
        });
    });
};