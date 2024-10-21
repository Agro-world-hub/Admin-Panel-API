const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB2_HOST,
  user: process.env.DB2_USER,
  password: process.env.DB2_PASSWORD,
  database: process.env.DB2_NAME,
  charset: 'utf8mb4'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database (MarketPrice):', err);
    return;
  }
  console.log('Connected to the Market Price database.');
});

module.exports = db;