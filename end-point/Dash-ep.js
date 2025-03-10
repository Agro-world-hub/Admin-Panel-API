const DashDao = require("../dao/Dash-dao");
const ValidateSchema = require("../validations/SalesAgentDash-validation");

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


  exports.getAllSalesAgents = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
  
    try {
      // Validate query parameters
      // const validatedQuery =
      //   await collectionofficerValidate.getAllCollectionOfficersSchema.validateAsync(
      //     req.query
      //   );

      const {page, limit, searchText, status} = req.query;
  
      // const { page, limit, nic, company } = validatedQuery;
  
      // Call the DAO to get all collection officers
      const result = await DashDao.getAllSalesAgents(
        page,
        limit,
        searchText,
        status
      );
  
      console.log({page, limit});
      return res.status(200).json(result);
    } catch (error) {
      // if (error.isJoi) {
      //   // Handle validation error
      //   return res.status(400).json({ error: error.details[0].message });
      // }
  
      console.error("Error fetching collection officers:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching collection officers" });
    }
  };

  exports.deleteSalesAgent = async (req, res) => {
    try {
      const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      console.log("Request URL:", fullUrl);
  
      // Validate the request parameters
      const { id } =
        await ValidateSchema.deleteSalesAgentSchema.validateAsync(
          req.params
        );
  
      const affectedRows = await DashDao.deleteSalesAgent(id);
  
      if (affectedRows === 0) {
        return res.status(404).json({ message: "company head not found" });
      } else {
        console.log("company head deleted successfully");
        return res.status(200).json({ status: true });
      }
    } catch (err) {
      if (err.isJoi) {
        // Validation error
        return res.status(400).json({ error: err.details[0].message });
      }
  
      console.error("Error deleting company head:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while deleting company head" });
    }
  };
  