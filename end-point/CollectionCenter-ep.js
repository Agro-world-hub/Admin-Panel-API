const CollectionCenterDao = require('../dao/CollectionCenter-dao')

exports.getAllCollectionCenter = async (req, res) => {
  try {

    const result = await CollectionCenterDao.GetAllCenterDAO()

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No news items found", data: result });
    }

    console.log("Successfully retrieved all collection center");
    res.json(result);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      console.error("Validation error:", err.details[0].message);
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching news:", err);
    res.status(500).json({ error: "An error occurred while fetching news" });
  }
};

//delete collection center
exports.deleteCollectionCenter = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const id = req.params.id

    const affectedRows = await CollectionCenterDao.deleteCollectionCenterDAo(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Crop Calendar not found" });
    } else {
      console.log("Crop Calendar deleted successfully");
      return res.status(200).json({ status: true });
    }
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error deleting crop calendar:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting crop calendar" });
  }
};

exports.addNewCollectionCenter = async (req, res) => {
  try {
    const centerData = {
      regCode: req.body.regCode,
      centerName: req.body.centerName,
      contact01: req.body.contact01,
      contact02: req.body.contact02,
      buildingNumber: req.body.buildingNumber,
      street: req.body.street,
      district: req.body.district,
      province: req.body.province,
    };
    console.log("Add Collection center success", centerData);

    const result = await CollectionCenterDao.addCollectionCenter(
      centerData.regCode,
      centerData.centerName,
      centerData.contact01,
      centerData.contact02,
      centerData.buildingNumber,
      centerData.street,
      centerData.district,
      centerData.province
    );

    console.log("Insert result:", result);

    res.status(201).json({
      success: true,
      message: "Collection Center added successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding collection center",
      error: error.message,
    });
  }
};


//get all complains
exports.getAllComplains = async (req, res) => {
  try {
    console.log(req.query);
    const {page, limit} = req.query
    
    const { results, total } = await CollectionCenterDao.GetAllComplainDAO(page, limit)

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No news items found", data: result });
    }

    console.log("Successfully retrieved all collection center");
    res.json({ results, total });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      console.error("Validation error:", err.details[0].message);
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching news:", err);
    res.status(500).json({ error: "An error occurred while fetching news" });
  }
};
