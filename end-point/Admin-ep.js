const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { log } = require("console");
const adminDao = require("../dao/Admin-dao");
const ValidateSchema = require("../validations/Admin-validation");
const { type } = require("os");

exports.loginAdmin = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    await ValidateSchema.loginAdminSchema.validateAsync(req.body);

    const { email, password } = req.body;

    const [user] = await adminDao.loginAdmin(email);
    if (user && user.password === password) {
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "5h" }
      );
      const data = {
        token,
        userId: user.id,
        role: user.role,
        userName: user.userName,
      };
      res.json(data);
    } else {
      res.status(401).json({ error: "Invalid email or password." });
    }
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ error: "An error occurred during login." });
  }
};

exports.getAllAdminUsers = async (req, res) => {
  try {
    const { page, limit } =
      await ValidateSchema.getAllAdminUsersSchema.validateAsync(req.query);
    const offset = (page - 1) * limit;

    const { total, items } = await adminDao.getAllAdminUsers(limit, offset);

    console.log("Successfully fetched admin users");
    res.json({
      items,
      total,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};

exports.getMe = (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  const userId = req.user.userId;
  const sql = "SELECT id, mail, userName, role FROM adminusers WHERE id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching user details." });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    const user = results[0];
    console.log("Fetch user success");
    res.json({
      id: user.id,
      userName: user.userName,
      mail: user.mail,
      role: user.role,
      password: user.password,
    });
  });
};

exports.adminCreateUser = async (req, res) => {
  try {
    // Validate the request body
    const { firstName, lastName, phoneNumber, NICnumber } =
      await ValidateSchema.adminCreateUserSchema.validateAsync(req.body);

    const results = await adminDao.adminCreateUser(
      firstName,
      lastName,
      phoneNumber,
      NICnumber
    );

    console.log("User create success");
    return res.status(200).json(results);
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while Creating User" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page, limit, nic } =
      await ValidateSchema.getAllUsersSchema.validateAsync(req.query);
    const offset = (page - 1) * limit;

    const { total, items } = await adminDao.getAllUsers(limit, offset, nic);

    console.log("Successfully fetched users");
    res.json({
      items,
      total,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};

exports.createCropCallender = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    // Validate the request body

    const {
      cropName,
      sinhalaCropName,
      tamilCropName,
      variety,
      sinhalaVariety,
      tamilVariety,
      cultivationMethod,
      natureOfCultivation,
      cropDuration,
      cropCategory,
      specialNotes,
      sinhalaSpecialNotes,
      tamilSpecialNotes,
      suitableAreas,
      cropColor,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;

    const cropId = await adminDao.createCropCallender(
      cropName,
      sinhalaCropName,
      tamilCropName,
      variety,
      sinhalaVariety,
      tamilVariety,
      cultivationMethod,
      natureOfCultivation,
      cropDuration,
      cropCategory,
      specialNotes,
      sinhalaSpecialNotes,
      tamilSpecialNotes,
      suitableAreas,
      cropColor,
      fileBuffer
    );

    console.log("Crop Calendar creation success");
    return res.status(200).json({ cropId: cropId });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating Crop Calendar" });
  }
};

exports.uploadXLSX = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID parameter
    await ValidateSchema.uploadXLSXSchema.validateAsync({ id });

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    console.log("File details:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path, // Log the path if it exists
      buffer: req.file.buffer ? "Buffer exists" : "Buffer is undefined",
    });

    // Validate file type
    const allowedExtensions = [".xlsx", ".xls"];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        error: "Invalid file type. Only XLSX and XLS files are allowed.",
      });
    }

    // Read the XLSX file
    let workbook;
    try {
      if (req.file.buffer) {
        // If buffer exists, read from buffer
        workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      } else if (req.file.path) {
        // If path exists, read from file
        workbook = xlsx.readFile(req.file.path);
      } else {
        throw new Error("Neither file buffer nor path is available");
      }
    } catch (error) {
      console.error("Error reading XLSX file:", error);
      return res.status(400).json({
        error:
          "Unable to read the uploaded file. Please ensure it's a valid XLSX or XLS file.",
      });
    }

    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res
        .status(400)
        .json({ error: "The uploaded file is empty or invalid." });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Validate data structure
    if (data.length === 0) {
      return res
        .status(400)
        .json({ error: "The uploaded file contains no valid data." });
    }

    console.log("First row of data:", data[0]);

    // Insert data into the database via DAO
    const rowsAffected = await adminDao.insertXLSXData(id, data);

    // Respond with success
    return res.status(200).json({
      message: "File uploaded and data inserted successfully",
      rowsAffected,
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }
    console.error("Error processing XLSX file:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the XLSX file." });
  }
};

