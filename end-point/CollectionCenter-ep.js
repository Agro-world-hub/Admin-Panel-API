const CollectionCenterDao = require("../dao/CollectionCenter-dao");
const ValidateSchema = require("../validations/CollectionCenter-validation");

exports.getAllCollectionCenter = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
    const result = await CollectionCenterDao.GetAllCenterDAO();

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

exports.getAllCollectionCenterByCompany = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const companyId = req.params.companyId;
    const result = await CollectionCenterDao.GetCentersByCompanyIdDAO(
      companyId
    );

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

    const id = req.params.id;

    const affectedRows = await CollectionCenterDao.deleteCollectionCenterDAo(
      id
    );

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
    const { page, limit, status, category, comCategory, searchText, rpstatus } =
      req.query;

    const { results, total } = await CollectionCenterDao.GetAllComplainDAO(
      page,
      limit,
      status,
      category,
      comCategory,
      searchText,
      rpstatus
    );

    console.log('results', results)

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

exports.getAllCenterComplains = async (req, res) => {
  try {
    console.log(req.query);
    const {
      page,
      limit,
      status,
      category,
      comCategory,
      filterCompany,
      searchText,
      rpstatus,
    } = req.query;

    const { results, total } =
      await CollectionCenterDao.GetAllCenterComplainDAO(
        page,
        limit,
        status,
        category,
        comCategory,
        filterCompany,
        searchText,
        rpstatus
      );

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
    const id = req.params.id;

    const result = await CollectionCenterDao.getComplainById(id);
    console.log(result[0]);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No Complain foundd", data: result[0] });
    }

    console.log("Successfully retrieved Farmer Complain");
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

exports.getCenterComplainById = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await CollectionCenterDao.getCenterComplainById(id);
    console.log(result[0]);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No Center Complain founded", data: result[0] });
    }

    console.log("Successfully retrieved collection center Complains");
    res.json(result[0]);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      console.error("Validation error:", err.details[0].message);
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching news:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching center complains" });
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
      city,
      district,
      province,
      country,
      companies,
      // } = await ValidateSchema.createCollectionCenterValidation.validateAsync(req.body)
    } = req.body;
    console.log("Collection Centr", regCode, centerName);

    const existRegCode = await CollectionCenterDao.CheckRegCodeExistDAO(
      regCode
    );
    console.log("existRegCode", existRegCode);

    if (existRegCode.length > 0) {
      return res.json({
        message: "This RegCode allrady exist!",
        status: false,
      });
    }

    const result = await CollectionCenterDao.addCollectionCenter(
      regCode,
      centerName,
      contact01,
      contact02,
      buildingNumber,
      street,
      city,
      district,
      province,
      country,
      contact01Code,
      contact02Code
    );

    if (companies && companies.length > 0) {
      const centerId = result.insertId; // Assuming the ID of the new collection center is returned in `result.insertId`
      await CollectionCenterDao.addCompaniesToCenter(centerId, companies);
    }

    console.log(" Collection Center creation success");
    return res.status(201).json({ result: result, status: true });
  } catch (err) {
    if (err.isJoi) {
      return res
        .status(400)
        .json({ error: err.details[0].message, status: false });
    }
    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating Crop Calendar tasks" });
  }
};

exports.getAllCollectionCenterPage = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    const { page, limit, district, province, searchItem } =
      await ValidateSchema.getAllUsersSchema.validateAsync(req.query);

    const offset = (page - 1) * limit;

    const { total, items } = await CollectionCenterDao.getAllCenterPage(
      limit,
      offset,
      district,
      province,
      searchItem
    );

    console.log(items);

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
      return res.json({
        message: "No collection center availabale",
        status: false,
      });
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

    const collectionID = req.params.id;

    const {
      regCode,
      centerName,
      code1,
      contact01,
      code2,
      contact02,
      buildingNumber,
      street,
      city,
      district,
      province,
      country,
      companies, // List of company IDs
    } = req.body;

    // Check if the RegCode already exists
    // if (regCode) {
    //   const existRegCode = await CollectionCenterDao.CheckRegCodeExistDAO(regCode);
    //   if (existRegCode.length > 0) {
    //     return res.json({ message: "This RegCode already exists!", status: false });
    //   }
    // }

    // Step 1: Update the collectioncenter table
    const result = await CollectionCenterDao.updateCollectionCenter(
      regCode,
      centerName,
      code1,
      contact01,
      code2,
      contact02,
      buildingNumber,
      street,
      city,
      district,
      province,
      country,
      collectionID
    );

    // Step 2: Delete existing company associations from companycenter table
    await CollectionCenterDao.deleteCompaniesFromCompanyCenter(collectionID);

    // Step 3: Insert new companies into the companycenter table
    if (companies && companies.length > 0) {
      await CollectionCenterDao.insertCompaniesIntoCompanyCenter(
        companies,
        collectionID
      );
    }

    console.log("Collection Center update successful");
    return res.status(201).json({ result: result, status: true });
  } catch (err) {
    if (err.isJoi) {
      return res
        .status(400)
        .json({ error: err.details[0].message, status: false });
    }
    console.error("Error executing query:", err);
    return res.status(500).json({
      error: "An error occurred while updating the Collection Center",
    });
  }
};

