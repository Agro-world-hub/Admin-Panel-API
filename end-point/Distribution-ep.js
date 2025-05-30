const DistributionDao = require("../dao/Distribution-dao");
const uploadFileToS3 = require("../middlewares/s3upload");
const DistributionValidation = require("../validations/distribution-validation");

exports.createDistributionCenter = async (req, res) => {
  try {
    // Validate input with Joi
    const data = await DistributionValidation.getDistributionCenterDetailsSchema.validateAsync(req.body);

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
      data: result
    });

  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({
        success: false,
        error: err.details[0].message
      });
    }

    console.error("Server error:", err);
    return res.status(500).json({
      success: false,
      error: "An error occurred while creating distribution center"
    });
  }
};


exports.getAllDistributionCentre = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    const { page, limit, district, province, searchItem } =
      await DistributionValidation.getAllDistributionCentreSchema.validateAsync(req.query);

    const offset = (page - 1) * limit;

    const { total, items } = await DistributionDao.getAllDistributionCentre(
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

    console.log({ total, items })
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};


