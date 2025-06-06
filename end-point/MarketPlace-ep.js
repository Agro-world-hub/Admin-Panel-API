const MarketPlaceDao = require("../dao/MarketPlace-dao");
const uploadFileToS3 = require("../middlewares/s3upload");
const deleteFromS3 = require("../middlewares/s3delete");
const MarketPriceValidate = require("../validations/MarketPlace-validation");

//get all crop category
exports.getAllCropCatogory = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const result = await MarketPlaceDao.getAllCropNameDAO();

    console.log("Successfully fetched gatogory");
    return res.status(200).json(result);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching collection officers:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching collection officers" });
  }
};

// exports.createMarketProduct = async (req, res) => {
//   try {
//     const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
//     console.log("Request URL:", fullUrl);
//     // const product = await MarketPriceValidate.AddProductValidation.validateAsync(req.body)
//     console.log(req.body);

//     const result = await MarketPlaceDao.createMarketProductDao(req.body);
//     console.log(result);
//     if (result.affectedRows === 0) {
//       return res.json({
//         message: "marcket product created faild",
//         result: result,
//         status: false,
//       });
//     }

//     console.log("marcket product creation success");
//     res
//       .status(201)
//       .json({
//         message: "marcket product created successfully",
//         result: result,
//         status: true,
//       });
//   } catch (err) {
//     if (err.isJoi) {
//       // Validation error
//       return res
//         .status(400)
//         .json({ error: err.details[0].message, status: false });
//     }

//     console.error("Error executing query:", err);
//     return res
//       .status(500)
//       .json({
//         error: "An error occurred while creating marcket product",
//         status: false,
//       });
//   }
// };

exports.createMarketProduct = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
    console.log(req.body);

    const product = {
      cropName: req.body.displayName || req.body.cropName,
      normalPrice: req.body.normalPrice,
      discountedPrice: req.body.salePrice,
      promo: req.body.promo,
      unitType: req.body.unitType,
      startValue: req.body.startValue,
      changeby: req.body.changeby,
      tags: req.body.tags,
      category: req.body.category,
      discount: req.body.discount,
      varietyId: req.body.varietyId,
      displaytype: req.body.displaytype,
      maxQuantity: req.body.maxQuantity,
    };

    // First check if the product already exists
    const exists = await MarketPlaceDao.checkMarketProductExistsDao(
      product.varietyId,
      product.cropName
    );
    if (exists) {
      return res.status(201).json({
        message:
          "A product with this variety ID and display name already exists",
        status: false,
      });
    }

    // If not exists, create
    const result = await MarketPlaceDao.createMarketProductDao(product);
    console.log(result);

    if (result.affectedRows === 0) {
      return res.json({
        message: "Market product creation failed",
        result: result,
        status: false,
      });
    }

    console.log("Market product creation success");
    res.status(201).json({
      message: "Market product created successfully",
      result: result,
      status: true,
    });
  } catch (err) {
    if (err.isJoi) {
      return res
        .status(400)
        .json({ error: err.details[0].message, status: false });
    }

    console.error("Error executing query:", err);
    return res.status(500).json({
      error: "An error occurred while creating market product",
      status: false,
    });
  }
};

exports.getMarketplaceItems = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const { page, limit, search, displayTypeValue, categoryValue } = req.query;
    const parsedLimit = parseInt(limit, 10) || 10;
    const parsedPage = parseInt(page, 10) || 1;
    const offset = (parsedPage - 1) * parsedLimit;

    // If displayTypeValue is URL encoded, it will be automatically decoded by Express
    console.log("Display Type Value:", displayTypeValue);

    const { total, items } = await MarketPlaceDao.getMarketplaceItems(
      parsedLimit,
      offset,
      search,
      displayTypeValue, // This should now contain the correct value
      categoryValue
    );

    console.log("Successfully fetched marketplace items");

    res.json({
      items,
      total,
    });
  } catch (error) {
    console.error("Error fetching marketplace items:", error);
    return res.status(500).json({
      error: "An error occurred while fetching marketplace items",
    });
  }
};
exports.deleteMarketplaceItem = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Extract id from request parameters
    const { id } = req.params;

    const affectedRows = await MarketPlaceDao.deleteMarketplaceItem(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Marketplace item not found" });
    } else {
      console.log("Marketplace item deleted successfully");
      return res.status(200).json({ status: true });
    }
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error deleting marketplace item:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the marketplace item" });
  }
};

