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

      console.log(data);

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

exports.getCompany = async (req, res) => {
  try {
    const results = await DistributionDao.getCompanyDetails();
    console.log(results);

    console.log("Successfully retrieved company names");
    res.json({
      success: true,
      message: "Company names retrieved successfully",
      data: results,
    });
  } catch (err) {
    console.error("Error fetching company names:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching company names",
    });
  }
};
