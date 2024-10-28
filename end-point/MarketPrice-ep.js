const marketPriceDao = require('../dao/marketPrice-dao');
const xlsx = require('xlsx');
const path = require('path');


exports.createMarketPriceXLSX = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(`Full request URL: ${fullUrl}`);

  try {
    const { xlName, createdBy, date, startTime, endTime } = req.body;

    // Step 1: Insert XLSX history and get the xlindex
    const xlindex = await marketPriceDao.createxlhistory(xlName);

    // Step 2: Validate if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    console.log('File received:', req.file.originalname);

    // Step 3: Validate the file type (must be .xlsx or .xls)
    const allowedExtensions = [".xlsx", ".xls"];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        error: "Invalid file type. Only XLSX and XLS files are allowed.",
      });
    }
    console.log('File type validated:', fileExtension);

    // Step 4: Read the XLSX file
    let workbook;
    try {
      if (req.file.buffer) {
        // If file buffer exists, read from buffer
        workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      } else if (req.file.path) {
        // If file path exists, read from file path
        workbook = xlsx.readFile(req.file.path);
      } else {
        throw new Error("Neither file buffer nor path is available for reading.");
      }
    } catch (error) {
      console.error("Error reading XLSX file:", error);
      return res.status(400).json({
        error: "Unable to read the uploaded file. Ensure it's a valid XLSX or XLS file.",
      });
    }
    console.log('File successfully read.');

    // Step 5: Validate the workbook structure
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res.status(400).json({ error: "The uploaded file is empty or invalid." });
    }

    // Step 6: Extract data from the first sheet
    const sheetName = workbook.SheetNames[0]; // Using the first sheet
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Validate the data structure, including the date
    if (data.length === 0) {
      return res.status(400).json({ error: "The uploaded file contains no valid data." });
    }

    console.log(`Data extracted from XLSX: ${data.length} rows`);

    // Step 7: Check if the date field is present in the data
    const extractedDate = data[0]['Date']; // Assuming 'Date' is the column name in XLSX

    // Validate the extracted date (customize this logic as per your needs)
    if (!extractedDate || isNaN(Date.parse(extractedDate))) {
      return res.status(400).json({ error: "Invalid or missing 'Date' field in the XLSX file." });
    }
    
    console.log(`Date extracted from XLSX: ${extractedDate}`);

    // Step 8: Insert market price data using xlindex and the extracted date
    const marketPriceResult = await marketPriceDao.insertMarketPriceXLSXData(xlindex, data, createdBy, date, startTime, endTime);
    console.log('Market price data successfully inserted.');

    // Step 9: Respond with success message
    return res.status(200).json({
      message: "File uploaded and data inserted successfully",
      xlindex,
      marketPriceResult,
    });
  } catch (error) {
    console.error("Error processing XLSX file:", error);
    res.status(500).json({ error: "An error occurred while processing the XLSX file. Please try again." });
  }
};



//get all market price
exports.getAllMarketPrice = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const {page, limit,crop,grade} = req.query
    console.log(page, limit,crop,grade);
    const offset = (page - 1) * limit;
    

      const {results,total} = await marketPriceDao.getAllMarketPriceDAO(limit, offset, crop, grade);
      console.log(results,total);
      

      console.log("Successfully fetched marcket price");
      return res.status(200).json({results,total});
  } catch (error) {
      if (error.isJoi) {
          // Handle validation error
          return res.status(400).json({ error: error.details[0].message });
      }

      console.error("Error fetching collection officers:", error);
      return res.status(500).json({ error: "An error occurred while fetching collection officers" });
  }
};


exports.getAllCropName = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {

      const result = await marketPriceDao.getAllCropNameDAO();

      console.log("Successfully fetched marcket price");
      return res.status(200).json(result);
  } catch (error) {
      if (error.isJoi) {
          // Handle validation error
          return res.status(400).json({ error: error.details[0].message });
      }

      console.error("Error fetching collection officers:", error);
      return res.status(500).json({ error: "An error occurred while fetching collection officers" });
  }
};
