const DashDao = require("../dao/Dash-dao")

exports.getAllCustomers = async (req, res) => {
    try {
      const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      console.log("Request URL:", fullUrl);
      
      const items = await DashDao.getAllCustomers();
      
      if (items.length === 0) {
        return res.status(404).json({ message: "No customers found", data: items });
      }
      
      console.log("Successfully fetched customers");
      res.json(items);
    } catch (err) {
      if (err.isJoi) {
        console.error("Validation error:", err.details[0].message);
        return res.status(400).json({ error: err.details[0].message });
      }
      
      console.error("Error fetching customers:", err);
      res.status(500).json({ error: "An error occurred while fetching customers" });
    }
  };
  