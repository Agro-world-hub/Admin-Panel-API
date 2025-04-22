const TargetDAO = require("../dao/Target-dao");
const TargetValidate = require("../validations/Target-validation");

// exports.getSavedCenterCrops = async (req, res) => {
//   const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
//   console.log(fullUrl);

//   try {
//     const companyId = req.user.companyId;
//     const { id, date } =
//       await TargetValidate.getSavedCenterCropsSchema.validateAsync(req.params);
//     const { searchText } =
//       await TargetValidate.getSavedCenterCropsQuaryParam.validateAsync(
//         req.query
//       );
//     // const { page, limit, searchText } = await TargetValidate.getCenterCropsSchema.validateAsync(req.query);
//     console.log(id, date);

//     const companyCenterId = await TargetDAO.getCompanyCenterIDDao(
//       companyId,
//       id
//     );
//     if (companyCenterId === null) {
//       res.json({ items: [], message: "No center found" });
//     }

//     const status = true;
//     const result = await TargetDAO.getSavedCenterCropsDao(
//       companyCenterId,
//       date,
//       status,
//       searchText
//     );
//     // console.log(items, total);

//     return res.status(200).json({ result, companyCenterId });
//   } catch (error) {
//     if (error.isJoi) {
//       return res.status(400).json({ error: error.details[0].message });
//     }
//     console.error("Error fetching collection officers:", error);

//     return res
//       .status(500)
//       .json({ error: "An error occurred while fetching collection officers" });
//   }
// };

exports.getSavedCenterCrops = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const companyId = 1;
    const { id, date } =
      await TargetValidate.getSavedCenterCropsSchema.validateAsync(req.params);
    const { searchText } =
      await TargetValidate.getSavedCenterCropsQuaryParam.validateAsync(
        req.query
      );

    console.log(id, date);

    const companyCenterId = await TargetDAO.getCompanyCenterIDDao(
      companyId,
      id
    );
    if (companyCenterId === null) {
      return res.json({
        status: false,
        items: [],
        message: `No center found for companyId: ${companyId} and centerId: ${id}`,
      }); // Add return here
    }

    const status = true;
    const result = await TargetDAO.getSavedCenterCropsDao(
      companyCenterId,
      date,
      status,
      searchText
    );

    return res.status(200).json({ result, companyCenterId });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message }); // Add return here
    }
    console.error("Error fetching collection officers:", error);

    return res
      .status(500)
      .json({ error: "An error occurred while fetching collection officers" }); // Add return here
  }
};
exports.updateTargetQty = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    const { id, qty, date, companyCenterId, grade, varietyId } =
      await TargetValidate.updateTargetQtySchema.validateAsync(req.body);
    console.log(req.body);

    if (id !== null) {
      const resultUpdate = await TargetDAO.updateCenterTargeQtyDao(
        id,
        qty,
        date
      );
      if (resultUpdate.affectedRows === 0) {
        return res.json({
          status: false,
          message: "Failed to update target quantity",
        });
      }
    } else {
      const resultInsert = await TargetDAO.addNewCenterTargetDao(
        companyCenterId,
        varietyId,
        grade,
        qty,
        date
      );
      if (resultInsert.affectedRows === 0) {
        return res.json({
          status: false,
          message: "Failed to update target quantity",
        });
      }
    }

    console.log("Successfully retrieved target crop verity");
    res
      .status(200)
      .json({ status: true, message: "Successfully updated target quantity" });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error retrieving target crop verity:", error);
    return res.status(500).json({
      error: "An error occurred while fetching the target crop verity",
    });
  }
};

