const DashDao = require("../dao/Dash-dao");
const ValidateSchema = require("../validations/SalesAgentDash-validation");

const fs = require("fs");
const xlsx = require("xlsx");
const collectionofficerDao = require("../dao/CollectionOfficer-dao");

const bcrypt = require("bcryptjs");

const { v4: uuidv4 } = require("uuid");
const uploadFileToS3 = require("../middlewares/s3upload");
const deleteFromS3 = require("../middlewares/s3delete");

exports.getAllCustomers = async (req, res) => {
    try {
      const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      console.log("Request URL:", fullUrl);
      
      const items = await DashDao.getAllCustomers();
      
      if (items.length === 0) {
        return res.status(404).json({ message: "No customers found", data: items });
      }
      
      console.log("Successfully fetched customers");
      res.json(items);
    } catch (err) {
      if (err.isJoi) {
        console.error("Validation error:", err.details[0].message);
        return res.status(400).json({ error: err.details[0].message });
      }
      
      console.error("Error fetching customers:", err);
      res.status(500).json({ error: "An error occurred while fetching customers" });
    }
  };


  exports.getAllSalesAgents = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
  
    try {
      // Validate query parameters
      // const validatedQuery =
      //   await collectionofficerValidate.getAllCollectionOfficersSchema.validateAsync(
      //     req.query
      //   );

      const {page, limit, searchText, status} = req.query;
  
      // const { page, limit, nic, company } = validatedQuery;
  
      // Call the DAO to get all collection officers
      const result = await DashDao.getAllSalesAgents(
        page,
        limit,
        searchText,
        status
      );
  
      console.log({page, limit});
      return res.status(200).json(result);
    } catch (error) {
      // if (error.isJoi) {
      //   // Handle validation error
      //   return res.status(400).json({ error: error.details[0].message });
      // }
  
      console.error("Error fetching collection officers:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching collection officers" });
    }
  };

  exports.deleteSalesAgent = async (req, res) => {
    try {
      const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      console.log("Request URL:", fullUrl);
  
      // Validate the request parameters
      const { id } =
        await ValidateSchema.deleteSalesAgentSchema.validateAsync(
          req.params
        );
  
      const affectedRows = await DashDao.deleteSalesAgent(id);
  
      if (affectedRows === 0) {
        return res.status(404).json({ message: "company head not found" });
      } else {
        console.log("company head deleted successfully");
        return res.status(200).json({ status: true });
      }
    } catch (err) {
      if (err.isJoi) {
        // Validation error
        return res.status(400).json({ error: err.details[0].message });
      }
  
      console.error("Error deleting company head:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while deleting company head" });
    }
  };
  
  exports.getForCreateId = async (req, res) => {
    try {

      const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      console.log("Request URL:", fullUrl);
      // const { role } = await ValidateSchema.getRoleShema.validateAsync(
      //   req.params
      // );

      const role = 'SA';

      const results = await DashDao.getForCreateId(role);
  
      if (results.length === 0) {
        return res.json({ result: { empId: "00001" }, status: true });
      }
  
      res.status(200).json({ result: results[0], status: true });
    } catch (err) {
      if (err.isJoi) {
        return res.status(400).json({ error: err.details[0].message });
      }
      console.error("Error executing query:", err);
      res.status(500).send("An error occurred while fetching data.");
    }
  };

  exports.createSalesAgent = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
  
    try {
      const officerData = JSON.parse(req.body.officerData);
  
      const isExistingNIC = await DashDao.checkNICExist(
        officerData.nic
      );
      const isExistingEmail = await DashDao.checkEmailExist(
        officerData.email
      );
  
      if (isExistingNIC) {
        return res.status(500).json({
          error: "NIC already exists",
        });
      }
  
      if (isExistingEmail) {
        return res.status(500).json({
          error: "Email already exists",
        });
      }
  
      let profileImageUrl = null; // Default to null if no image is provided
  
      // Check if an image file is provided
      if (req.body.file) {
        try {
          const base64String = req.body.file.split(",")[1]; // Extract the Base64 content
          const mimeType = req.body.file.match(/data:(.*?);base64,/)[1]; // Extract MIME type
          const fileBuffer = Buffer.from(base64String, "base64"); // Decode Base64 to buffer
  
          
  
          const fileExtension = mimeType.split("/")[1]; // Extract file extension from MIME type
          const fileName = `${officerData.firstNameEnglish}_${officerData.lastNameEnglish}.${fileExtension}`;
  
          // Upload image to S3
  
          console.log('go to s3');
          profileImageUrl = await uploadFileToS3(
            fileBuffer,
            fileName,
            "salesagent/image"
          );
        } catch (err) {
          console.error("Error processing image file:", err);
          return res
            .status(400)
            .json({ error: "Invalid file format or file upload error" });
        }
      }
  
      // Save officer data (without image if no image is uploaded)
      console.log('got to dao');
      const resultsPersonal =
        await DashDao.createSalesAgent(
          officerData,
          profileImageUrl
        );
  
      console.log("Center Head created successfully");
      return res.status(201).json({
        message: "Center Head created successfully",
        id: resultsPersonal.insertId,
        status: true,
      });
    } catch (error) {
      if (error.isJoi) {
        return res.status(400).json({ error: error.details[0].message });
      }
  
      console.error("Error creating Center Head:", error);
      return res.status(500).json({
        error: "An error occurred while creating the Center Head",
      });
    }
  };