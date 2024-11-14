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