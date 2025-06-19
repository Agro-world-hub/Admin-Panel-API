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

    const reportData = await procumentDao.getRecievedOrdersQuantity(
      page,
      limit,
      filterType,
      date,
      search
    );
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

exports.getAllProductTypes = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    const productTypes = await procumentDao.getAllProductTypes();
    res.json(productTypes);
  } catch (err) {
    console.error("Error fetching product types:", err);
    res.status(500).send("An error occurred while fetching product types.");
  }
};

exports.getOrderDetailsById = async (req, res) => {
  const { id } = req.params;

  try {
    const packageDetails = await procumentDao.getOrderDetailsById(id);

    if (!packageDetails) {
      return res.status(404).json({
        success: false,
        message: "Order details not found",
      });
    }

    // Transform the data to group products by package
    const transformedData = packageDetails.reduce((acc, item) => {
      const existingPackage = acc.find(
        (pkg) => pkg.packageId === item.packageId
      );

      if (existingPackage) {
        existingPackage.productTypes.push(item.productType);
      } else {
        acc.push({
          packageId: item.packageId,
          displayName: item.displayName,
          productPrice: item.productPrice,
          invNo: item.invNo,
          productTypes: [item.productType],
        });
      }
      return acc;
    }, []);

    res.json({
      success: true,
      data: transformedData,
    });
  } catch (err) {
    console.error("Error fetching order details:", err);

    let statusCode = 500;
    let message = "An error occurred while fetching order details.";

    if (err.isJoi) {
      statusCode = 400;
      message = err.details[0].message;
    } else if (
      err.code === "ER_NO_SUCH_TABLE" ||
      err.code === "ER_BAD_FIELD_ERROR"
    ) {
      statusCode = 500;
      message = "Database configuration error";
    }

    const errorResponse = {
      success: false,
      message: message,
    };

    if (process.env.NODE_ENV === "development") {
      errorResponse.error = err.stack;
      errorResponse.details = err.message;
    }

    res.status(statusCode).json(errorResponse);
  }
};

exports.createOrderPackageItem = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
    console.log("Request body:", req.body);

    // Check if body is an array
    if (Array.isArray(req.body)) {
      const result = await procumentDao.createOrderPackageItemDao(req.body);

      if (result.errors && result.errors.length > 0) {
        return res.status(207).json({
          // 207 Multi-Status
          message: "Some items failed to create",
          successCount: result.successCount,
          failedCount: result.failedCount,
          results: result.results,
          errors: result.errors,
          status: false,
        });
      }

      return res.status(201).json({
        message: "All items created successfully",
        result: result,
        status: true,
      });
    }

    // Handle single item
    const orderPackageItem = {
      orderPackageId: req.body.orderPackageId,
      productType: req.body.productType,
      productId: req.body.productId,
      qty: req.body.qty,
      price: req.body.price,
    };

    const result = await procumentDao.createOrderPackageItemDao([
      orderPackageItem,
    ]);

    if (result.affectedRows === 0) {
      return res.json({
        message: "Order package item creation failed",
        result: result,
        status: false,
      });
    }

    res.status(201).json({
      message: "Order package item created successfully",
      result: result,
      status: true,
    });
  } catch (err) {
    console.error("Error executing query:", err);
    return res.status(500).json({
      error:
        err.message || "An error occurred while creating order package item",
      status: false,
    });
  }
};

exports.getAllMarketplaceItems = async (req, res) => {
  try {
    console.log("hello world");

    const orderId = req.params.id;
    const btype = await procumentDao.getOrderTypeDao(orderId);
    const marketplaceItems = await procumentDao.getAllMarketplaceItems(
      btype.buyerType
    );

    if (!marketplaceItems || marketplaceItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No marketplace items found",
      });
    }

    // Optional: Group items by category if needed
    const itemsByCategory = marketplaceItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        items: marketplaceItems,
        itemsByCategory, // Optional grouped data
        count: marketplaceItems.length,
      },
    });
  } catch (err) {
    console.error("Error fetching marketplace items:", err);

    let statusCode = 500;
    let message = "An error occurred while fetching marketplace items.";

    if (err.isJoi) {
      statusCode = 400;
      message = err.details[0].message;
    } else if (
      err.code === "ER_NO_SUCH_TABLE" ||
      err.code === "ER_BAD_FIELD_ERROR"
    ) {
      statusCode = 500;
      message = "Database configuration error";
    }

    const errorResponse = {
      success: false,
      message: message,
    };

    if (process.env.NODE_ENV === "development") {
      errorResponse.error = err.stack;
      errorResponse.details = err.message;
    }

    res.status(statusCode).json(errorResponse);
  }
};
