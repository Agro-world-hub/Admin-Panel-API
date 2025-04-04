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
const ComplainCategory = require('./routes/ComplainCategory');
const Stakeholder = require('./routes/stakeholder');
const SalesAgentDash = require('./routes/SalesAgentDash');
const TargetRoutes  =require('./routes/Target');


const heathRoutes = require('./routes/heathRoutes')
const DashRoutes = require('./routes/Dash')
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
  console.log('Connected to the MySQL database in server.js (admin).  ✅  ');
  connection.release();
});

plantcare.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database in index.js (plantcare):', err);
    return;
  }
  console.log('Connected to the MySQL database in server.js (plantcare).  ✅  ');
  connection.release();
});

collectionofficer.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database in index.js (collectionofficer):', err);
    return;
  }
  console.log('Connected to the MySQL database in server.js.(collectionofficer)  ✅  ');
  connection.release();
});

marketPlace.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database in index.js (marketPlace):', err);
    return;
  }
  console.log('Connected to the MySQL database in server.js.(marketPlace)  ✅  ');
  connection.release();
});

dash.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database in index.js (dash):', err);
    return;
  }
  console.log('Connected to the MySQL database in server.js.(dash)  ✅  ');
  connection.release();
});

// Add base path for all routes
const BASE_PATH = '/agro-api/admin-api';

app.use("", heathRoutes);
app.use(cors());
app.use(BASE_PATH + process.env.AUTHOR, routes);

app.use(BASE_PATH + process.env.AUTHOR, collectionOfficerRoutes);
app.use(BASE_PATH + process.env.AUTHOR, routesNewws);
app.use(BASE_PATH + process.env.AUTHOR, CollectionCenterRoutes);
app.use(BASE_PATH + process.env.MARKETPRICE, MarketPrice);
app.use(BASE_PATH + '/api/market-place', MarketPlace);
app.use(BASE_PATH + '/api/crop-calendar', CropCalendar);
app.use(BASE_PATH + '/api/permission', Permission);
app.use(BASE_PATH + '/api/complain', ComplainCategory);
app.use(BASE_PATH + '/api/stakeholder', Stakeholder);
app.use(BASE_PATH + '/api/sales-agent-dash', SalesAgentDash);
app.use(BASE_PATH + '/api/dash', DashRoutes);
app.use(BASE_PATH + '/api/target', TargetRoutes)



app.use('/uploads', express.static('uploads'));

app.get(BASE_PATH + '/test', (req, res) => {
  res.send('Test route is working!');
  console.log('test route is working');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