exports.getAllCropCalender = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    const { page, limit } =
      await ValidateSchema.getAllCropCalendarSchema.validateAsync(req.query);
    const offset = (page - 1) * limit;

    const { total, items } = await adminDao.getAllCropCalendars(limit, offset);

    console.log("Successfully fetched crop caledars");
    res.json({
      items,
      total,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};

exports.createOngoingCultivations = async (req, res) => {
  try {
    // Validate the request body
    const { userId, cropCalenderId } =
      await ValidateSchema.createOngoingCultivationsSchema.validateAsync(
        req.body
      );

    const results = await adminDao.createOngoingCultivations(
      userId,
      cropCalenderId
    );

    console.log("Ongoing cultivation create success");
    return res.status(200).json(results);
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while Creating Ongoing cultivation" });
  }
};

exports.createNews = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the request body
    const {
      titleEnglish,
      titleSinhala,
      titleTamil,
      descriptionEnglish,
      descriptionSinhala,
      descriptionTamil,
      status,
      createdBy,
    } = await ValidateSchema.createNewsSchema.validateAsync(req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get file buffer (binary data)
    const fileBuffer = req.file.buffer;

    // Call DAO to save news and the image file as longblob
    const newsId = await adminDao.createNews(
      titleEnglish,
      titleSinhala,
      titleTamil,
      descriptionEnglish,
      descriptionSinhala,
      descriptionTamil,
      fileBuffer, // pass the file buffer
      status,
      createdBy
    );

    console.log("News creation success");
    return res
      .status(201)
      .json({ message: "News created successfully", id: newsId });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating News" });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    console.log("Received request with query:", req.query);

    // Validate query parameters
    const { page, limit, status, createdAt } =
      await ValidateSchema.getAllNewsSchema.validateAsync(req.query);

    const offset = (page - 1) * limit;

    const result = await adminDao.getAllNews(status, createdAt, limit, offset);

    if (result.items.length === 0) {
      return res
        .status(404)
        .json({ message: "No news items found", data: result });
    }

    console.log("Successfully retrieved all contents");
    res.json(result);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      console.error("Validation error:", err.details[0].message);
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching news:", err);
    res.status(500).json({ error: "An error occurred while fetching news" });
  }
};

exports.deleteCropCalender = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the request parameters
    const { id } = await ValidateSchema.deleteCropCalenderSchema.validateAsync(
      req.params
    );

    const affectedRows = await adminDao.deleteCropCalender(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Crop Calendar not found" });
    } else {
      console.log("Crop Calendar deleted successfully");
      return res.status(200).json({ status: true });
    }
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error deleting crop calendar:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting crop calendar" });
  }
};

// Controller method (endpoint handler)
exports.editCropCalender = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate the request body
    const updateData = req.body;
    const { id } = req.params;

    // Handle file upload if present
    let imageData = null;
    if (req.file) {
      imageData = req.file.buffer; // Store the binary image data from req.file
    }

    // Update the crop calendar
    const affectedRows = await adminDao.updateCropCalender(
      id,
      updateData,
      imageData
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Crop Calendar not found" });
    } else {
      console.log("Crop Calendar updated successfully");
      return res
        .status(200)
        .json({ message: "Crop Calendar updated successfully" });
    }
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error updating crop calendar:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the crop calendar" });
  }
};

exports.createCropCalenderAddTask = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    // Validate request body
    const { cropId, tasks } =
      await ValidateSchema.createCropCalenderTaskSchema.validateAsync(req.body);

    // Call DAO to insert the tasks
    const result = await adminDao.createCropCalenderTasks(cropId, tasks);

    console.log("Crop Calendar tasks creation success");
    return res.status(200).json(result);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating Crop Calendar tasks" });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    // Validate the ID parameter
    const { id } = await ValidateSchema.getNewsByIdSchema.validateAsync(
      req.params
    );

    // Call the DAO to get the news item by ID
    const news = await adminDao.getNewsById(id);

    if (news.length === 0) {
      return res.status(404).json({ message: "News not found" });
    }

    // Convert image buffer to base64 string if image exists
    if (news[0].image) {
      const base64Image = Buffer.from(news[0].image).toString("base64");
      const mimeType = "image/png"; // Adjust MIME type if necessary, depending on the image type
      news[0].image = `data:${mimeType};base64,${base64Image}`;
    }

    console.log("Successfully fetched the news content");
    return res.status(200).json(news);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the news content" });
  }
};

