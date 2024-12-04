const MarketPlaceDao = require('../dao/MarketPlace-dao')
const MarketPriceValidate = require('../validations/MarketPlace-validation');


//get all crop category
exports.getAllCropCatogory = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const result = await MarketPlaceDao.getAllCropNameDAO()

    console.log("Successfully fetched gatogory");
    return res.status(200).json(result);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching collection officers:", error);
    return res.status(500).json({ error: "An error occurred while fetching collection officers" });
  }
};


exports.createMarketProduct = async (req, res) => {
  try {  
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
    // const product = await MarketPriceValidate.AddProductValidation.validateAsync(req.body)

    const result = await MarketPlaceDao.createCropGroup(req.body)
    console.log(result);
    
    console.log("marcket product creation success");
    return res
      .status(201)
      .json({ message: "marcket product created successfully", result: result, status: true });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message, status: false });
    }

    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating marcket product", status: false });
  }
}

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

    const coupen = await MarketPriceValidate.CreateCoupenValidation.validateAsync(req.body)
    console.log(coupen);


    const result = await MarketPlaceDao.createCoupenDAO(coupen)
    console.log("coupen creation success");
    return res
      .status(201)
      .json({ message: "coupen created successfully", result: result, status: true });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message, status: false });
    }

    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating marcket product", status: false });
  }
}


exports.getAllCoupen = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);


    const { page, limit, status, types, searchText } = await MarketPriceValidate.couponQuaryParamSchema.validateAsync(req.query);
    console.log(page, limit, status, types, searchText);

    const offset = (page - 1) * limit;
    const { total, items } = await MarketPlaceDao.getAllCoupenDAO(limit, offset, status, types, searchText);

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
      return res.status(404).json({ message: "Coupen not found", status: false });
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
      return res.status(404).json({ message: "Coupenes not found", status: false });
    } else {
      console.log("Crop Calendar deleted successfully");
      return res.status(200).json({ message: "Coupenes Deleted", status: true });
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
    const result = await MarketPlaceDao.getAllProductCropCatogoryDAO()

    console.log("Successfully fetched gatogory");
    return res.status(200).json(result);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching collection officers:", error);
    return res.status(500).json({ error: "An error occurred while fetching collection officers" });
  }
};

