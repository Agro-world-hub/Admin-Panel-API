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
        const { titleEnglish, titleSinhala, titleTamil, descriptionEnglish, descriptionSinhala, descriptionTamil, imagePath } = newsData;
        
        let sql = `
            UPDATE content 
            SET 
                titleEnglish = ?, 
                titleSinhala = ?, 
                titleTamil = ?, 
                descriptionEnglish = ?, 
                descriptionSinhala = ?, 
                descriptionTamil = ?
        `;
        
        let values = [
            titleEnglish,
            titleSinhala,
            titleTamil,
            descriptionEnglish,
            descriptionSinhala,
            descriptionTamil,
        ];

        if (imagePath) {
            sql += `, image = ?`;
            values.push(imagePath);
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