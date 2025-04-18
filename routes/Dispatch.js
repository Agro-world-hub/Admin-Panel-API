const express = require("express");
const DispatchEP = require("../end-point/Dispatch-ep");
const bodyParser = require("body-parser");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = require("../middlewares/uploadMiddleware");
const procumentDao = require("../dao/Procuments-dao");

const path = require("path");
const fs = require("fs");
const XLSX = require('xlsx');

const router = express.Router();







router.get(
    "/get-premade-packages",
    authMiddleware,
    DispatchEP.getPreMadePackages
  );


  router.get(
    "/get-selected-packages",
    authMiddleware,
    DispatchEP.getSelectedPackages
  );

  router.get(
    "/get-package-items",
    authMiddleware,
    DispatchEP.getPackageItems
  );

  router.post(
    "/update-is-packed",
    authMiddleware,
    DispatchEP.updateIsPacked
  );

  router.get(
    "/get-custom-pack-items/:id", 
    authMiddleware, 
    DispatchEP.getCustomOrderDetailsById
);


router.post(
    '/update-custom-pack-items', 
    authMiddleware,
    DispatchEP.updateCustomPackItems);


router.get(
    "/get-additional-pack-items/:id", 
    authMiddleware, 
    DispatchEP.getPackageOrderDetailsById
);












module.exports = router;