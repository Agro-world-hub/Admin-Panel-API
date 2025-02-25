const express = require("express");
const db = require("../startup/database");
const permissionEp = require("../end-point/Permission-ep");
const bodyParser = require("body-parser");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = require("../middlewares/uploadMiddleware");
const path = require("path");
const router = express.Router();

router.get(
  "/get-all-features",
  // authMiddleware,
  permissionEp.getAllFeatures
);

router.get(
  "/get-all-role-features/:id",
  // authMiddleware,
  permissionEp.getAllRoleFeatures
);

router.post(
  "/create-role-feature",
  authMiddleware,
  permissionEp.createRoleFeature
);

router.delete(
  "/delete-role-feature/:id",
  // authMiddleware,
  permissionEp.deleteMarketPrice
);

router.post(
  "/create-admin-roles",
  authMiddleware,
  permissionEp.createAdminRole
);

router.post("/create-categories", permissionEp.createCategory);

router.get(
  "/get-all-feture-categories",
  authMiddleware,
  permissionEp.getAllFeatureCategories
);


router.patch(
  "/edit-feature-name",
  authMiddleware,
  permissionEp.editFeatureName
);


router.patch(
  "/edit-category-name",
  authMiddleware,
  permissionEp.editCategoryName
);




module.exports = router;
