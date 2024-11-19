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
const db = require('../startup/database'); // Adjust this to your database connection
const XLSX = require('xlsx');


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



const getCropVarietyData = () => {
    const sql = `
      SELECT 
        cropgroup.cropNameEnglish AS cropName,
        cropvariety.varietyNameEnglish AS varietyName,
        cropvariety.id AS varietyId
      FROM 
        cropvariety
      JOIN 
        cropgroup ON cropvariety.cropGroupId = cropgroup.id
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  };
  
  // API to download the Excel file
  router.get('/download-crop-data', async (req, res) => {
    try {
      // Fetch data from the database
      const data = await getCropVarietyData();
  
      // Format data for Excel
      const formattedData = data.map(item => ({
        'Crop Name' : item.cropName,
        'Variety Name' : item.varietyName,
        'Variety Id' : item.varietyId,
        'Grade A Price' : '',
        'Grade B Price' : '',
        'Grade C Price' : '',
      }));
  
      // Create a worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'CropData');
  
      // Write the workbook to a buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
      // Set headers for file download
      res.setHeader('Content-Disposition', 'attachment; filename="CropData.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      // Send the file to the client
      res.send(excelBuffer);
    } catch (err) {
      console.error('Error generating Excel file:', err);
      res.status(500).send('An error occurred while generating the file.');
    }
  });

module.exports = router;