exports.sendComplainReply = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    const complaignId = req.params.id;

    const reply = req.body.reply;
    console.log("Collection Centr", complaignId, reply);

    if (reply == null) {
      return res.status(401).json({ error: "Reply can not be empty" });
    }

    const result = await CollectionCenterDao.sendComplainReply(
      complaignId,
      reply
    );

    console.log("Send Reply Success");
    return res.status(201).json({ result: result, status: true });
  } catch (err) {
    if (err.isJoi) {
      return res
        .status(400)
        .json({ error: err.details[0].message, status: false });
    }
    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating Reply tasks" });
  }
};

exports.sendCenterComplainReply = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    const complaignId = req.params.id;

    const reply = req.body.reply;
    console.log("Collection Centre Complain : ", complaignId, reply);

    if (reply == null) {
      return res.status(401).json({ error: "Reply can not be empty" });
    }

    const result = await CollectionCenterDao.sendCenterComplainReply(
      complaignId,
      reply
    );

    console.log("Send Reply Success");
    return res.status(201).json({ result: result, status: true });
  } catch (err) {
    if (err.isJoi) {
      return res
        .status(400)
        .json({ error: err.details[0].message, status: false });
    }
    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while creating Reply tasks" });
  }
};

exports.getForCreateId = async (req, res) => {
  try {
    const { role } = await ValidateSchema.getRoleShema.validateAsync(
      req.params
    );
    const results = await CollectionCenterDao.getForCreateId(role);

    if (results.length === 0) {
      return res.json({ result: { empId: "00001" }, status: true });
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
    const companyType = req.query.type
    console.log('companyType:',companyType);
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
      foEmail,
      logo,
      favicon,
    } = req.body;

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
      foEmail,
      logo,
      favicon,
      companyType
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
    const result = await CollectionCenterDao.GetAllCompanyList();

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
    const companyId = req.params.companyId;
    const centerId = req.params.centerId;
    console.log(companyId, centerId);

    const result = await CollectionCenterDao.GetAllManagerList(
      companyId,
      centerId
    );

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

exports.generateRegCode = (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);
  const { province, district, city } = req.body;

  // Call DAO to generate the regCode
  CollectionCenterDao.generateRegCode(
    province,
    district,
    city,
    (err, regCode) => {
      if (err) {
        return res.status(500).json({ error: "Error generating regCode" });
      }

      res.json({ regCode });
    }
  );
};

exports.getAllCompanies = async (req, res) => {
  try {
    console.log(req.query);
    const { status = null, search } = req.query;

    // Call the DAO function
    const results = await CollectionCenterDao.getAllCompanyDAO(search);

    console.log("Successfully retrieved all companies");
    res.json({ results, total: results.length }); // Provide total as the length of results
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      console.error("Validation error:", err.details[0].message);
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching companies:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching companies" });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const results = await CollectionCenterDao.getCompanyDAO(id);

    if (results.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    console.log("Successfully retrieved company");
    console.log(results[0]);

    res.json(results[0]);
  } catch (err) {
    console.error("Error fetching company:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the company" });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    // Properly format and log the full URL
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(`Full URL: ${fullUrl}`);

    // Extract the company ID from request parameters
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ message: "Company ID is required", status: false });
    }

    // Destructure request body to get the fields
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
      foEmail,
      status,
      logo,
      favicon,
    } = req.body;
    // Call DAO function to update the company record
    const result = await CollectionCenterDao.updateCompany(
      id,
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
      foEmail,
      status,
      logo,
      favicon
    );

    // Check if any rows were affected (successful update)
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({
        message: "Company not found or no changes made",
        status: false,
      });
    }

    console.log("Company update success");
    return res
      .status(200)
      .json({ message: "Company updated successfully", status: true });
  } catch (err) {
    // Handle validation errors specifically
    if (err.isJoi) {
      return res
        .status(400)
        .json({ error: err.details[0].message, status: false });
    }

    // Log unexpected errors
    console.error("Error executing query:", err);
    return res.status(500).json({
      error: "An error occurred while updating the company",
      status: false,
    });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const id = req.params.id;

    const affectedRows = await CollectionCenterDao.deleteCompanyById(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Company not found" });
    } else {
      console.log("Company deleted successfully");
      return res.status(200).json({ status: true });
    }
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error deleting company:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the company" });
  }
};

