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
const ComplainCategoryValidate = require("../validations/ComplainCategory-validation")

exports.getAllSystemApplications = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {

    const result = await ComplainCategoryDAO.getAllSystemApplicationData();
    console.log('dfdgdgd', result);

    console.log("Successfully fetched collection officers");
    return res.status(200).json(result);
  } catch (error) {


    console.error("Error fetching collection officers:", error);
    return res.status(500).json({ error: "An error occurred while fetching collection officers" });
  }
};

exports.getComplainCategoriesByAppId = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    console.log("going to validate");

    const validatedQuery = await ComplainCategoryValidate.getComplainCategoriesSchema.validateAsync({ systemAppId: req.params.systemAppId });
    const { systemAppId } = validatedQuery;
    // const systemAppId = req.params.id; 
    console.log("this is", systemAppId);


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


exports.getAdminComplaintsCategory = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    const adminRoles = await ComplainCategoryDAO.getAdminRolesDao();
    const systemApps = await ComplainCategoryDAO.getSystemApplicationDao();

    res.status(200).json({ adminRoles, systemApps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.AddNewComplaintCategory = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {

    const complainCategory = await ComplainCategoryValidate.AddNewComplainCategorySchema.validateAsync(req.body);

    const result = await ComplainCategoryDAO.AddNewComplainCategoryDao(complainCategory);
    console.log(result);
    if (result.affectedRows === 0) {
      return res.json({ status: false })
    }

    res.status(200).json({ status: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