exports.getCropCalenderById = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    // Validate the ID parameter
    const { id } = await ValidateSchema.getCropCalenderByIdSchema.validateAsync(
      req.params
    );

    // Call the DAO to get crop calendar by ID
    const cropCalender = await adminDao.getCropCalenderById(id);

    if (cropCalender.length === 0) {
      return res.status(404).json({ message: "Crop Calendar not found" });
    }

    if (cropCalender[0].image) {
      const base64Image = Buffer.from(cropCalender[0].image).toString("base64");
      const mimeType = "image/png"; // Adjust MIME type if necessary, depending on the image type
      cropCalender[0].image = `data:${mimeType};base64,${base64Image}`;
    }

    console.log("Successfully fetched the crop calendar data");
    return res.status(200).json(cropCalender);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the crop calendar" });
  }
};

exports.editNewsStatus = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the `id` parameter
    const { id } = await ValidateSchema.editNewsStatusSchema.validateAsync(
      req.params
    );

    // Retrieve the current status from the DAO
    const result = await adminDao.getNewsStatusById(id);

    if (result.length === 0) {
      return res.status(404).json({ error: "Content not found" });
    }

    const currentStatus = result[0].status;

    let newStatus;
    if (currentStatus === "Draft") {
      newStatus = "Published";
    } else if (currentStatus === "Published") {
      newStatus = "Draft";
    } else {
      return res.status(400).json({ error: "Invalid current status" });
    }

    // Update the status using the DAO
    await adminDao.updateNewsStatusById(id, newStatus);

    console.log("Status updated successfully");
    return res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the status" });
  }
};

exports.createMarketPrice = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the request body
    const {
      titleEnglish,
      titleSinhala,
      titleTamil,
      descriptionEnglish,
      descriptionSinhala,
      descriptionTamil,
      status,
      price,
      createdBy,
    } = await ValidateSchema.createMarketPriceSchema.validateAsync(req.body);

    // Check if the file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;

    // Call the DAO to create the market price entry
    const insertId = await adminDao.createMarketPrice(
      titleEnglish,
      titleSinhala,
      titleTamil,
      descriptionEnglish,
      descriptionSinhala,
      descriptionTamil,
      fileBuffer,
      status,
      price,
      createdBy
    );

    console.log("Market price created successfully");
    return res.status(201).json({
      message: "Market price created successfully",
      id: insertId,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing request:", err);
    return res.status(500).json({
      error: "An error occurred while creating the market price",
    });
  }
};

exports.getAllMarketPrice = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate query parameters
    const {
      page = 1,
      limit = 10,
      status,
      createdAt,
    } = await ValidateSchema.getAllMarketPriceSchema.validateAsync(req.query);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch data from the DAO
    const { total, dataResults } = await adminDao.getAllMarketPrice(
      status,
      createdAt,
      limit,
      offset
    );

    console.log("Successfully fetched market prices");
    return res.json({
      items: dataResults,
      total: total,
      page: page,
      limit: limit,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching market prices:", err);
    return res.status(500).json({
      error: "An error occurred while fetching market prices",
    });
  }
};

exports.deleteMarketPrice = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate request parameters
    const { id } = await ValidateSchema.deleteMarketPriceSchema.validateAsync(
      req.params
    );

    // Call the DAO to delete the market price
    const result = await adminDao.deleteMarketPriceById(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Market price not found" });
    }

    console.log("Market price deleted successfully");
    return res
      .status(200)
      .json({ message: "Market price deleted successfully" });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error deleting market price:", err);
    return res.status(500).json({
      error: "An error occurred while deleting market price",
    });
  }
};

exports.editMarketPriceStatus = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the `id` parameter
    const { id } =
      await ValidateSchema.editMarketPriceStatusSchema.validateAsync(
        req.params
      );

    // Fetch the current status of the market price
    const result = await adminDao.getMarketPriceStatusById(id);

    if (result.length === 0) {
      return res.status(404).json({ error: "Market price not found" });
    }

    const currentStatus = result[0].status;
    let newStatus;

    // Toggle between 'Draft' and 'Published'
    if (currentStatus === "Draft") {
      newStatus = "Published";
    } else if (currentStatus === "Published") {
      newStatus = "Draft";
    } else {
      return res.status(400).json({ error: "Invalid current status" });
    }

    // Update the status using the DAO
    await adminDao.updateMarketPriceStatusById(id, newStatus);

    console.log("Status updated successfully");
    return res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error updating market price status:", err);
    return res.status(500).json({
      error: "An error occurred while updating the market price status",
    });
  }
};