exports.getAllCropCatogory = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    const result = await CollectionCenterDao.getAllCropNameDAO();

    console.log("Successfully fetched gatogory");
    return res.status(200).json(result);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }
    console.error("Error fetching crop names and verity:", error);
    return res.status(500).json({
      error: "An error occurred while fetching crop names and verity",
    });
  }
};

//tis
exports.addDailyTarget = async (req, res) => {
  try {
    const target = req.body;
    // const userId = req.user.userId;

    console.log(target);

    const targetId = await CollectionCenterDao.createDailyTargetDao(target);
    if (!targetId) {
      return res.json({
        message: "Faild create target try again!",
        status: false,
      });
    }

    for (let i = 0; i < target.TargetItems.length; i++) {
      await CollectionCenterDao.createDailyTargetItemsDao(
        target.TargetItems[i],
        targetId
      );
    }
    console.log("Daily Target Created Successfully");
    res.json({ message: "Daily Target Created Successfully!", status: true });
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

exports.getCenterDashbord = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const { id } = req.params;
    const officerCount =
      await CollectionCenterDao.getCenterNameAndOficerCountDao(id);
    const transCount = await CollectionCenterDao.getTransactionCountDao(id);
    const transAmountCount =
      await CollectionCenterDao.getTransactionAmountCountDao(id);
    const resentCollection = await CollectionCenterDao.getReseantCollectionDao(
      id
    );
    const totExpences = await CollectionCenterDao.getTotExpencesDao(id);
    const difExpences = await CollectionCenterDao.differenceBetweenExpences(id);

    const limitedResentCollection = resentCollection.slice(0, 5);

    console.log("Successfully fetched gatogory");
    return res.status(200).json({
      officerCount,
      transCount,
      transAmountCount,
      limitedResentCollection,
      totExpences,
      difExpences,
    });
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching crop names and verity:", error);
    return res.status(500).json({
      error: "An error occurred while fetching crop names and verity",
    });
  }
};

exports.getCompanyHead = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    const { companyId, page, limit, searchText } = req.query;
    // console.log(searchText);
    // const { page, limit, searchText } =
    //   await cropCalendarValidations.getAllCropCalendarSchema.validateAsync(
    //     req.query
    //   );
    const offset = (page - 1) * limit;

    const { total, items } = await CollectionCenterDao.getcompanyHeadData(
      companyId,
      limit,
      offset,
      searchText
    );

    console.log({ items, total });
    res.json({
      items,
      total,
    });
  } catch (err) {
    // if (err.isJoi) {
    //   // Validation error
    //   return res.status(400).json({ error: err.details[0].message });
    // }

    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};

exports.deleteCompanyHead = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the request parameters
    const { id } = await ValidateSchema.deleteCompanyHeadSchema.validateAsync(
      req.params
    );

    const affectedRows = await CollectionCenterDao.deleteCompanyHeadData(id);

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

exports.GetComplainCategoriesByRole = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    const roleId = req.params.roleId;
    const appId = req.params.appId;
    console.log(roleId);

    const result = await CollectionCenterDao.GetComplainCategoriesByRole(
      roleId,
      appId
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No complain categories not found", data: result });
    }

    console.log("Successfully retrieved all complain categories");
    res.json(result);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      console.error("Validation error:", err.details[0].message);
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching news:", err);
    res
      .status(500)
      .json({ error: "An error occurred while complain categories" });
  }
};

exports.GetComplainCategoriesByRoleSuper = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    const appId = req.params.appId;

    const result = await CollectionCenterDao.GetComplainCategoriesByRoleSuper(
      appId
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No complain categories not found", data: result });
    }

    console.log("Successfully retrieved all complain categories");
    res.json(result);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      console.error("Validation error:", err.details[0].message);
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching news:", err);
    res
      .status(500)
      .json({ error: "An error occurred while complain categories" });
  }
};

exports.GetAllCompanyForOfficerComplain = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);

  try {
    const result = await CollectionCenterDao.GetAllCompanyForOfficerComplain();

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No complain categories not found", data: result });
    }

    console.log("Successfully retrieved all complain categories");
    res.json(result);
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      console.error("Validation error:", err.details[0].message);
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching news:", err);
    res
      .status(500)
      .json({ error: "An error occurred while complain categories" });
  }
};

exports.getAllCollectionCenterPageAW = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);
  try {
    const { page, limit, companyId, district, province, searchItem } =
      await ValidateSchema.getAWCentersSchema.validateAsync(req.query);

    const offset = (page - 1) * limit;

    const { total, items } = await CollectionCenterDao.getAllCenterPageAW(
      limit,
      offset,
      district,
      province,
      searchItem,
      companyId
    );

    console.log(items);

    console.log(page);
    console.log(limit);
    console.log("hit 01", searchItem);
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