exports.createCoupen = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
    // console.log(req.body);

    const coupen =
      await MarketPriceValidate.CreateCoupenValidation.validateAsync(req.body);
    console.log(coupen);

    const result = await MarketPlaceDao.createCoupenDAO(coupen);
    console.log("coupen creation success");
    return res.status(201).json({
      message: "coupen created successfully",
      result: result,
      status: true,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res
        .status(400)
        .json({ error: err.details[0].message, status: false });
    }

    console.error("Error executing query:", err);
    return res.status(500).json({
      error: "An error occurred while creating marcket product",
      status: false,
    });
  }
};

exports.getAllCoupen = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const { page, limit, status, types, searchText } =
      await MarketPriceValidate.couponQuaryParamSchema.validateAsync(req.query);
    console.log(page, limit, status, types, searchText);

    const offset = (page - 1) * limit;
    const { total, items } = await MarketPlaceDao.getAllCoupenDAO(
      limit,
      offset,
      status,
      types,
      searchText
    );

    res.json({ total, items });
    console.log("Successfully fetched marketplace items");
  } catch (error) {
    console.error("Error fetching marketplace items:", error);
    return res.status(500).json({
      error: "An error occurred while fetching marketplace items",
    });
  }
};

exports.deleteCoupenById = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
    console.log(req.params);

    // Validate the request parameters
    const { id } = await MarketPriceValidate.deleteCoupenSchema.validateAsync(
      req.params
    );
    console.log(id);

    const affectedRows = await MarketPlaceDao.deleteCoupenById(id);

    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Coupen not found", status: false });
    } else {
      console.log("Crop Calendar deleted successfully");
      return res.status(200).json({ message: "Coupen Deleted", status: true });
    }
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error deleting Coupen:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting Coupen" });
  }
};

exports.deleteAllCoupen = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const affectedRows = await MarketPlaceDao.deleteAllCoupen();

    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Coupenes not found", status: false });
    } else {
      console.log("Crop Calendar deleted successfully");
      return res
        .status(200)
        .json({ message: "Coupenes Deleted", status: true });
    }
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error deleting Coupenes:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting Coupenes" });
  }
};

