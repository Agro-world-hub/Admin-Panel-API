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
