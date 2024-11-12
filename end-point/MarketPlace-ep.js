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