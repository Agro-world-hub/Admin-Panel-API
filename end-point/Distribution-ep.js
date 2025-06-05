const DistributionDao = require("../dao/Distribution-dao");
const uploadFileToS3 = require("../middlewares/s3upload");
const DistributionValidation = require("../validations/distribution-validation");

exports.createDistributionCenter = async (req, res) => {
  try {
    // Validate input with Joi
    const data =
      await DistributionValidation.getDistributionCenterDetailsSchema.validateAsync(
        req.body
      );

    // Check for existing NIC or unique field
    // const existing = await DistributionDao.findByName(data.name);
    // if (existing) {
    //   return res.status(409).json({
    //     success: false,
    //     error: "A distribution center with this name already exists."
    //   });
    // }

    // Proceed to create
    const result = await DistributionDao.createDistributionCenter(data);

    return res.status(201).json({
      success: true,
      message: "Distribution center created successfully",
      data: result,
    });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({
        success: false,
        error: err.details[0].message,
      });
    }

    console.error("Server error:", err);
    return res.status(500).json({
      success: false,
      error: "An error occurred while creating distribution center",
    });
  }
};

exports.getAllDistributionCentre = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    const { page, limit, district, province, company, searchItem } =
      await DistributionValidation.getAllDistributionCentreSchema.validateAsync(
        req.query
      );

    const offset = (page - 1) * limit;

    const { total, items } = await DistributionDao.getAllDistributionCentre(
      limit,
      offset,
      district,
      province,
      company,
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

    console.log({ total, items });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    console.log(req.query);
    const { status = null, search } = req.query;
    const results = await DistributionDao.getAllCompanyDAO(search);

    console.log("Successfully retrieved all companies");
    res.json({ results, total: results.length });
  } catch (err) {
    if (err.isJoi) {
      console.error("Validation error:", err.details[0].message);
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching companies:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching companies" });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const id = req.params.id;

    const affectedRows = await DistributionDao.deleteCompanyById(id);

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

exports.getAllDistributionCentreHead = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    const { companyId, page, limit, searchText } = req.query;
    const offset = (page - 1) * limit;

    const { total, items } = await DistributionDao.getAllDistributionCentreHead(
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
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const results = await DistributionDao.getCompanyDAO();
    const companyNames = results.map((company) => company.companyNameEnglish);

    console.log("Successfully retrieved company names");
    res.json({
      success: true,
      message: "Company names retrieved successfully",
      data: companyNames, // Now just an array of strings
    });
  } catch (err) {
    console.error("Error fetching company names:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching company names",
    });
  }
};

exports.createDistributionHead = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const officerData = JSON.parse(req.body.officerData);

    const isExistingNIC = await DistributionDao.checkNICExist(officerData.nic);
    const isExistingEmail = await DistributionDao.checkEmailExist(
      officerData.email
    );

    if (isExistingNIC) {
      return res.status(500).json({
        error: "NIC already exists",
      });
    }

    if (isExistingEmail) {
      return res.status(500).json({
        error: "Email already exists",
      });
    }

    let profileImageUrl = null; // Default to null if no image is provided

    // Check if an image file is provided
    if (req.body.file) {
      try {
        const base64String = req.body.file.split(",")[1]; // Extract the Base64 content
        const mimeType = req.body.file.match(/data:(.*?);base64,/)[1]; // Extract MIME type
        const fileBuffer = Buffer.from(base64String, "base64"); // Decode Base64 to buffer

        const fileExtension = mimeType.split("/")[1]; // Extract file extension from MIME type
        const fileName = `${officerData.firstNameEnglish}_${officerData.lastNameEnglish}.${fileExtension}`;

        // Upload image to S3
        profileImageUrl = await uploadFileToS3(
          fileBuffer,
          fileName,
          "collectionofficer/image"
        );
      } catch (err) {
        console.error("Error processing image file:", err);
        return res
          .status(400)
          .json({ error: "Invalid file format or file upload error" });
      }
    }

    // Save officer data (without image if no image is uploaded)
    const resultsPersonal =
      await DistributionDao.createDistributionHeadPersonal(
        officerData,
        profileImageUrl
      );

    console.log("Distribution Head created successfully");
    return res.status(201).json({
      message: "Distribution Head created successfully",
      id: resultsPersonal.insertId,
      status: true,
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error creating collection officer:", error);
    return res.status(500).json({
      error: "An error occurred while creating the collection officer",
    });
  }
};

exports.getAllCompanyList = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log("Request URL:", fullUrl);
  try {
    const result = await DistributionDao.GetAllCompanyList();

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

exports.getAllDistributedCentersByCompany = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const companyId = req.params.companyId;
    const result = await DistributionDao.GetDistributedCenterByCompanyIdDAO(
      companyId
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "No distributed centers found for this company",
        data: [],
      });
    }

    console.log("Successfully retrieved all distributed centers for company");
    res.status(200).json({
      message: "Distributed centers retrieved successfully",
      data: result,
    });
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      console.error("Validation error:", err.details[0].message);
      return res.status(400).json({
        error: "Validation error",
        details: err.details[0].message,
      });
    }

    console.error("Error fetching distributed centers:", err);
    res.status(500).json({
      error: "An error occurred while fetching distributed centers",
      details: err.message,
    });
  }
};
