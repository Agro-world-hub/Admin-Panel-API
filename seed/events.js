const db = require('../startup/database');


const createExpiredContentCleanupEvent = () => {
    const sql = `
    CREATE EVENT IF NOT EXISTS delete_expired_content
      ON SCHEDULE EVERY 1 DAY
      DO
        DELETE FROM content
        WHERE expireDate IS NOT NULL
        AND expireDate < NOW();
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error createExpiredContentCleanupEvent ' + err);
            } else {
                resolve('createExpiredContentCleanupEvent created successfully.');
            }
        });
    });
};




const createContentPublishingEvent = () => {
    const sql = `
    CREATE EVENT IF NOT EXISTS update_content_status
      ON SCHEDULE EVERY 1 DAY
      DO
        UPDATE content
        SET status = 'Published'
        WHERE publishDate <= CURRENT_DATE()
        AND status != 'Published';
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error createContentPublishingEvent ' + err);
            } else {
                resolve('createContentPublishingEvent created successfully.');
            }
        });
    });
};





module.exports = {
  createExpiredContentCleanupEvent,
  createContentPublishingEvent

};