const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { log } = require("console");
const DispatchDao = require("../dao/Dispatch-dao");
const DispatchVali = require("../validations/Dispatch-validation");
const { type } = require("os");
const bcrypt = require("bcryptjs");

const { v4: uuidv4 } = require("uuid");
const uploadFileToS3 = require("../middlewares/s3upload");
const deleteFromS3 = require("../middlewares/s3delete");




exports.getPreMadePackages = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {

    const validatedQuery = await DispatchVali.getPreMadePackages.validateAsync(req.query);


    const { page, limit, selectedStatus, date, search} = validatedQuery;

    const reportData = await DispatchDao.getPreMadePackages(
      page,
      limit,
      selectedStatus,
      date, 
      search
    );
    res.json(reportData);
  } catch (err) {
    console.error("Error fetching daily report:", err);
    res.status(500).send("An error occurred while fetching the report.");
  }
};



exports.getSelectedPackages = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    try {
  
      const validatedQuery = await DispatchVali.getPreMadePackages.validateAsync(req.query);
  
  
      const { page, limit, selectedStatus, date, search} = validatedQuery;
  
      const reportData = await DispatchDao.getSelectedPackages(
        page,
        limit,
        selectedStatus,
        date, 
        search
      );
      res.json(reportData);
    } catch (err) {
      console.error("Error fetching daily report:", err);
      res.status(500).send("An error occurred while fetching the report.");
    }
  };



  exports.getCustomOrderDetailsById = async (req, res) => {
    try {
      const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      console.log(fullUrl);
  
      // Validate the ID parameter
      const { id } = await DispatchVali.idValidate.validateAsync(
        req.params
      );
  
      // Call the DAO to get the news item by ID
      const items = await DispatchDao.getCustomOrderDetailsById(id);
  
      if (items.length === 0) {
        return res.status(404).json({ message: "items not found" });
      }
  
      console.log("Successfully fetched the items");
      return res.status(200).json(items);
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
  




  exports.updateCustomPackItems = async (req, res) => {
    try {
      const { invoiceId, updatedItems } = req.body;
  
      if (!invoiceId || !Array.isArray(updatedItems)) {
        return res.status(400).json({ message: 'Invalid data format' });
      }
  
      await DispatchDao.updateCustomPackItems(updatedItems);
  
      return res.status(200).json({ message: 'Packed items updated successfully' });
    } catch (err) {
      console.error('Error updating packed items:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
