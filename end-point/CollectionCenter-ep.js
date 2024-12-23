const CollectionCenterDao = require('../dao/CollectionCenter-dao')
const ValidateSchema = require('../validations/CollectionCenter-validation')
exports.getAllCollectionCenter = async (req, res) => {
  
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
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
    const { page, limit, status, searchText } = req.query


    const { results, total } = await CollectionCenterDao.GetAllComplainDAO(page, limit, status, searchText)

   

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

//get complain by id
exports.getComplainById = async (req, res) => {
  try {
    const id = req.params.id

    const result = await CollectionCenterDao.getComplainById(id)
    console.log(result[0]);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No Complain found", data: result[0] });
    }

    console.log("Successfully retrieved collection center");
    res.json(result[0]);
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


exports.createCollectionCenter = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    const {
      regCode,
      centerName,
      contact01Code,
      contact01,
      contact02,
      contact02Code,
      buildingNumber,
      street,
      district,
      province
      // } = await ValidateSchema.createCollectionCenterValidation.validateAsync(req.body)
    } = req.body
    console.log("Collection Centr", regCode, centerName);


    const existRegCode = await CollectionCenterDao.CheckRegCodeExistDAO(regCode);
    console.log("existRegCode", existRegCode);

    if (existRegCode.length > 0) {
      return res.json({ message: "This RegCode allrady exist!", status: false })
    }

    const result = await CollectionCenterDao.addCollectionCenter(regCode, centerName, contact01, contact02, buildingNumber, street, district, province, contact01Code, contact02Code);

    console.log("Crop Collection Center creation success");
    return res.status(201).json({ result: result, status: true });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message, status: false });
    }
    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating Crop Calendar tasks" });
  }
};




exports.getAllCollectionCenterPage = async (req, res) => {
  try {

    const { page, limit, searchItem } =
      await ValidateSchema.getAllUsersSchema.validateAsync(req.query);

    const offset = (page - 1) * limit;


    const { total, items } = await CollectionCenterDao.getAllCenterPage(limit, offset, searchItem);

    console.log(page);
    console.log(limit);
    console.log(searchItem);
    res.json({
      items,
      total,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};


exports.getCenterById = async (req, res) => {
  try {

    const { id } = await ValidateSchema.getByIdShema.validateAsync(req.params);
    const results = await CollectionCenterDao.getCenterByIdDAO(id);

    if (results.length === 0) {
      return res.json({ message: "No collection center availabale", status: false })
    }

    res.status(200).json({ results: results[0], status: true });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};


exports.updateCollectionCenter = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    const collectionID = req.params.id
    const checkRegcode = req.params.regCode

    const {
      regCode,
      centerName,
      buildingNumber,
      street,
      district,
      province
    } = req.body
    console.log("Collection Centr", regCode, centerName);


    if (regCode !== checkRegcode) {
      const existRegCode = await CollectionCenterDao.CheckRegCodeExistDAO(regCode);
      if (existRegCode.length > 0) {
        return res.json({ message: "This RegCode allrady exist!", status: false })
      }
    }



    const result = await CollectionCenterDao.updateCollectionCenter(regCode, centerName, buildingNumber, street, district, province, collectionID);

    console.log("Crop Collection Center update success");
    return res.status(201).json({ result: result, status: true });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message, status: false });
    }
    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating Crop Calendar tasks" });
  }
};




exports.sendComplainReply = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    const complaignId = req.params.id

    const reply = req.body.reply
    console.log("Collection Centr", complaignId, reply);


    if (reply == null) {
      return res.status(401).json({ error: "Reply can not be empty" });
    }



    const result = await CollectionCenterDao.sendComplainReply(complaignId, reply);

    console.log("Send Reply Success");
    return res.status(201).json({ result: result, status: true });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message, status: false });
    }
    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating Reply tasks" });
  }
};


exports.getForCreateId = async (req, res) => {
  try {

    const { role } = await ValidateSchema.getRoleShema.validateAsync(req.params);
    const results = await CollectionCenterDao.getForCreateId(role);

    if (results.length === 0) {
      return res.json({ result: {empId:"00001"}, status: true })
    }

    res.status(200).json({ result: results[0], status: true });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};






exports.createCompany = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
    console.log(req.body);

    // Validate the request body
    const {
      regNumber,
      companyNameEnglish,
      companyNameSinhala,
      companyNameTamil,
      email,
      oicName,
      oicEmail,
      oicConCode1,
      oicConNum1,
      oicConCode2,
      oicConNum2,
      accHolderName,
      accNumber,
      bankName,
      branchName,
      foName,
      foConCode,
      foConNum,
      foEmail
    } =  req.body


    const newsId = await CollectionCenterDao.createCompany(
      regNumber,
      companyNameEnglish,
      companyNameSinhala,
      companyNameTamil,
      email,
      oicName,
      oicEmail,
      oicConCode1,
      oicConNum1,
      oicConCode2,
      oicConNum2,
      accHolderName,
      accNumber,
      bankName,
      branchName,
      foName,
      foConCode,
      foConNum,
      foEmail
    );

    console.log("company creation success");
    return res
      .status(201)
      .json({ message: "company created successfully", id: newsId });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating company" });
  }
};




exports.getAllCompanyList = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
  try {
    

    const result = await CollectionCenterDao.GetAllCompanyList()

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



exports.getAllManagerList = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
  try {
    const companyId = req.params.companyId
    const centerId = req.params.centerId

    const result = await CollectionCenterDao.GetAllManagerList(companyId, centerId)

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No collection Managers found", data: result });
    }

    console.log("Successfully retrieved all collection Managers");
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