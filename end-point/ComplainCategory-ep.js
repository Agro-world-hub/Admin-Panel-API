const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { log } = require("console");
const ComplainCategoryDAO = require("../dao/ComplainCategory-dao");
const DashDAO = require("../dao/Dash-dao");
const ValidateSchema = require("../validations/Admin-validation");
const { type } = require("os");
const bcrypt = require("bcryptjs");

const { v4: uuidv4 } = require("uuid");
const uploadFileToS3 = require("../middlewares/s3upload");
const deleteFromS3 = require("../middlewares/s3delete");
const ComplainCategoryValidate = require("../validations/ComplainCategory-validation");

exports.getAllSystemApplications = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const result = await ComplainCategoryDAO.getAllSystemApplicationData();
    console.log("dfdgdgd", result);

    console.log("Successfully fetched collection officers");
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching collection officers:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching collection officers" });
  }
};

exports.getComplainCategoriesByAppId = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    const validatedQuery =
      await ComplainCategoryValidate.getComplainCategoriesSchema.validateAsync({
        systemAppId: req.params.systemAppId,
      });
    const { systemAppId } = validatedQuery;
    // const systemAppId = req.params.id;

    const categories = await ComplainCategoryDAO.getComplainCategoryData(
      systemAppId
    );
    // console.log(categories)

    if (!categories) {
      return res.status(404).json({ message: "Complain categories not found" });
    }
    // console.log("Data---->", categories);

    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.postNewApplication = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    // console.log("going to validate");

    const validatedQuery =
      await ComplainCategoryValidate.addNewApplicationSchema.validateAsync({
        applicationName: req.params.applicationName,
      });
    const { applicationName } = validatedQuery;
    // const applicationName = req.params.applicationName;
    console.log("this is", applicationName);

    const result = await ComplainCategoryDAO.addNewApplicationData(
      applicationName
    );
    console.log(result);

    if (!result) {
      return res
        .status(404)
        .json({ message: "application did not added successfully" });
    }

    res.status(200).json({ message: "application added successfully", result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.editApplication = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    // console.log("going to validate");

    const validatedQuery =
      await ComplainCategoryValidate.editApplicationSchema.validateAsync(
        req.query
      );
    const { systemAppId, applicationName } = validatedQuery;
    // const { systemAppId, applicationName} = req.query;
    // const { applicationName } = req.body;
    console.log("this is", systemAppId, applicationName);

    const result = await ComplainCategoryDAO.editApplicationData(
      systemAppId,
      applicationName
    );
    console.log(result);

    if (!result) {
      return res
        .status(404)
        .json({ message: "application did not edited successfully" });
    }

    res
      .status(200)
      .json({ message: "application edited successfully", result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteApplicationByAppId = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    // console.log("going to validate");

    const validatedQuery =
      await ComplainCategoryValidate.deleteApplicationSchema.validateAsync({
        systemAppId: req.params.systemAppId,
      });
    const { systemAppId } = validatedQuery;
    // const systemAppId = req.params.systemAppId;
    console.log("this is", systemAppId);

    const result = await ComplainCategoryDAO.deleteApplicationData(systemAppId);
    console.log(result);

    if (!result) {
      return res.status(404).json({ message: "application not found" });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
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
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.AddNewComplaintCategory = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    const complainCategory =
      await ComplainCategoryValidate.AddNewComplainCategorySchema.validateAsync(
        req.body
      );

    const result = await ComplainCategoryDAO.AddNewComplainCategoryDao(
      complainCategory
    );
    console.log(result);
    if (result.affectedRows === 0) {
      return res.json({ status: false });
    }

    res.status(200).json({ status: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCategoriesDetailsById = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    const { id } = await ComplainCategoryValidate.IdParamsSchema.validateAsync(
      req.params
    );

    const categories = await ComplainCategoryDAO.getCategoriDetailsByIdDao(id);

    if (!categories) {
      return res.status(404).json({ message: "Complain categories not found" });
    }
    // console.log("Data---->", categories);

    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.EditComplaintCategory = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    const complainCategory =
      await ComplainCategoryValidate.EditComplainCategorySchema.validateAsync(
        req.body
      );

    const result = await ComplainCategoryDAO.EditComplainCategoryDao(
      complainCategory
    );
    console.log(result);
    if (result.affectedRows === 0) {
      return res.json({ status: false });
    }

    res.status(200).json({ status: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllSalesAgentComplains = async (req, res) => {
  try {
    console.log(req.query);
    const { page, limit, status, category, comCategory, searchText } =
      req.query;

    const { results, total } = await DashDAO.GetAllSalesAgentComplainDAO(
      page,
      limit,
      status,
      category,
      comCategory,
      searchText
    );

    console.log("Successfully retrieved all collection center");
    res.json({ results, total });
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

exports.getComplainById = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await DashDAO.getComplainById(id);
    console.log(result[0]);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No Complain foundd", data: result[0] });
    }

    console.log("Successfully retrieved Farmer Complain");
    res.json(result[0]);
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

exports.sendComplainReply = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    const complaignId = req.params.id;

    const reply = req.body.reply;
    console.log("Collection Centr", complaignId, reply);

    if (reply === null) {
      return res.status(401).json({ error: "Reply can not be empty" });
    }

    const result = await DashDAO.sendComplainReply(complaignId, reply);

    console.log("Send Reply Success");
    return res.status(201).json({ result: result, status: true });
  } catch (err) {
    if (err.isJoi) {
      return res
        .status(400)
        .json({ error: err.details[0].message, status: false });
    }
    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating Reply tasks" });
  }
};
