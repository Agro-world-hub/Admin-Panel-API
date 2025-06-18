const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { log } = require("console");
const procumentDao = require("../dao/Procuments-dao");
const ValidateSchema = require("../validations/Admin-validation");
const { type } = require("os");
const bcrypt = require("bcryptjs");

const { v4: uuidv4 } = require("uuid");
const uploadFileToS3 = require("../middlewares/s3upload");
const deleteFromS3 = require("../middlewares/s3delete");

exports.getRecievedOrdersQuantity = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    // const validatedQuery = await collectionofficerValidate.getPurchaseReport.validateAsync(req.query);

    const { page, limit, filterType, date, search } = req.query;

    console.log(page, limit)

    const reportData = await procumentDao.getRecievedOrdersQuantity(
      page,
      limit,
      filterType,
      date,
      search
    );

    console.log(reportData);
    res.json(reportData);
  } catch (err) {
    console.error("Error fetching daily report:", err);
    res.status(500).send("An error occurred while fetching the report.");
  }
};

exports.getAllOrdersWithProcessInfo = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    // If you have validation, uncomment and use this:
    // const validatedQuery = await ordersValidate.getAllOrdersWithProcessInfo.validateAsync(req.query);

    const { page = 1, limit = 10, filterType, date, search } = req.query;

    const ordersData = await procumentDao.getAllOrdersWithProcessInfo(
      page,
      limit,
      filterType,
      date,
      search
    );

    res.json({
      success: true,
      data: ordersData.items,
      total: ordersData.total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(ordersData.total / limit),
    });
  } catch (err) {
    console.error("Error fetching orders with process info:", err);

    // More detailed error response
    const statusCode = err.isJoi ? 400 : 500;
    const message = err.isJoi
      ? err.details[0].message
      : "An error occurred while fetching orders data.";

    res.status(statusCode).json({
      success: false,
      message: message,
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};