exports.getMarketPriceById = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the `id` parameter
    const { id } = await ValidateSchema.getMarketPriceByIdSchema.validateAsync(
      req.params
    );

    // Fetch market price data by ID
    const result = await adminDao.getMarketPriceById(id);

    if (result.length === 0) {
      return res.status(404).json({ error: "Market price not found" });
    }
    if (result[0].image) {
      const base64Image = Buffer.from(result[0].image).toString("base64");
      const mimeType = "image/png"; // Adjust MIME type if necessary, depending on the image type
      result[0].image = `data:${mimeType};base64,${base64Image}`;
    }

    console.log("Successfully fetched market price");
    return res.status(200).json(result);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching market price:", err);
    return res.status(500).json({
      error: "An error occurred while fetching the market price",
    });
  }
};

exports.editMarketPrice = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate input data
    const { id } = req.params;
    const body = await ValidateSchema.editMarketPriceSchema.validateAsync({
      ...req.body,
      id,
    });

    let imageData = null;
    if (req.file) {
      imageData = req.file.buffer; // Store the binary image data from req.file
    }

    // Call DAO to update the market price
    const updateData = {
      ...body,
      imageData,
    };

    await adminDao.editMarketPrice(id, updateData);

    console.log("Market price updated successfully");
    return res
      .status(200)
      .json({ message: "Market price updated successfully" });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error updating market price:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while updating market price" });
  }
};

exports.getAllOngoingCultivations = async (req, res) => {
  try {
    // Validate query parameters
    const queryParams =
      await ValidateSchema.getAllOngoingCultivationsSchema.validateAsync(
        req.query
      );

    const page = queryParams.page;
    const limit = queryParams.limit;
    const offset = (page - 1) * limit;
    const searchNIC = queryParams.nic || "";

    // Call DAO to fetch the cultivations
    const { total, items } = await adminDao.getAllOngoingCultivations(
      searchNIC,
      limit,
      offset
    );

    console.log("Successfully fetched ongoing cultivations");
    res.json({
      total,
      items,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching ongoing cultivations:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};

exports.getOngoingCultivationsWithUserDetails = async (req, res) => {
  try {
    // Validate the request
    await ValidateSchema.getOngoingCultivationsWithUserDetailsSchema.validateAsync(
      req.query
    );

    // Fetch cultivations with user details from DAO
    const results = await adminDao.getOngoingCultivationsWithUserDetails();

    console.log("Successfully fetched ongoing cultivations with user details");
    res.status(200).json({
      items: results,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching ongoing cultivations:", err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
};

exports.getOngoingCultivationsById = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate the request params (ID)
    const { id } =
      await ValidateSchema.getOngoingCultivationsByIdSchema.validateAsync(
        req.params
      );

    // Fetch cultivation crops data from DAO
    const results = await adminDao.getOngoingCultivationsById(id);

    console.log("Successfully fetched cultivation crops by ID");
    res.status(200).json(results);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching cultivation crops:", err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
};

exports.getFixedAssetsByCategory = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate the request params (id and category)
    const { id, category } =
      await ValidateSchema.getFixedAssetsByCategorySchema.validateAsync(
        req.params
      );

    // Fetch assets by category from DAO
    const results = await adminDao.getFixedAssetsByCategory(id, category);

    console.log("Successfully retrieved assets");
    res.status(200).json(results);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    } else if (err === "Invalid category.") {
      return res.status(400).json({ error: "Invalid category." });
    }

    console.error("Error fetching assets:", err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
};

exports.getCurrentAssetsByCategory = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate the request params (id and category)
    const { id, category } = req.params;
    // const { id, category } =
    // await ValidateSchema.getCurrentAssetsByCategorySchema.validateAsync(
    //     req.params
    // );

    // Fetch current assets by category from DAO
    const results = await adminDao.getCurrentAssetsByCategory(id, category);

    console.log("Successfully retrieved current assets");
    res.status(200).json(results);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching current assets:", err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
};

exports.deleteAdminUser = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate the request parameters (id)
    const { id } = await ValidateSchema.deleteAdminUserSchema.validateAsync(
      req.params
    );

    // Delete admin user by id from DAO
    const results = await adminDao.deleteAdminUserById(id);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    console.log("Admin user deleted successfully");
    return res.status(200).json({ message: "Admin user deleted successfully" });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error deleting admin user:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting admin user" });
  }
};

exports.editAdminUser = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  const { id } = req.params;

  try {
    const { mail, userName, role } = req.body;

    // Update admin user in the DAO
    const results = await adminDao.updateAdminUserById(
      id,
      mail,
      userName,
      role
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    console.log("Admin user updated successfully");
    return res.status(200).json({ message: "Admin user updated successfully" });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error updating admin user:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while updating admin user" });
  }
};

exports.editAdminUserWithoutId = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate the request body
    const { id, mail, userName, role } =
      await ValidateSchema.editAdminUserWithoutIdSchema.validateAsync(req.body);

    // Call DAO to update the user
    const results = await adminDao.updateAdminUser(id, mail, userName, role);

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "No admin user found with the provided ID" });
    }

    console.log("Admin user updated successfully");
    return res.status(200).json({ message: "Admin user updated successfully" });
  } catch (err) {
    if (err.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error updating admin user:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while updating admin user" });
  }
};

