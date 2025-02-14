const express = require("express");

const ComplainCategoryEP = require("../end-point/ComplainCategory-ep")
const bodyParser = require("body-parser");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = require("../middlewares/uploadMiddleware");

const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

const router = express.Router();

router.get(
    "/get-all-system-applications",
    authMiddleware,
    
    ComplainCategoryEP.getAllSystemApplications
)

router.get(
    "/get-complain-categories/:systemAppId",
    authMiddleware,
    
    ComplainCategoryEP.getComplainCategoriesByAppId
)

router.get(
    "/get-admin-complain-category",
    authMiddleware,
    ComplainCategoryEP.getAdminComplaintsCategory
)

router.post(
    "/add-new-complaint-category",
    authMiddleware,
    ComplainCategoryEP.AddNewComplaintCategory
)








module.exports = router;