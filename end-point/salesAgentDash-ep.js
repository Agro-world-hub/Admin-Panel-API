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
const SalesDashValidate = require("../validations/SalesAgentDash-validation")


exports.getAllSalesAgents = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    try {

      console.log(req.user);
  
        // const { page, limit, searchText, status, date } = req.query;
        // console.log(status);
      const {page, limit, searchText, status, date } = await SalesDashValidate.getAllSalesAgentsSchema.validateAsync(req.query);
      console.log({page, limit, searchText, status, date });
      // const { items, total } = await PriceListDAO.getAllPriceListDao(centerId, page, limit, grade, searchText);
  
      const { items, total } = await SalesAgentDAO.getAllSalesAgentsDao(page, limit, searchText, status, date);
  
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

  exports.saveTarget = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    try {

      console.log(req.body);
      const userId = req.user.userId;

      
      const {startDate, targetValue} = req.body;
      console.log(startDate);

      const { results } = await SalesAgentDAO.saveTargetDao(startDate, targetValue, userId);
  
      
      console.log("Successfully retrieved price list");
      
      res.status(200).json(results);
    } catch (error) {
      // if (error.isJoi) {
      //   return res.status(400).json({ error: error.details[0].message });
      // }
  
      console.error("Error retrieving price list:", error);
      return res.status(500).json({ error: "An error occurred while fetching the price list" });
    }
  };

  exports.getDailyTarget = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    try {

      
      const { results } = await SalesAgentDAO.getDailyTarget();
      console.log(results);
  
      res.status(200).json(results);
    } catch (error) {
      // if (error.isJoi) {
      //   return res.status(400).json({ error: error.details[0].message });
      // }
  
      console.error("Error retrieving price list:", error);
      return res.status(500).json({ error: "An error occurred while fetching the price list" });
    }
  };