const mysql = require('mysql2');
require('dotenv').config();

// NOTE: For serverless environments, keep connectionLimit low to avoid exhausting DB connections due to multiple cold starts.
// Consider using a DB proxy or serverless-optimized library for production workloads.

const admin = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_AD,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 5,
  maxIdle: 6, 
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay : 0,
});

const plantcare = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_PC,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 5,
  maxIdle: 6, 
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay : 0,
});


const collectionofficer = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_CO,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 5,
  maxIdle: 6, 
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay : 0,
});

const marketPlace = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_MP,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 5,
  maxIdle: 6, 
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay : 0,
});


const dash = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_DS,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 5,
  maxIdle: 6, 
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay : 0,
});


module.exports = {admin, plantcare, collectionofficer, marketPlace, dash};