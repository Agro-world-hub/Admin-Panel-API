const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const cropCalendarDao = require("../dao/CropCalendar-dao");
const cropCalendarValidations = require('../validations/CropCalendar-validation');
const mime = require("mime-types");
const uploadFileToS3 = require("../middlewares/s3upload");

exports.allCropGroups = async (req, res) => {
  try {
    const groups = await cropCalendarDao.allCropGroups();

    console.log("Successfully fetched crop groups");
    res.json({
      groups,
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






exports.createCropGroup = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
    console.log(req.body);

    const {
      cropNameEnglish,
      cropNameSinhala,
      cropNameTamil,
      category,
      bgColor,
      fileName
    } = req.body;
    console.log(req.body);
    

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const checkCropName = await cropCalendarDao.checkCropGroup(cropNameEnglish)
    console.log(checkCropName);

    if (checkCropName.length > 0) {
      return res.json({ message: "This crop name is already exist!", status: false })
    }


    // Get file buffer (binary data)
    const fileBuffer = req.file.buffer;
    const cropImageUrl = await uploadFileToS3(fileBuffer, fileName, "crop/crop-group");
    console.log(cropImageUrl);
    


    // Call DAO to save news and the image file as longblob
    const newsId = await cropCalendarDao.createCropGroup(
      cropNameEnglish,
      cropNameSinhala,
      cropNameTamil,
      category,
      cropImageUrl,
      bgColor
    );

    console.log("crop group creation success");
    return res
      .status(201)
      .json({ message: "crop group created successfully", id: newsId, status: true });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating crop group" });
  }
};








exports.getAllCropGroups = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    const { page, limit } =
      await cropCalendarValidations.getAllCropCalendarSchema.validateAsync(req.query);
    const offset = (page - 1) * limit;

    const { total, items } = await cropCalendarDao.getAllCropGroups(limit, offset);

    console.log("Successfully fetched crop groups");
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







exports.deleteCropGroup = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the request parameters
    const { id } = await cropCalendarValidations.deleteCropCalenderSchema.validateAsync(
      req.params
    );

    const affectedRows = await cropCalendarDao.deleteCropGroup(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Crop group not found" });
    } else {
      console.log("Crop group deleted successfully");
      return res.status(200).json({ status: true });
    }
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error deleting crop group:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting crop group" });
  }
};




exports.createCropVariety = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
    console.log(req.body);

    // Validate the request body
    const {
      groupId,
      varietyNameEnglish,
      varietyNameSinhala,
      varietyNameTamil,
      descriptionEnglish,
      descriptionSinhala,
      descriptionTamil,
      bgColor
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get file buffer (binary data)
    const fileBuffer = req.file.buffer;
    const checkCropVerityName = await cropCalendarDao.checkCropVerity(groupId, varietyNameEnglish)

    if (checkCropVerityName.length > 0) {
      return res.json({ message: "This crop verity name is already exist!", status: false })
    }


    // Call DAO to save news and the image file as longblob
    const newsId = await cropCalendarDao.createCropVariety(
      groupId,
      varietyNameEnglish,
      varietyNameSinhala,
      varietyNameTamil,
      descriptionEnglish,
      descriptionSinhala,
      descriptionTamil,
      fileBuffer,
      bgColor
    );

    console.log("crop variety creation success");
    return res
      .status(201)
      .json({ message: "crop variety created successfully", id: newsId, status:true });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating crop variety" });
  }
};