exports.getAllProductCropCatogory = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const result = await MarketPlaceDao.getAllProductCropCatogoryDAO();

    console.log("Successfully fetched gatogory");
    return res.status(200).json(result);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching collection officers:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching collection officers" });
  }
};
exports.createPackage = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const package = JSON.parse(req.body.package);
    console.log(package);

    let profileImageUrl = null;

    if (req.body.file) {
      try {
        const base64String = req.body.file.split(",")[1];
        const mimeType = req.body.file.match(/data:(.*?);base64,/)[1];
        const fileBuffer = Buffer.from(base64String, "base64");
        const fileExtension = mimeType.split("/")[1];
        const fileName = `${package.displayName}.${fileExtension}`;

        profileImageUrl = await uploadFileToS3(
          fileBuffer,
          fileName,
          "marketplacepackages/image"
        );
      } catch (err) {
        console.error("Error processing image file:", err);
        return res.status(400).json({
          error: "Invalid file format or file upload error",
          status: false,
        });
      }
    }
    console.log(profileImageUrl)

    // Create main package
    const packageId = await MarketPlaceDao.creatPackageDAO(
      package,
      profileImageUrl
    );

    if (!packageId || packageId <= 0) {
      return res.status(500).json({
        message: "Package creation failed",
        status: false,
      });
    }

    // Create package details
    try {
      const quantities = package.quantities; // object like { '2': 2, '3': 0 }

      for (const [productTypeId, qty] of Object.entries(quantities)) {
        // Skip if quantity is 0 or less
        if (qty <= 0) continue;

        // Construct item data for DAO
        const itemData = {
          productTypeId: parseInt(productTypeId),
          qty: parseInt(qty)
        };

        await MarketPlaceDao.creatPackageDetailsDAO(itemData, packageId);
      }
    } catch (err) {
      console.error("Error creating package details:", err);
      return res.status(500).json({
        error: "Error creating package details",
        status: false,
      });
    }


    return res.status(201).json({
      message: "Package created successfully",
      status: true,
      packageId: packageId,
    });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({
        error: err.details[0].message,
        status: false,
      });
    }

    console.error("Error creating package:", err);
    return res.status(500).json({
      error: "An error occurred while creating marketplace package",
      status: false,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const { id } = await MarketPriceValidate.IdparamsSchema.validateAsync(
      req.params
    );

    const result = await MarketPlaceDao.getProductById(id);
    console.log(result);

    res.json(result);
    console.log("Successfully fetched marketplace items");
  } catch (error) {
    console.error("Error fetching marketplace items:", error);
    return res.status(500).json({
      error: "An error occurred while fetching marketplace items",
    });
  }
};

exports.editMarketProduct = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
    // const product = await MarketPriceValidate.AddProductValidation.validateAsync(req.body)
    const { id } = await MarketPriceValidate.IdparamsSchema.validateAsync(
      req.params
    );
    console.log(req.body);

    const result = await MarketPlaceDao.updateMarketProductDao(req.body, id);
    console.log(result);
    if (result.affectedRows === 0) {
      return res.json({
        message: "marcket product update unsuccessfully",
        result: result,
        status: false,
      });
    }

    console.log("marcket product creation success");
    res.status(201).json({
      message: "marcket product created successfully",
      result: result,
      status: true,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res
        .status(400)
        .json({ error: err.details[0].message, status: false });
    }

    console.error("Error executing query:", err);
    return res.status(500).json({
      error: "An error occurred while creating marcket product",
      status: false,
    });
  }
};

exports.getAllMarketplacePackages = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    const { searchText } =
      await MarketPriceValidate.getAllPackageSchema.validateAsync(req.query);
    console.log("Search Text:", searchText);

    const packages = await MarketPlaceDao.getAllMarketplacePackagesDAO(
      searchText
    );

    console.log("Successfully fetched marketplace packages");
    return res.status(200).json({
      success: true,
      message: "Marketplace packages retrieved successfully",
      data: packages,
    });
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    console.error("Error fetching marketplace packages:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching marketplace packages",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.deleteMarketplacePackages = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Extract id from request parameters
    const { id } = req.params;

    const affectedRows = await MarketPlaceDao.deleteMarketplacePckages(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Marketplace item not found" });
    } else {
      console.log("Marketplace item deleted successfully");
      return res.status(200).json({ status: true });
    }
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error deleting marketplace item:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the marketplace item" });
  }
};

exports.updateMarketplacePackage = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the ID parameter
    const { id } = await MarketPriceValidate.IdparamsSchema.validateAsync(
      req.params
    );

    // Validate the request body (you might want to create a specific validation schema for packages)
    const packageData =
      await MarketPriceValidate.UpdatePackageSchema.validateAsync(req.body);

    console.log("Update data:", packageData);

    const result = await MarketPlaceDao.updateMarketplacePackageDAO(
      id,
      packageData
    );

    if (result.message === "Package updated successfully") {
      console.log("Marketplace package update success");
      return res.status(200).json({
        message: "Marketplace package updated successfully",
        result: result,
        status: true,
      });
    } else {
      return res.status(404).json({
        message: "Marketplace package update unsuccessful - package not found",
        result: result,
        status: false,
      });
    }
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({
        error: err.details[0].message,
        status: false,
      });
    }

    console.error("Error updating marketplace package:", err);
    return res.status(500).json({
      error: "An error occurred while updating marketplace package",
      status: false,
      details: err.message,
    });
  }
};

