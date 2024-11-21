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
        const product = await MarketPriceValidate.AddProductValidation.validateAsync(req.body)
        
        const result = await MarketPlaceDao.createCropGroup(product)
        console.log("marcket product creation success");
        return res
            .status(201)
            .json({ message: "marcket product created successfully",result:result,status:true});
    } catch (err) {
        if (err.isJoi) {
            // Validation error
            return res.status(400).json({ error: err.details[0].message,status:false });
        }

        console.error("Error executing query:", err);
        return res
            .status(500)
            .json({ error: "An error occurred while creating marcket product" ,status:false});
    }
}

exports.getMarketplaceItems = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    console.log("Request URL:", fullUrl);

    const marketplaceItems = await MarketPlaceDao.getMarketplaceItems();

    console.log("Successfully fetched marketplace items");

    res.json({items:marketplaceItems, total:10});
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
          .json({ message: "coupen created successfully",result:result,status:true});
  } catch (err) {
      if (err.isJoi) {
          // Validation error
          return res.status(400).json({ error: err.details[0].message,status:false });
      }

      console.error("Error executing query:", err);
      return res
          .status(500)
          .json({ error: "An error occurred while creating marcket product" ,status:false});
  }
}
