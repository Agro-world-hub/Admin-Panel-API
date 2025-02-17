const express = require("express");

const StakeholderEp = require("../end-point/stakeholder-ep");
const bodyParser = require("body-parser");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = require("../middlewares/uploadMiddleware");

const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

const router = express.Router();

router.get(
    "/get-admin-user-data",
    authMiddleware,
    StakeholderEp.getAdminUserData
);

router.get(
    "/get-collection-officer-data",
    authMiddleware,
    StakeholderEp.getCollectionOfficerData
);

router.get(
    "/get-plant-care-user-data",
    authMiddleware,
    StakeholderEp.getPlantCareUserData
);

router.get(
    "/get-sales-agent-data",
    authMiddleware,
    StakeholderEp.getSalesAgentData
);

module.exports = router;