exports.getAdminById = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    // Validate request params
    const { id } = await ValidateSchema.getAdminByIdSchema.validateAsync(
      req.params
    );

    // Fetch admin user from DAO
    const results = await adminDao.getAdminUserById(id);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "No admin user found with the provided ID" });
    }

    console.log("Successfully retrieved admin user");
    return res.json(results);
  } catch (err) {
    if (err.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching admin user:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching admin user" });
  }
};

exports.editAdminUserPassword = async (req, res) => {
  try {
    // Validate the request body
    const { id, currentPassword, newPassword } =
      await ValidateSchema.editAdminUserPasswordSchema.validateAsync(req.body);

    // Retrieve the current password from the DAO
    const passwordResults = await adminDao.getAdminPasswordById(id);

    if (passwordResults.length === 0) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    const existingPassword = passwordResults[0].password;

    // Check if the provided current password matches the existing password
    if (existingPassword !== currentPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Update the password using the DAO
    await adminDao.updateAdminPasswordById(id, newPassword);

    console.log("Password updated successfully");
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    if (err.isJoi) {
      // Handle validation errors
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error updating password:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the password" });
  }
};

exports.deletePlantCareUser = async (req, res) => {
  try {
    const { id } = await ValidateSchema.deletePlantCareUserSchema.validateAsync(
      req.params
    );

    const result = await adminDao.deletePlantCareUserById(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "PlantCare User not found" });
    }

    console.log("PlantCare User deleted successfully");
    return res
      .status(200)
      .json({ status: true, message: "PlantCare User deleted successfully" });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error deleting PlantCare user:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting PlantCare User" });
  }
};

exports.updatePlantCareUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate input data
    const validatedBody =
      await ValidateSchema.updatePlantCareUserSchema.validateAsync(req.body);
    const { firstName, lastName, phoneNumber, NICnumber } = validatedBody;

    // Handle image upload if file is provided

    let imageData = null;
    if (req.file) {
      imageData = req.file.buffer; // Store the binary image data from req.file
    }

    const userData = { firstName, lastName, phoneNumber, NICnumber, imageData };

    // Call DAO to update the user
    const result = await adminDao.updatePlantCareUserById(userData, id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "PlantCare User not found" });
    }

    console.log("PlantCare User updated successfully");
    return res
      .status(200)
      .json({ message: "PlantCare User updated successfully" });
  } catch (error) {
    if (error.isJoi) {
      // Validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error updating PlantCare User:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating PlantCare User" });
  }
};