exports.getMarketplacePackageById = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const { id } = await MarketPriceValidate.IdparamsSchema.validateAsync(req.params);

    const resultRows = await MarketPlaceDao.getMarketplacePackageByIdDAO(id);

    // Take common fields from the first row
    const firstRow = resultRows[0];

    const productPrice = parseFloat(firstRow.productPrice) || 0;
    const packingFee = parseFloat(firstRow.packingFee) || 0;
    const serviceFee = parseFloat(firstRow.serviceFee) || 0;

    const total = productPrice + packingFee + serviceFee;

    const packageData = {
      displayName: firstRow.displayName,
      status: firstRow.status || 'Enabled',
      description: firstRow.description,
      productPrice,
      packageFee: packingFee,
      serviceFee,
      approximatedPrice: parseFloat(total.toFixed(2)),
      imageUrl: firstRow.image && !firstRow.image.startsWith("http")
        ? `${req.protocol}://${req.get("host")}/${firstRow.image}`
        : firstRow.image,
      quantities: {}
    };

    // Build quantities map
    resultRows.forEach(row => {
      packageData.quantities[row.productTypeId] = row.qty;
    });
    console.log(packageData);

    res.json(packageData);
    console.log("Successfully fetched marketplace package");
  } catch (error) {
    console.error("Error fetching marketplace package:", error);

    if (error.message === "Package not found") {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching marketplace package",
    });
  }
};


exports.getMarketplacePackageWithDetailsById = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const { id } = await MarketPriceValidate.IdparamsSchema.validateAsync(
      req.params
    );

    const packageData =
      await MarketPlaceDao.getMarketplacePackageByIdWithDetailsDAO(id);

    // Calculate total price and product type totals
    const baseTotal =
      packageData.productPrice +
      packageData.packingFee +
      packageData.serviceFee;

    // Calculate total value of all items in package
    const productsTotal = packageData.packageDetails.reduce((sum, item) => {
      return sum + item.productType.price * item.qty;
    }, 0);

    // Format the response with enhanced details
    const formattedResponse = {
      ...packageData,
      pricingSummary: {
        basePrice: packageData.productPrice,
        packingFee: packageData.packingFee,
        serviceFee: packageData.serviceFee,
        productsTotal: productsTotal,
        grandTotal: baseTotal + productsTotal,
      },
      packageDetails: packageData.packageDetails.map((detail) => ({
        ...detail,
        totalPrice: detail.productType.price * detail.qty,
      })),
    };

    const response = {
      success: true,
      message: "Marketplace package retrieved successfully",
      data: formattedResponse,
    };

    res.status(200).json(response);
    console.log("Successfully fetched marketplace package with details");
  } catch (error) {
    console.error("Error fetching marketplace package:", error.message);

    // Handle "Package not found" error specifically
    if (error.message === "Package not found") {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    // Generic error handler
    res.status(500).json({
      success: false,
      error:
        "An internal server error occurred while fetching marketplace package",
    });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Check if package is already parsed or needs parsing
    let package;
    if (typeof req.body.package === "string") {
      package = JSON.parse(req.body.package);
    } else {
      package = req.body.package; // Already an object
    }

    console.log("Received package data:", package);

    let profileImageUrl = package.existingImage || null;

    if (req.body.file) {
      try {
        const base64String = req.body.file.split(",")[1];
        const mimeType = req.body.file.match(/data:(.*?);base64,/)[1];
        const fileBuffer = Buffer.from(base64String, "base64");
        const fileExtension = mimeType.split("/")[1];
        const fileName = `${package.displayName}.${fileExtension}`;

        profileImageUrl = await uploadFileToS3(
          fileBuffer,
          fileName,
          "marketplacepackages/image"
        );
      } catch (err) {
        console.error("Error processing image file:", err);
        return res.status(400).json({
          error: "Invalid file format or file upload error",
          status: false,
        });
      }
    }

    // Update main package
    const updatedRows = await MarketPlaceDao.updatePackageDAO(
      package,
      profileImageUrl,
      package.packageId || req.params.id
    );

    if (updatedRows === 0) {
      return res.status(404).json({
        message: "Package not found or no changes made",
        status: false,
      });
    }

    // Handle package details updates
    try {
      // First delete all existing details
      if (typeof MarketPlaceDao.deletePackageDetails === "function") {
        await MarketPlaceDao.deletePackageDetails(
          package.packageId || req.params.id
        );
      } else {
        throw new Error("deletePackageDetails DAO function not available");
      }

      // Then recreate all items from the request
      for (const item of package.Items) {
        await MarketPlaceDao.creatPackageDetailsDAOEdit(
          item,
          package.packageId || req.params.id
        );
      }
    } catch (err) {
      console.error("Error updating package details:", err);
      return res.status(500).json({
        error: "Error updating package details: " + err.message,
        status: false,
      });
    }

    return res.status(200).json({
      message: "Package updated successfully",
      status: true,
      packageId: package.packageId || req.params.id,
    });
  } catch (err) {
    console.error("Error updating package:", err);
    return res.status(500).json({
      error: "An error occurred while updating marketplace package",
      status: false,
    });
  }
};