exports.allCropVariety = async (req, res) => {
  try {
    const cropGroupId = req.params.cropGroupId;

    const varieties = await cropCalendarDao.allCropVariety(cropGroupId);

    console.log("Successfully fetched crop arities");
    console.log(varieties);
    console.log(cropGroupId);
    res.json({
      varieties,
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

    const {
      varietyId,
      cultivationMethod,
      natureOfCultivation,
      cropDuration,
      suitableAreas
    } = req.body;

    const checkExist = await cropCalendarDao.checkExistanceCropCalander(varietyId, cultivationMethod, natureOfCultivation);
    if(checkExist.length > 0){
      return res.json({message:"This crop calander allready exist !", status:false})
    }

    const cropId = await cropCalendarDao.createCropCallender(
      varietyId,
      cultivationMethod,
      natureOfCultivation,
      cropDuration,
      suitableAreas
    );

    console.log("Crop Calendar creation success");
    return res.status(200).json({ cropId , status:true});
  } catch (err) {
    if (err.isJoi) {
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
    await cropCalendarValidations.uploadXLSXSchema.validateAsync({ id });

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
    const rowsAffected = await cropCalendarDao.insertXLSXData(id, data);

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



exports.getAllVarietyByGroup = async (req, res) => {
  try {
    const cropGroupId = req.params.cropGroupId;
    const groups = await cropCalendarDao.getAllVarietyByGroup(cropGroupId);

    console.log(groups?.cropGroupId);

    if (groups.image) {
      console.log('find');
      const base64Image = Buffer.from(groups.image).toString(
        "base64"
      );
      const mimeType = "image/png"; // Adjust the MIME type if needed
      groups.image = `data:${mimeType};base64,${base64Image}`;
    }

    console.log("Successfully fetched crop groups");
    res.json({
      groups,
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



exports.deleteCropVariety = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the request parameters
    const { id } = await cropCalendarValidations.deleteCropCalenderSchema.validateAsync(
      req.params
    );

    const affectedRows = await cropCalendarDao.deleteCropVariety(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Crop variety not found" });
    } else {
      console.log("Crop variety deleted successfully");
      return res.status(200).json({ status: true });
    }
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error deleting crop variety:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting crop variety" });
  }
};




exports.getGroupById = async (req, res) => {
  try {
    const id = req.params.id;
    const groups = await cropCalendarDao.getGroupById(id);

    console.log(groups?.cropGroupId);

    console.log("Successfully fetched crop groups");
    res.json({
      groups,
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


exports.getVarietyById = async (req, res) => {
  try {
    const id = req.params.id;
    const groups = await cropCalendarDao.getVarietyById(id);

    console.log(groups?.cropGroupId);

    console.log("Successfully fetched crop groups");
    res.json({
      groups,
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



exports.updateGroup = async (req, res) => {

  const { cropNameEnglish, cropNameSinhala, cropNameTamil, category, bgColor } = req.body;
  const id = req.params.id;
  const Existname = req.params.name;
  console.log(req.params);
  
  try {
    let imageData = null;
    if (req.file) {
      imageData = req.file.buffer; // Store the binary image data from req.file
    }

    if (Existname !== cropNameEnglish) {
      const checkCropName = await cropCalendarDao.checkCropGroup(cropNameEnglish)
      console.log(checkCropName);

      if (checkCropName.length > 0) {
        return res.json({ message: "This crop name is already exist!", status: false })
      }
    }


    await cropCalendarDao.updateGroup({ cropNameEnglish, cropNameSinhala, cropNameTamil, category, bgColor, image: imageData }, id);
    res.json({ message: 'Crop group updated successfully.', status:true });
  } catch (err) {
    console.error('Error updating crop group:', err);
    res.status(500).send('An error occurred while updating the crop group.');
  }
};

exports.updateCropVariety = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    let image = null;
    console.log('Request body:', req.body);

    if (req.file) {
      image = req.file.buffer; // Handle file upload if present
      updates.image = image;
    }

    await cropCalendarDao.updateCropVariety(id, updates);
    res.json({ message: 'Crop variety updated successfully.' });
  } catch (err) {
    console.error('Error updating crop variety:', err);
    res.status(500).send('An error occurred while updating the crop variety.');
  }
};


exports.getAllCropCalender = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    const { page, limit } =
      await cropCalendarValidations.getAllCropCalendarSchema.validateAsync(req.query);
    const offset = (page - 1) * limit;

    const { total, items } = await cropCalendarDao.getAllCropCalendars(limit, offset);

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




exports.editCropCalender = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    // Validate the request body
    const updateData = req.body;
    const { id } = req.params;

    const affectedRows = await cropCalendarDao.updateCropCalender(
      id,
      updateData,
    );

    console.log(updateData);

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



exports.deleteCropCalender = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the request parameters
    const { id } = await cropCalendarValidations.deleteCropCalenderSchema.validateAsync(
      req.params
    );

    const affectedRows = await cropCalendarDao.deleteCropCalender(id);

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



exports.getAllTaskByCropId = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  const { page, limit } = req.query;

  const offset = (page - 1) * limit;

  try {
    // Validate request parameters (cropId)
    const validatedParams =
      await cropCalendarValidations.getAllTaskByCropIdSchema.validateAsync(req.params);

    // Fetch the data from the DAO
    const { total, results } = await cropCalendarDao.getAllTaskByCropId(
      validatedParams.id,
      limit,
      offset
    );

    console.log(
      "Successfully retrieved all tasks for crop ID:",
      validatedParams.id
    );
    res.json({ results, total });
  } catch (error) {
    // if (error.isJoi) {
    //   // Handle validation error
    //   return res.status(400).json({ error: error.details[0].message });
    // }

    console.error("Error fetching tasks for crop ID:", error);
    return res.status(500).json({
      error: "An error occurred while fetching tasks for the crop ID",
    });
  }
};


exports.updateVariety = async (req, res) => {

  const { varietyNameEnglish, varietyNameSinhala, varietyNameTamil, descriptionEnglish, descriptionSinhala, descriptionTamil, bgColor } = req.body;
  const id = req.params.id;
  try {
    let imageData = null;
    if (req.file) {
      imageData = req.file.buffer; // Store the binary image data from req.file
    }


    await cropCalendarDao.updateVariety({ varietyNameEnglish, varietyNameSinhala, varietyNameTamil, descriptionEnglish, descriptionSinhala, descriptionTamil, bgColor, image: imageData }, id);
    res.json({ message: 'Crop group updated successfully.' });
  } catch (err) {
    console.error('Error updating crop group:', err);
    res.status(500).send('An error occurred while updating the crop group.');
  }
};