exports.createPlantCareUser = async (req, res) => {
  try {
    // Validate input data
    const validatedBody = req.body;
    const { firstName, lastName, phoneNumber, NICnumber } = validatedBody;

    // Ensure a file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;

    const userData = {
      firstName,
      lastName,
      phoneNumber,
      NICnumber,
      fileBuffer,
    };

    // Call DAO to create the user
    const userId = await adminDao.createPlantCareUser(userData);

    console.log("PlantCare user created successfully");
    return res.status(201).json({
      message: "PlantCare user created successfully",
      id: userId,
    });
  } catch (error) {
    if (error.isJoi) {
      // Validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error creating PlantCare user:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating PlantCare user" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    // Validate the request params
    const validatedParams =
      await ValidateSchema.getUserByIdSchema.validateAsync(req.params);
    const { id } = validatedParams;

    // Fetch the user from the DAO
    const user = await adminDao.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User retrieved successfullyyyy");
    return res.status(200).json(user);
  } catch (error) {
    if (error.isJoi) {
      // Validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error retrieving user:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching user" });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    // Validate the request body
    const validatedBody = req.body;

    // Create admin data in the database
    const result = await adminDao.createAdmin(validatedBody);

    console.log("Admin created successfully");
    return res.status(201).json({
      message: "Admin user created successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (error.isJoi) {
      // Validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error creating admin:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating admin user" });
  }
};

// exports.getTotalFixedAssetValue = (req, res) => {
//     const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
//     console.log(fullUrl);
//     const { id } = req.params;

//     const sql = `SELECT SUM(price) AS total_price FROM fixedasset WHERE userId  = ?`;
//     const values = [id];
//     db.query(sql, values, (err, results) => {
//         if (err) {
//             console.error("Error executing query:", err);
//             res.status(500).send("An error occurred while fetching data.");
//             return;
//         }
//         console.log("Successfully get Total assets");
//         res.json(results);
//         console.log("");
//     });
// };

//Report current assert --- get-assert-using-catogort-userid
exports.getCurrentAssertGroup = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate the request parameters (userId)
    const validatedParams =
      await ValidateSchema.getCurrentAssetGroupSchema.validateAsync(req.params);

    // Fetch data from the DAO
    const results = await adminDao.getCurrentAssetGroup(validatedParams.id);

    console.log(
      "Successfully retrieved total current assets grouped by category"
    );
    res.json(results);
  } catch (error) {
    if (error.isJoi) {
      // If validation error occurs
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching current assets:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching current assets" });
  }
};

exports.getCurrentAssetRecordById = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate request parameters (currentAssetId)
    const validatedParams =
      await ValidateSchema.getCurrentAssetRecordByIdSchema.validateAsync(
        req.params
      );

    // Fetch the data from the DAO
    const results = await adminDao.getCurrentAssetRecordById(
      validatedParams.id
    );

    console.log("Successfully retrieved current asset record");
    res.json(results);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching current asset record:", error);
    return res.status(500).json({
      error: "An error occurred while fetching the current asset record",
    });
  }
};

//get all task of crop
exports.getAllTaskByCropId = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate request parameters (cropId)
    const validatedParams =
      await ValidateSchema.getAllTaskByCropIdSchema.validateAsync(req.params);

    // Fetch the data from the DAO
    const results = await adminDao.getAllTaskByCropId(validatedParams.id);

    console.log(
      "Successfully retrieved all tasks for crop ID:",
      validatedParams.id
    );
    res.json(results);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching tasks for crop ID:", error);
    return res.status(500).json({
      error: "An error occurred while fetching tasks for the crop ID",
    });
  }
};

//delete crop task
exports.deleteCropTask = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate request parameters (taskId)
    // const validatedParams =
    //   await ValidateSchema.deleteCropTaskSchema.validateAsync(req.params);
    const id = req.params.id
    const cropId = req.params.cropId;
    const indexId = parseInt(req.params.indexId);

    // Fetch the data from the DAO
    const results = await adminDao.deleteCropTask(id);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Crop Calendar task not found" });
    }

    const taskIdArr = await adminDao.getAllTaskIdDao(cropId);
    console.log("Task array:", taskIdArr);

    for (let i = 0; i < taskIdArr.length; i++) {
      const existingTask = taskIdArr[i];

      if (existingTask.taskIndex > indexId) {
        console.log(
          `Updating task ${existingTask.id}, current taskIndex: ${existingTask.taskIndex}`
        );
        await adminDao.shiftUpTaskIndexDao(
          existingTask.id,
          existingTask.taskIndex - 1
        );
      }
    }

    console.log("Crop Calendar task deleted successfully");
    res.status(200).json({ status: true });
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error deleting crop task:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the crop task" });
  }
};

exports.getCropCalendarDayById = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate request parameters (id)
    const validatedParams =
      await ValidateSchema.getCropCalendarDayByIdSchema.validateAsync(
        req.params
      );

    // Fetch the data from the DAO
    const result = await adminDao.getCropCalendarDayById(validatedParams.id);

    if (!result) {
      return res
        .status(404)
        .json({ message: "No record found with the given ID" });
    }

    console.log("Successfully retrieved task by ID");
    res.status(200).json(result);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching crop task:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the crop task" });
  }
};

