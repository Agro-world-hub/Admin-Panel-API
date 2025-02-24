const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { log } = require("console");
const SalesAgentDAO = require("../dao/SalesAgentDash-dao");
const ValidateSchema = require("../validations/Admin-validation");
const { type } = require("os");
const bcrypt = require("bcryptjs");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const uploadFileToS3 = require("../middlewares/s3upload");
const deleteFromS3 = require("../middlewares/s3delete");


exports.getAllSalesAgents = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    try {
  
        const { page, limit, searchText, status } = req.query;
        console.log(status);
    //   const { centerId, page, limit, grade, searchText } = await TargetValidate.getAllPriceDetailSchema.validateAsync(req.query);
      // const { items, total } = await PriceListDAO.getAllPriceListDao(centerId, page, limit, grade, searchText);
  
      const { items, total } = await SalesAgentDAO.getAllSalesAgentsDao(page, limit, searchText, status);
  
      console.log({ items, total });
  
      console.log("Successfully retrieved price list");
      res.status(200).json({ items, total });
    } catch (error) {
      if (error.isJoi) {
        return res.status(400).json({ error: error.details[0].message });
      }
  
      console.error("Error retrieving price list:", error);
      return res.status(500).json({ error: "An error occurred while fetching the price list" });
    }
  };