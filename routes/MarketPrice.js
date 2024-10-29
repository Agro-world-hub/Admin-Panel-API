const express = require("express");
const MarketPriceEp = require("../end-point/MarketPrice-ep");
const bodyParser = require("body-parser");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = require("../middlewares/uploadMiddleware");
// const upload = multer({ storage: multer.memoryStorage() });
const uploadfile = multer({ dest: 'uploads/' });
const path = require("path");
const fs = require('fs');
const xlsx = require('xlsx');

const router = express.Router();

router.post(
    "/upload-market-price-xlsx",
    authMiddleware,
    uploadfile.single("file"),
    MarketPriceEp.createMarketPriceXLSX
);

router.get(
    "/get-all-market-xlsx",
     authMiddleware, 
     MarketPriceEp.getAllxlsxlist
    );

router.delete(
    "/delete-xl-file/:id",
    authMiddleware,
    MarketPriceEp.deleteXl
);

router.get('/download/:fileName', MarketPriceEp.downloadXLSXFile);

router.get(
    "/get-market-prices",
    authMiddleware,
    MarketPriceEp.getAllMarketPrice
)

router.get(
    "/get-all-crop-name",
    authMiddleware,
    MarketPriceEp.getAllCropName
)

module.exports = router;