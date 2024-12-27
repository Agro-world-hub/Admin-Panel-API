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


const createTaskStatusEvent = () => {
    const sql = `
    CREATE EVENT IF NOT EXISTS update_task_status
        ON SCHEDULE EVERY 1 HOUR
        DO
        UPDATE slavecropcalendardays
        SET status = 'Completed'
        WHERE status = 'Pending' AND startingDate < CURDATE();
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error createTaskStatusEvent ' + err);
            } else {
                resolve('createTaskStatusEvent created successfully.');
            }
        });
    });
};




const createUserActiveStatusEvent = () => {
    const sql = `
    CREATE EVENT IF NOT EXISTS update_user_active_status
        ON SCHEDULE EVERY 1 HOUR
        DO
        BEGIN
            -- Update activeStatus to 'active' for users with a recent task
            UPDATE users u
            SET activeStatus = 'active'
            WHERE EXISTS (
                SELECT 1
                FROM slavecropcalendardays s
                WHERE s.userId = u.id
                AND s.createdAt = (
                    SELECT MAX(createdAt)
                    FROM slavecropcalendardays
                    WHERE userId = s.userId
                    AND status = 'completed'
                )
                AND s.createdAt >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
            );

            -- Update activeStatus to 'inactive' for users without a recent task
            UPDATE users u
            SET activeStatus = 'inactive'
            WHERE NOT EXISTS (
                SELECT 1
                FROM slavecropcalendardays s
                WHERE s.userId = u.id
                AND s.createdAt = (
                    SELECT MAX(createdAt)
                    FROM slavecropcalendardays
                    WHERE userId = s.userId
                    AND status = 'completed'
                )
                AND s.createdAt >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
            );
        END;
    `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error createUserActiveStatusEvent: ' + err);
            } else {
                resolve('createUserActiveStatusEvent created successfully.');
            }
        });
    });
};






module.exports = {
  createExpiredContentCleanupEvent,
  createContentPublishingEvent,
  createTaskStatusEvent,
  createUserActiveStatusEvent

};