const MarketPlaceDao = require("../dao/MarketPlace-dao");
const uploadFileToS3 = require("../middlewares/s3upload");
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

    // Prepare the product object based on the DAO expectations
    const product = {
      cropName: req.body.displayName || req.body.cropName,
      normalPrice: req.body.normalPrice,
      discountedPrice: req.body.discountedPrice,
      promo: req.body.promo,
      unitType: req.body.unitType,
      startValue: req.body.startValue,
      changeby: req.body.changeby,
      tags: req.body.tags,
      category: req.body.category,
      discount: req.body.discount,
      varietyId: req.body.varietyId,
    };

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
      // Validation error
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

    const marketplaceItems = await MarketPlaceDao.getMarketplaceItems();

    console.log("Successfully fetched marketplace items");

    res.json({
      items: marketplaceItems,
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
    // console.log(req.body);

    const package = JSON.parse(req.body.package);
    console.log(package);

    let profileImageUrl = null; // Default to null if no image is provided

    if (req.body.file) {
      try {
        const base64String = req.body.file.split(",")[1]; // Extract the Base64 content
        const mimeType = req.body.file.match(/data:(.*?);base64,/)[1]; // Extract MIME type
        const fileBuffer = Buffer.from(base64String, "base64"); // Decode Base64 to buffer

        const fileExtension = mimeType.split("/")[1]; // Extract file extension from MIME type
        const fileName = `${package.displayName}.${fileExtension}`;

        // Upload image to S3
        profileImageUrl = await uploadFileToS3(
          fileBuffer,
          fileName,
          "marketplacepackages/image"
        );
      } catch (err) {
        console.error("Error processing image file:", err);
        return res
          .status(400)
          .json({ error: "Invalid file format or file upload error" });
      }
    }

    console.log(profileImageUrl);

    // const coupen = await MarketPriceValidate.CreateCoupenValidation.validateAsync(req.body)

    const packageResult = await MarketPlaceDao.creatPackageDAO(
      package,
      profileImageUrl
    );
    if (packageResult > 0) {
      return res
        .status(201)
        .json({ message: "Package created Faild!", status: true });
    }
    console.log(packageResult);
    for (let i = 0; i < package.Items.length; i++) {
      console.log(i);
      await MarketPlaceDao.creatPackageDetailsDAO(
        package.Items[i],
        packageResult
      );
    }

    console.log("coupen creation success");
    // result: packageResult,
    return res
      .status(201)
      .json({ message: "Package created successfully", status: true });
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

exports.getProductById = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const { id } = await MarketPriceValidate.IdparamsSchema.validateAsync(
      req.params
    );

    const result = await MarketPlaceDao.getProductById(id);

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
    const packages = await MarketPlaceDao.getAllMarketplacePackagesDAO();

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

// exports.getMarketplacePackageById = async (req, res) => {
//   try {
//     const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
//     console.log("Request URL:", fullUrl);

//     const { id } = await MarketPriceValidate.IdparamsSchema.validateAsync(
//       req.params
//     );

//     const result = await MarketPlaceDao.getMarketplacePackageByIdDAO(id);

//     res.json(result);
//     console.log("Successfully fetched marketplace package");
//   } catch (error) {
//     console.error("Error fetching marketplace package:", error);
//     return res.status(500).json({
//       error: "An error occurred while fetching marketplace package",
//     });
//   }
// };

exports.getMarketplacePackageById = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const { id } = await MarketPriceValidate.IdparamsSchema.validateAsync(
      req.params
    );

    const result = await MarketPlaceDao.getMarketplacePackageByIdDAO(id);

    // If you want to modify the image URL to be absolute (if it's stored as relative)
    if (result.image && !result.image.startsWith("http")) {
      result.image = `${req.protocol}://${req.get("host")}/${result.image}`;
    }

    // Format the response structure
    const response = {
      success: true,
      data: {
        package: {
          id: result.id,
          displayName: result.displayName,
          image: result.image,
          description: result.description,
          status: result.status,
          pricing: {
            total: result.total,
            discount: result.discount,
            subtotal: result.subtotal,
          },
          createdAt: result.createdAt,
          items: result.packageDetails.map((detail) => ({
            id: detail.id,
            quantityType: detail.quantityType,
            price: detail.price,
            item: {
              id: detail.mpItemId,
              varietyId: detail.itemDetails.varietyId,
              varietyNameEnglish: detail.itemDetails.varietyNameEnglish, // Added this line
              displayName: detail.itemDetails.displayName,
              category: detail.itemDetails.category,
              pricing: {
                normalPrice: detail.itemDetails.normalPrice,
                discountedPrice: detail.itemDetails.discountedPrice,
                discount: detail.itemDetails.discount,
                promo: detail.itemDetails.promo,
              },
              unitType: detail.itemDetails.unitType,
            },
          })),
        },
      },
    };

    res.json(response);
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

    // Format the response if needed (the DAO already formats it)
    const response = {
      success: true,
      message: "Marketplace package retrieved successfully",
      data: packageData,
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
