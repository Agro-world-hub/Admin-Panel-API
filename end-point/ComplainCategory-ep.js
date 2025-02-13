const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { log } = require("console");
const ComplainCategoryDAO = require("../dao/ComplainCategory-dao");
const ValidateSchema = require("../validations/Admin-validation");
const { type } = require("os");
const bcrypt = require("bcryptjs");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const uploadFileToS3 = require("../middlewares/s3upload");
const deleteFromS3 = require("../middlewares/s3delete");

exports.getAllSystemApplications = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    try {        
        // Validate query parameters
        // const validatedQuery = await collectionofficerValidate.getAllCollectionOfficersSchema.validateAsync(req.query);
        
        // const { page, limit, nic, company } = validatedQuery;

        // Call the DAO to get all collection officers
        const result = await ComplainCategoryDAO.getAllSystemApplicationData();
        console.log('dfdgdgd',result);

        console.log("Successfully fetched collection officers");
        return res.status(200).json(result);
    } catch (error) {
        // if (error.isJoi) {
        //     // Handle validation error
        //     return res.status(400).json({ error: error.details[0].message });
        // }

        console.error("Error fetching collection officers:", error);
        return res.status(500).json({ error: "An error occurred while fetching collection officers" });
    }
};

exports.getComplainCategoriesByAppId = async (req, res) => {
    try {
      const systemAppId = req.params.id; // Get systemAppId from request parameters
      console.log("this is",systemAppId);
  
      
      const categories = await ComplainCategoryDAO.getComplainCategoryData(systemAppId);
      console.log(categories)
  
      if (!categories) {
        return res.status(404).json({ message: 'Complain categories not found' });
      }
  
      res.status(200).json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };



 