exports.getMarketplaceUsers = async (req, res) => {
  const buyerType = req.query.buyerType || "retail"; // default to 'retail'
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("URL:", fullUrl);

  try {
    const result = await MarketPlaceDao.getMarketplaceUsers(buyerType);
    console.log("Successfully fetched marketplace users");
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching marketplace users:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching marketplace users" });
  }
};

exports.getMarketplaceUsers = async (req, res) => {
  const buyerType = req.query.buyerType || "retail"; // default to 'retail'
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("URL:", fullUrl);

  try {
    const result = await MarketPlaceDao.getMarketplaceUsers(buyerType);
    console.log("Successfully fetched marketplace users");
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching marketplace users:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching marketplace users" });
  }
};

exports.getNextBannerIndexRetail = async (req, res) => {
  try {
    const nextOrderNumber = await MarketPlaceDao.getNextBannerIndexRetail(); // Call the DAO function
    res.status(200).json({
      success: true,
      nextOrderNumber: nextOrderNumber,
    });
  } catch (error) {
    console.error("Error fetching next order number:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve the next order number.",
      error: error.message,
    });
  }
};

exports.getNextBannerIndexWholesale = async (req, res) => {
  try {
    const nextOrderNumber = await MarketPlaceDao.getNextBannerIndexWholesale(); // Call the DAO function
    res.status(200).json({
      success: true,
      nextOrderNumber: nextOrderNumber,
    });
  } catch (error) {
    console.error("Error fetching next order number:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve the next order number.",
      error: error.message,
    });
  }
};

exports.uploadBanner = async (req, res) => {
  try {
    const validatedBody = req.body;

    const { index, name } = validatedBody;

    let image;

    if (req.file) {
      const fileBuffer = req.file.buffer;
      const fileName = req.file.originalname;

      image = await uploadFileToS3(
        fileBuffer,
        fileName,
        "marketplacebanners/image"
      );
    }

    const bannerData = {
      index,
      name,
      image,
    };

    const result = await MarketPlaceDao.createBanner(bannerData);

    console.log("PlantCare user created successfully");
    return res.status(201).json({
      message: result.message,
    });
  } catch (error) {
    console.error("Error creating PlantCare user:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating PlantCare user" });
  }
};

