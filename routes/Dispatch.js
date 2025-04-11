const express = require("express");
const ProcumentsEP = require("../end-point/Procuments-ep");
const bodyParser = require("body-parser");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = require("../middlewares/uploadMiddleware");
const procumentDao = require("../dao/Procuments-dao");

const path = require("path");
const fs = require("fs");
const XLSX = require('xlsx');

const router = express.Router();




















module.exports = router;