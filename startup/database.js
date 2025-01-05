const mysql = require('mysql2');
require('dotenv').config();


const plantcare = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_PC,
  charset: 'utf8mb4'
});


const collectionofficer = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_CO,
  charset: 'utf8mb4'
});

const marketPlace = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_MP,
  charset: 'utf8mb4'
});


const dash = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_DS,
  charset: 'utf8mb4'
});


module.exports = {plantcare, collectionofficer, marketPlace, dash};