exports.uploadBannerWholesale = async (req, res) => {
  try {
    const validatedBody = req.body;

    const { index, name } = validatedBody;

    let image;

    if (req.file) {
      const fileBuffer = req.file.buffer;
      const fileName = req.file.originalname;

      image = await uploadFileToS3(
        fileBuffer,
        fileName,
        "marketplacebanners/image"
      );
    }

    const bannerData = {
      index,
      name,
      image,
    };

    const result = await MarketPlaceDao.createBannerWholesale(bannerData);

    console.log("PlantCare user created successfully");
    return res.status(201).json({
      message: result.message,
    });
  } catch (error) {
    console.error("Error creating PlantCare user:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating PlantCare user" });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await MarketPlaceDao.getAllBanners();

    console.log("Successfully fetched feedback list");
    res.json({
      banners,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};

exports.getAllBannersWholesale = async (req, res) => {
  try {
    const banners = await MarketPlaceDao.getAllBannersWholesale();

    console.log("Successfully fetched feedback list");
    res.json({
      banners,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};

exports.updateBannerOrder = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
    const feedbacks = req.body.feedbacks; // Array of {id, orderNumber}
    const result = await MarketPlaceDao.updateBannerOrder(feedbacks);

    if (result) {
      return res.status(200).json({
        status: true,
        message: "Feedback order updated successfully",
      });
    }

    return res.status(400).json({
      status: false,
      message: "Failed to update feedback order",
    });
  } catch (error) {
    console.error("Error in updateFeedbackOrder:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

exports.deleteBannerRetail = async (req, res) => {
  const bannerId = parseInt(req.params.id, 10);

  if (isNaN(bannerId)) {
    return res.status(400).json({ error: "Invalid bannerId ID" });
  }

  try {
    // Retrieve the feedback's current orderNumber before deletion
    const banner = await MarketPlaceDao.getBannerById(bannerId);
    if (!banner) {
      return res.status(404).json({ error: "banner not found" });
    }

    const orderNumber = banner.indexId;

    // Delete feedback and update subsequent order numbers
    const result = await MarketPlaceDao.deleteBannerRetail(
      bannerId,
      orderNumber
    );

    return res.status(200).json({
      message: "banner deleted and order updated successfully",
      result,
    });
  } catch (error) {
    console.error("Error deleting feedbannerback:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteBannerWhole = async (req, res) => {
  const bannerId = parseInt(req.params.id, 10);

  if (isNaN(bannerId)) {
    return res.status(400).json({ error: "Invalid bannerId ID" });
  }

  try {
    // Retrieve the feedback's current orderNumber before deletion
    const banner = await MarketPlaceDao.getBannerById(bannerId);
    if (!banner) {
      return res.status(404).json({ error: "banner not found" });
    }

    const orderNumber = banner.indexId;

    // Delete feedback and update subsequent order numbers
    const result = await MarketPlaceDao.deleteBannerWhole(
      bannerId,
      orderNumber
    );

    return res.status(200).json({
      message: "banner deleted and order updated successfully",
      result,
    });
  } catch (error) {
    console.error("Error deleting feedbannerback:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.createProductType = async (req, res) => {
  try {
    const data =
      await MarketPriceValidate.createProductTypeSchema.validateAsync(req.body);
    const result = await MarketPlaceDao.createProductTypesDao(data);

    if (result.affectedRows === 0) {
      return res.json({
        message: "Product type creation failed",
        status: false,
      });
    }

    return res.status(201).json({
      message: "Product type created successfully",
      status: true,
    });
  } catch (error) {
    console.error("Error creating Product type:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.viewProductType = async (req, res) => {
  try {
    const result = await MarketPlaceDao.viewProductTypeDao();

    return res.status(201).json({
      message: "Product find successfully",
      status: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating Product type:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.getProductType = async (req, res) => {
  try {
    const result = await MarketPlaceDao.getProductType();

    return res.status(201).json({
      message: "Product find successfully",
      status: true,
      data: result
    });
  } catch (error) {
    console.error("Error creating Product type:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.editPackage = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const package = JSON.parse(req.body.package);
    const id = req.params.id;
    console.log(id);
    console.log(package);
    console.log(req.body.file);

    let profileImageUrl = null;

    // Check if a new image file was uploaded
    if (req.body.file) {
      // Delete old image from S3 if it exists
      const imageUrl = package.imageUrl;
      if (imageUrl) {
        await deleteFromS3(imageUrl);
      }

      try {
        const base64String = req.body.file.split(",")[1];
        const mimeType = req.body.file.match(/data:(.*?);base64,/)[1];
        const fileBuffer = Buffer.from(base64String, "base64");
        const fileExtension = mimeType.split("/")[1];
        const fileName = `${package.displayName}.${fileExtension}`;

        profileImageUrl = await uploadFileToS3(
          fileBuffer,
          fileName,
          "marketplacepackages/image"
        );
      } catch (err) {
        console.error("Error processing image file:", err);
        return res.status(400).json({
          error: "Invalid file format or file upload error",
          status: false,
        });
      }
    } else {
      // No new image uploaded, keep the existing image URL
      profileImageUrl = package.imageUrl;
    }

    console.log(profileImageUrl);

    // Update main package
    const results = await MarketPlaceDao.editPackageDAO(
      package,
      profileImageUrl,
      id
    );

    if (!results) {
      return res.status(500).json({
        message: "Package update failed",
        status: false,
      });
    }

    // Update package details
    try {
      const quantities = package.quantities; // object like { '2': 2, '3': 0 }

      for (const [productTypeId, qty] of Object.entries(quantities)) {
        // Skip if quantity is 0 or less
        if (qty <= 0) continue;

        // Construct item data for DAO
        const itemData = {
          productTypeId: parseInt(productTypeId),
          qty: parseInt(qty)
        };

        await MarketPlaceDao.editPackageDetailsDAO(itemData, id);
      }
    } catch (err) {
      console.error("Error updating package details:", err);
      return res.status(500).json({
        error: "Error updating package details",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Package updated successfully",
      status: true,
      id: id,
    });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({
        error: err.details[0].message,
        status: false,
      });
    }

    console.error("Error updating package:", err);
    return res.status(500).json({
      error: "An error occurred while updating marketplace package",
      status: false,
    });
  }
};


exports.getProductTypeById = async (req, res) => {
  try {
    const { id } = await MarketPriceValidate.IdparamsSchema.validateAsync(req.params);

    const result = await MarketPlaceDao.getProductTypeByIdDao(id);

    res.status(201).json({
      message: "Product find successfully",
      status: true,
      data: result
    });
  } catch (error) {
    console.error("Error creating Product type:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.editProductType = async (req, res) => {
  try {
    const { id } = await MarketPriceValidate.IdparamsSchema.validateAsync(req.params);
    const data = await MarketPriceValidate.createProductTypeSchema.validateAsync(req.body);
    const result = await MarketPlaceDao.editProductTypesDao(data, id);

    if (result.affectedRows === 0) {
      return res.json({
        message: "Product type edit failed",
        status: false,
      });
    }

    return res.status(201).json({
      message: "Product type edit successfully",
      status: true,
    });
  } catch (error) {
    console.error("Error edit Product type:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.deleteProductType = async (req, res) => {
  try {
    const { id } = await MarketPriceValidate.IdparamsSchema.validateAsync(req.params);
    const result = await MarketPlaceDao.DeleteProductTypeByIdDao( id);

    if (result.affectedRows === 0) {
      return res.json({
        message: "Product type delete failed",
        status: false,
      });
    }

    return res.status(201).json({
      message: "Product type delete successfully",
      status: true,
    });
  } catch (error) {
    console.error("Error edit Product type:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};