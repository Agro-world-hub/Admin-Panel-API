const express = require('express');
const {  admin, plantcare, collectionofficer, marketPlace, dash } = require('./startup/database');
const routes = require('./routes/Admin');
const collectionOfficerRoutes = require('./routes/CollectionOfficer');
const routesNewws = require('./routes/News');
const CollectionCenterRoutes = require('./routes/CollectionCenter');
const MarketPrice = require('./routes/MarketPrice');
const MarketPlace = require('./routes/MarketPlace');
const CropCalendar = require('./routes/CropCalendar');
const Permission = require('./routes/Permission');
require('dotenv').config();
const cors = require('cors');

 

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin:'*'
})); // Enable CORS for all routes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


admin.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database in index.js (admin):', err);
    return;
  }
  console.log('Connected to the MySQL database in server.js (admin).');
  connection.release();
});

plantcare.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database in index.js (plantcare):', err);
    return;
  }
  console.log('Connected to the MySQL database in server.js (plantcare).');
  connection.release();
});

collectionofficer.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database in index.js (collectionofficer):', err);
    return;
  }
  console.log('Connected to the MySQL database in server.js.(collectionofficer)');
  connection.release();
});

marketPlace.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database in index.js (marketPlace):', err);
    return;
  }
  console.log('Connected to the MySQL database in server.js.(marketPlace)');
  connection.release();
});

dash.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database in index.js (dash):', err);
    return;
  }
  console.log('Connected to the MySQL database in server.js.(dash)');
  connection.release();
});





app.use(cors());
app.use(process.env.AUTHOR, routes);
app.use(process.env.AUTHOR, collectionOfficerRoutes);
app.use(process.env.AUTHOR, routesNewws);
app.use(process.env.AUTHOR, CollectionCenterRoutes);
app.use(process.env.MARKETPRICE, MarketPrice);
app.use('/api/market-place', MarketPlace);
app.use('/api/crop-calendar', CropCalendar);
app.use('/api/permission', Permission);
app.use('/uploads', express.static('uploads'));

app.get('/test', (req, res) => {
  res.send('Test route is working!');
  console.log('tset toute is working');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
