const express = require("express");

const ComplainCategoryEP = require("../end-point/ComplainCategory-ep");
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
);

router.get(
  "/get-complain-categories/:systemAppId",
  authMiddleware,

  ComplainCategoryEP.getComplainCategoriesByAppId
);

router.get(
  "/get-admin-complain-category",
  authMiddleware,
  ComplainCategoryEP.getAdminComplaintsCategory
);

router.post(
  "/add-new-complaint-category",
  authMiddleware,
  ComplainCategoryEP.AddNewComplaintCategory
);

router.post(
  "/add-new-application/:applicationName",
  authMiddleware,

  ComplainCategoryEP.postNewApplication
);

router.post(
  "/edit-application",
  authMiddleware,

  ComplainCategoryEP.editApplication
);

router.post(
  "/delete-application/:systemAppId",
  authMiddleware,

  ComplainCategoryEP.deleteApplicationByAppId
);

router.get(
  "/get-categori-details-by-id/:id",
  authMiddleware,
  ComplainCategoryEP.getCategoriesDetailsById
);

router.patch(
  "/edit-complaint-category",
  authMiddleware,
  ComplainCategoryEP.EditComplaintCategory
);

router.get(
  "/get-all-sales-agent-complains",
  authMiddleware,
  ComplainCategoryEP.getAllSalesAgentComplains
);

router.get(
  "/get-complain-by-id/:id",
  authMiddleware,
  ComplainCategoryEP.getComplainById
);

router.put(
  "/reply-complain/:id/",
  authMiddleware,
  ComplainCategoryEP.sendComplainReply
);

module.exports = router;
