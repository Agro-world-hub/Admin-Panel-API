const express = require("express");
const ProcumentsEP = require("../end-point/Procuments-ep");
const bodyParser = require("body-parser");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = require("../middlewares/uploadMiddleware");

const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

const router = express.Router();




 router.get(
    "/get-received-orders",
    // authMiddleware,
    ProcumentsEP.getRecievedOrdersQuantity
  );












module.exports = router;
