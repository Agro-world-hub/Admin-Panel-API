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

module.exports = router;