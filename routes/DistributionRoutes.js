const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const distributionEp = require("../end-point/Distribution-ep");
const upload = require("../middlewares/uploadMiddleware");

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

router.get(
  "/get-companies",
  // authMiddleware,
  distributionEp.getCompanies
);

router.delete(
  "/delete-company/:id",
  // authMiddleware,
  distributionEp.deleteCompany
);

router.get(
  "/get-distributioncompany-head",
  authMiddleware,
  distributionEp.getAllDistributionCentreHead
);

router.post(
  "/create-distribution-head",
  authMiddleware,
  upload.single("image"),
  distributionEp.createDistributionHead
);

router.get(
  "/get-all-company-list",
  authMiddleware,
  distributionEp.getAllCompanyList
);

router.get(
  "/get-all-centers-by-company/:companyId",
  authMiddleware,
  distributionEp.getAllDistributedCentersByCompany
);

router.get(
  "/get-company",
  // authMiddleware,
  distributionEp.getCompany
);

router.delete(
  "/delete-officer/:id",
  authMiddleware,
  distributionEp.deleteDistributionHead
);

router.get(
  "/get-distribution-head/:id",
  authMiddleware,
  distributionEp.getDistributionHeadDetailsById
);

router.put(
  "/update-collection-officer/:id",
  authMiddleware,
  distributionEp.updateCollectionOfficerDetails
);

router.get(
  "/get-distribution-centre/:id",
  authMiddleware,
  distributionEp.getDistributionCentreById
);

module.exports = router;