exports.editTask = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);
  console.log("Update task", req.body);

  const id = req.params.id;
  console.log(id);

  try {
    const validatedParams = req.body;

    // Call DAO to update task
    const result = await adminDao.editTask(
      validatedParams.taskEnglish,
      validatedParams.taskSinhala,
      validatedParams.taskTamil,
      validatedParams.taskTypeEnglish,
      validatedParams.taskTypeSinhala,
      validatedParams.taskTypeTamil,
      validatedParams.taskCategoryEnglish,
      validatedParams.taskCategorySinhala,
      validatedParams.taskCategoryTamil,
      validatedParams.taskDescriptionEnglish,
      validatedParams.taskDescriptionSinhala,
      validatedParams.taskDescriptionTamil,
      validatedParams.id
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("Task updated successfully");
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error updating task:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating task" });
  }
};

exports.getAllUsersTaskByCropId = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate request parameters (cropId)
    const { cropId } = req.params;
    const { userId } = req.params;

    console.log(cropId);
    console.log(userId);
    const results = await adminDao.getAllUserTaskByCropId(cropId, userId);

    res.json(results);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching tasks for crop ID:", error);
    return res.status(500).json({
      error: "An error occurred while fetching tasks for the crop ID",
    });
  }
};

exports.deleteUserTask = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate the request parameters (id)
    const { id } = req.params;

    // Delete admin user by id from DAO
    const results = await adminDao.deleteUserTasks(id);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User task not found" });
    }

    console.log("User task deleted successfully");
    return res.status(200).json({ message: "User task deleted successfully" });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error deleting User task:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting User task" });
  }
};

exports.editUserTaskStatus = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the `id` parameter
    const { id } =
      await ValidateSchema.editMarketPriceStatusSchema.validateAsync(
        req.params
      );

    // Fetch the current status of the market price
    const result = await adminDao.getUserTaskStatusById(id);

    if (result.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const currentStatus = result[0].status;
    let newStatus;

    // Toggle between 'Draft' and 'Published'
    if (currentStatus === "Pending") {
      newStatus = "Completed";
    } else if (currentStatus === "Completed") {
      newStatus = "Pending";
    } else {
      return res.status(400).json({ error: "Invalid current status" });
    }

    // Update the status using the DAO
    await adminDao.updateUserTaskStatusById(id, newStatus);

    console.log("Status updated successfully");
    return res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error updating Task status:", err);
    return res.status(500).json({
      error: "An error occurred while updating the Task status",
    });
  }
};

exports.getSlaveCropCalendarDayById = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate request parameters (id)
    const validatedParams =
      await ValidateSchema.getCropCalendarDayByIdSchema.validateAsync(
        req.params
      );

    // Fetch the data from the DAO
    const result = await adminDao.getSlaveCropCalendarDayById(
      validatedParams.id
    );

    if (!result) {
      return res
        .status(404)
        .json({ message: "No record found with the given ID" });
    }

    console.log("Successfully retrieved task by ID");
    res.status(200).json(result);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching crop task:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the crop task" });
  }
};

//get each post reply

exports.getAllReplyByPost = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    const postId = req.params.postId;

    const results = await adminDao.getAllPostReplyDao(postId);

    res.json(results);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching tasks for crop ID:", error);
    return res.status(500).json({
      error: "An error occurred while fetching tasks for the crop ID",
    });
  }
};

exports.DeletPublicForumPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const results = await adminDao.deletePublicForumPost(postId);
    if (results.affectedRows === 1) {
      console.log("Delete");
      res.json({ status: true });
    } else {
      res.json({ status: false })
    }
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message })
    }
    console.error("Error fetching post for post ID:", error);
    return res.status(500).json({
      error: "An error occurred while fetching post for the postID"
    });
  }
};

exports.DeleteReply = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    const postId = req.params.postId;

    const results = await adminDao.deleteReply(postId);
    if (results.affectedRows === 1) {
      console.log("Delete");
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching tasks for crop ID:", error);
    return res.status(500).json({
      error: "An error occurred while fetching tasks for the crop ID",
    });
  }
};

