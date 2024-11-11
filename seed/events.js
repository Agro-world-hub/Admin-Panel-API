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

const createExpiredXlsxHistoryCleanupEvent = () => {
    const sql = `
    CREATE EVENT IF NOT EXISTS delete_expired_xlsxhistory
      ON SCHEDULE EVERY 1 MINUTE
      DO
        DELETE FROM xlsxhistory
        WHERE DATE(date) = CURRENT_DATE()
        AND endTime < CURRENT_TIME();
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error createExpiredXlsxHistoryCleanupEvent ' + err);
            } else {
                resolve('createExpiredXlsxHistoryCleanupEvent created successfully.');
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


const createMarketPricePublishingEvent = () => {
    const sql = `
    CREATE EVENT IF NOT EXISTS update_market_price_status
      ON SCHEDULE EVERY 1 MINUTE
      DO
        UPDATE marketprice
        SET status = 'Published'
        WHERE date = CURRENT_DATE()
        AND startTime <= CURRENT_TIME();
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error createMarketPricePublishingEvent ' + err);
            } else {
                resolve('createMarketPricePublishingEvent created successfully.');
            }
        });
    });
};


module.exports = {
  createExpiredContentCleanupEvent,
  createExpiredXlsxHistoryCleanupEvent,
  createContentPublishingEvent,
  createMarketPricePublishingEvent
};