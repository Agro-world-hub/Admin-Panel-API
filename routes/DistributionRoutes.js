const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const distributionEp = require("../end-point/Distribution-ep");

const router = express.Router();

router.post(
  "/create-distribution-center",
  authMiddleware,
  distributionEp.createDistributionCenter
);

router.get(
  "/get-all-distribution-centre",
  authMiddleware,
  distributionEp.getAllDistributionCentre
);

router.get(
  "/get-all-companies",
  // authMiddleware,
  distributionEp.getAllCompanies
);

router.delete(
  "/delete-company/:id",
  // authMiddleware,
  distributionEp.deleteCompany
);

module.exports = router;