exports.editUserTask = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);
  console.log("Update task", req.body);

  const id = req.params.id;
  console.log(id);

  try {
    const validatedParams = req.body;

    // Call DAO to update task
    const result = await adminDao.editUserTask(
      validatedParams.taskEnglish,
      validatedParams.taskSinhala,
      validatedParams.taskTamil,
      validatedParams.taskTypeEnglish,
      validatedParams.taskTypeSinhala,
      validatedParams.taskTypeTamil,
      validatedParams.taskCategoryEnglish,
      validatedParams.taskCategorySinhala,
      validatedParams.taskCategoryTamil,
      validatedParams.id
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("Task updated successfully");
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error updating task:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating task" });
  }
};
exports.getAllPostyById = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    const results = await adminDao.getAllPost();
    // console.log(results);

    if (!results || results.length === 0) {
      return res.status(404).json({ error: "No post found." });
    }

    // console.log(results);

    // Modify the results to convert images to base64
    results.forEach((result, indexId) => {
      if (result.postimage) {
        const base64Image = Buffer.from(result.postimage).toString("base64");
        const mimeType = "image/png";
        results[indexId].postimage = `data:${mimeType};base64,${base64Image}`;
      }
    });

    res.json(results);
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }
    console.error("Error fetching posts:", error);
    return res.status(500).json({
      error: "An error occurred while fetching posts.",
    });
  }
};

exports.addNewTask = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);
  console.log("Add new task data:", req.body);

  const cropId = req.params.cropId;
  const indexId = parseInt(req.params.indexId);

  try {
    const task = req.body;
    // console.log(req.params);

    const taskIdArr = await adminDao.getAllTaskIdDao(cropId);
    console.log("Task array:", taskIdArr);

    for (let i = 0; i < taskIdArr.length; i++) {
      const existingTask = taskIdArr[i];

      if (existingTask.taskIndex > indexId) {
        console.log(
          `Updating task ${existingTask.id}, current taskIndex: ${existingTask.taskIndex}`
        );
        await adminDao.shiftUpTaskIndexDao(
          existingTask.id,
          existingTask.taskIndex + 1
        );
      }
    }

    const addedTaskResult = await adminDao.addNewTaskDao(
      task,
      indexId + 1,
      cropId
    );

    if (addedTaskResult.insertId > 0) {
      res
        .status(201)
        .json({ status: true, message: "Succcesfull Task Added!" });
    } else {
      res
        .status(500)
        .json({ status: false, message: "Issue Occor in Task Adding!" });
    }
  } catch (error) {
    console.error("Error adding task:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while adding the task" });
  }
};
exports.sendMessage = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);
  console.log("Send message data:", req.body);
  console.log("Send message data:", req.user);


  const chatId = req.params.chatId;
  const replyId = req.user.userId;
  const replyMessage = req.body.replyMessage;

  try {
    //const replyMessage = replyMessage;
    // const createdAt = new Date().toISOString(); // Generate current timestamp
    console.log(req.params);

    // Get all the replies for the chatId
    const replyIdArr = await adminDao.addNewReplyDao(
      chatId,
      replyId,
      replyMessage
    );
    console.log("Reply ID array:", replyIdArr);

    // Send a success response with the added reply
    return res.status(200).json({
      message: "Reply sent successfully!"
    });
  } catch (err) {
    console.error("Error sending message:", err);
    return res.status(500).json({
      error: "An error occurred while sending the reply.",
    });
  }
};

exports.getReplyCountByChatId = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {

    // Use DAO to get reply count for the given chatId
    const result = await adminDao.getReplyCount();
    console.log(result)

    res.json(result);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error (if using Joi for validation)
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching reply count for chatId:", error);
    return res.status(500).json({
      error: "An error occurred while fetching reply count for the chatId",
    });
  }
};




exports.addNewTaskU = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);
  console.log("Add new task data:", req.body);

  const userId = req.params.userId;
  const cropId = req.params.cropId;
  const indexId = parseInt(req.params.indexId);

  try {
    const task = req.body;
    console.log(req.params);


    const taskIdArr = await adminDao.getAllTaskIdDaoU(cropId, userId);
    console.log("Task array:", taskIdArr);

    for (let i = 0; i < taskIdArr.length; i++) {
      const existingTask = taskIdArr[i];

      if (existingTask.taskIndex > indexId) {
        console.log(`Updating task ${existingTask.id}, current taskIndex: ${existingTask.taskIndex}`);
        await adminDao.shiftUpTaskIndexDaoU(existingTask.id, existingTask.taskIndex + 1);
      }
    }

    const addedTaskResult = await adminDao.addNewTaskDaoU(task, (indexId + 1), userId, cropId);


    if (addedTaskResult.insertId > 0) {
      res.status(201).json({ status: true, message: "Succcesfull Task Added!" })
    } else {
      res.status(500).json({ status: false, message: "Issue Occor in Task Adding!" })
    }

  } catch (error) {
    console.error("Error adding task:", error);
    return res.status(500).json({ error: "An error occurred while adding the task" });
  }
};