const db = require('../startup/database');

// const createExpiredContentCleanupEvent = async () => {
//   try {
//     db.query(`
//       CREATE EVENT IF NOT EXISTS delete_expired_content
//       ON SCHEDULE EVERY 1 DAY
//       DO
//         DELETE FROM content
//         WHERE expireDate IS NOT NULL
//         AND expireDate < NOW();
//     `);
//     console.log('Expired content cleanup event created');
//   } catch (err) {
//     console.error('Error creating expired content cleanup event:', err);
//   }
// };


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


// const createExpiredXlsxHistoryCleanupEvent = async () => {
//   try {
//     db.query(`
//       CREATE EVENT IF NOT EXISTS delete_expired_xlsxhistory
//       ON SCHEDULE EVERY 1 MINUTE
//       DO
//         DELETE FROM xlsxhistory
//         WHERE DATE(date) = CURRENT_DATE()
//         AND endTime < CURRENT_TIME();
//     `);
//     console.log('Expired XLSX history cleanup event created');
//   } catch (err) {
//     console.error('Error creating expired XLSX history cleanup event:', err);
//   }
// };
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

// const createContentPublishingEvent = async () => {
//   try {
//     db.query(`
//       CREATE EVENT IF NOT EXISTS update_content_status
//       ON SCHEDULE EVERY 1 DAY
//       DO
//         UPDATE content
//         SET status = 'Published'
//         WHERE publishDate <= CURRENT_DATE()
//         AND status != 'Published';
//     `);
//     console.log('Content publishing event created');
//   } catch (err) {
//     console.error('Error creating content publishing event:', err);
//   }
// };

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

// const createMarketPricePublishingEvent = async () => {
//   try {
//     db.query(`
//       CREATE EVENT IF NOT EXISTS update_market_price_status
//       ON SCHEDULE EVERY 1 MINUTE
//       DO
//         UPDATE marketprice
//         SET status = 'Published'
//         WHERE date = CURRENT_DATE()
//         AND startTime <= CURRENT_TIME();
//     `);
//     console.log('Market price publishing event created');
//   } catch (err) {
//     console.error('Error creating market price publishing event:', err);
//   }
// };

module.exports = {
  createExpiredContentCleanupEvent,
  createExpiredXlsxHistoryCleanupEvent,
  createContentPublishingEvent,
  createMarketPricePublishingEvent
};