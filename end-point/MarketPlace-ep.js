const MarketPlaceDao = require("../dao/MarketPlace-dao");

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
