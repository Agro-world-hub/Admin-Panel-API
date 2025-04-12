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
  

