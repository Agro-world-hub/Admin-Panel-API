const TargetDAO = require('../dao/Target-dao')
const TargetValidate = require('../validations/Target-validation')

exports.getSelectedOfficerTarget = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
  
    try {
  
      // const { officerId, status, search } = req.query
  
      const { officerId, status, search } = await TargetValidate.getSelectedOfficerTargetSchema.validateAsync(req.query);
      console.log(status, search);
  
      const  results  = await TargetDAO.getOfficerTargetDao(officerId, status, search);
      console.log(results)
      console.log("success fully fetched results");
      return res.status(200).json({ items: results });
    } catch (error) {
      if (error.isJoi) {
        return res.status(400).json({ error: error.details[0].message });
      }
      console.error("Error fetching collection officers:", error);
  
  
      return res.status(500).json({ error: "An error occurred while fetching collection officers" });
    }
  };