exports.addNewCenterTarget = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    // const { id, qty, date, companyCenterId, grade, varietyId } = await TargetValidate.updateTargetQtySchema.validateAsync(req.body);
    // console.log(req.body);
    const companyCenterId = req.body.companyCenterId;
    const date = req.body.date;
    const cropsData = req.body.crop;

    let resultA;
    let resultB;
    let resultC;
    for (let i = 0; i < cropsData.length; i++) {
      // if (cropsData[i].targetA !== 0) {
      resultA = await TargetDAO.addNewCenterTargetDao(
        companyCenterId,
        cropsData[i].varietyId,
        "A",
        cropsData[i].targetA,
        date
      );
      // }

      // if (cropsData[i].targetB !== 0) {
      resultB = await TargetDAO.addNewCenterTargetDao(
        companyCenterId,
        cropsData[i].varietyId,
        "B",
        cropsData[i].targetB,
        date
      );
      // }

      // if (cropsData[i].targetC !== 0) {
      resultC = await TargetDAO.addNewCenterTargetDao(
        companyCenterId,
        cropsData[i].varietyId,
        "C",
        cropsData[i].targetC,
        date
      );
      // }
    }

    console.log("Successfully retrieved target crop verity");
    res.status(200).json({
      status: true,
      message: "Successfully Added New target quantity",
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error retrieving target crop verity:", error);
    return res.status(500).json({
      error: "An error occurred while fetching the target crop verity",
    });
  }
};

// exports.getCenterCenterCrops = async (req, res) => {
//   const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
//   console.log(fullUrl);

//   try {
//     const companyId = req.user.companyId;
//     const { id } = await TargetValidate.IdValidationSchema.validateAsync(
//       req.params
//     );
//     const { page, limit, searchText } =
//       await TargetValidate.getCenterCropsSchema.validateAsync(req.query);

//     const companyCenterId = await TargetDAO.getCompanyCenterIDDao(
//       companyId,
//       id
//     );
//     if (companyCenterId === null) {
//       res.json({ items: [], message: "No center found" });
//     }

//     const { items, total } = await TargetDAO.getCenterCenterCropsDao(
//       companyCenterId,
//       page,
//       limit,
//       searchText
//     );
//     console.log(items, total);

//     return res.status(200).json({ items, total });
//   } catch (error) {
//     if (error.isJoi) {
//       return res.status(400).json({ error: error.details[0].message });
//     }
//     console.error("Error fetching collection officers:", error);

//     return res
//       .status(500)
//       .json({ error: "An error occurred while fetching collection officers" });
//   }
// };

exports.getCenterCenterCrops = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const companyId = 1;

    // First validate the ID parameter
    const { id } = await TargetValidate.IdValidationSchema.validateAsync(
      req.params
    );

    // Then validate the query parameters
    const {
      page = 1,
      limit = 10,
      searchText = "",
    } = await TargetValidate.getCenterCropsSchema.validateAsync(req.query);

    const companyCenterId = await TargetDAO.getCompanyCenterIDDao(
      companyId,
      id
    );
    if (companyCenterId === null) {
      return res.json({ items: [], message: "No center found" });
    }

    const { items, total } = await TargetDAO.getCenterCenterCropsDao(
      companyCenterId,
      page,
      limit,
      searchText
    );
    console.log(items, total);

    return res.status(200).json({ items, total });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }
    console.error("Error fetching collection officers:", error);

    return res
      .status(500)
      .json({ error: "An error occurred while fetching collection officers" });
  }
};

exports.addOrRemoveCenterCrops = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const companyId = 1;

    // const { id } = await TargetValidate.IdValidationSchema.validateAsync(req.params);
    const validateData =
      await TargetValidate.addOrRemoveCenterCropSchema.validateAsync(req.body);
    console.log(validateData);

    const companyCenterId = await TargetDAO.getCompanyCenterIDDao(
      companyId,
      validateData.centerId
    );
    if (companyCenterId === null) {
      res.json({ items: [], message: "No center found" });
    }

    let result;
    if (validateData.isAssign === 1) {
      result = await TargetDAO.addCenterCropsDao(
        companyCenterId,
        validateData.cropId
      );
      if (result.affectedRows === 0) {
        return res.json({ status: false, message: "Failed to add crop" });
      }
    } else if (validateData.isAssign === 0) {
      result = await TargetDAO.removeCenterCropsDao(
        companyCenterId,
        validateData.cropId
      );
      if (result.affectedRows === 0) {
        return res.json({ status: false, message: "Failed to remove crop" });
      }
    } else {
      return res.json({ status: false, message: "Invalid request" });
    }

    // const results = await TargetDAO.getCenterCenterCropsDao(companyId, id);
    return res
      .status(200)
      .json({ status: true, message: "Successfully change crop" });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }
    console.error("Error fetching collection officers:", error);

    return res
      .status(500)
      .json({ error: "An error occurred while fetching collection officers" });
  }
};
