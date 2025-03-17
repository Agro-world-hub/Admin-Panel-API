const express = require("express");
const db = require("../startup/database");
const CollectionOfficerEp = require("../end-point/CollectionOfficer-ep");
const bodyParser = require("body-parser");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = require("../middlewares/uploadMiddleware");

const path = require("path");

const router = express.Router();

const uploadfile = multer({
  
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".xlsx" && ext !== ".xls") {
      return callback(new Error("Only Excel files are allowed"));
    }
    callback(null, true);
  },
});

router.post(
  "/collection-officer/create-collection-officer",
  authMiddleware,
  upload.single("image"),
  CollectionOfficerEp.createCollectionOfficer
);



router.get(
  "/collection-officer/get-all-collection-officers",
  authMiddleware,
  CollectionOfficerEp.getAllCollectionOfficers
);

router.get(
  "/collection-officer/get-all-collection-officers-status",
  authMiddleware,
  CollectionOfficerEp.getAllCollectionOfficersStatus
);

router.get(
  "/collection-officer/get-collection-officer-report/:id/:date",
  // authMiddleware,
  CollectionOfficerEp.getCollectionOfficerReports
);

router.get(
  "/collection-officer/district-report/:district",
  // authMiddleware,
  CollectionOfficerEp.getCollectionOfficerDistrictReports
);

//province report
router.get(
  "/collection-officer/province-report/:province",
  // authMiddleware,
  CollectionOfficerEp.getCollectionOfficerProvinceReports
);

router.get(
  "/collection-officer/get-all-company-names",
  authMiddleware,
  CollectionOfficerEp.getAllCompanyNames
);

router.get(
  "/collection-officer/update-status/:id/:status",
  authMiddleware,
  CollectionOfficerEp.UpdateStatusAndSendPassword
);

router.delete(
  "/collection-officer/delete-officer/:id",
  authMiddleware,
  CollectionOfficerEp.deleteCollectionOfficer
);

router.get(
  "/collection-officer-by-id/:id",
  authMiddleware,
  CollectionOfficerEp.getOfficerById
);

router.put(
  "/update-officer-details/:id",
  authMiddleware,
  upload.single("image"),
  CollectionOfficerEp.updateCollectionOfficerDetails
);

router.get(
  "/officer-details-monthly/:id",
  // authMiddleware,
  CollectionOfficerEp.getOfficerByIdMonthly
);

// Define the new route to fetch daily data for a specific collection officer
router.get(
  "/get-daily-report",
  // authMiddleware,
  CollectionOfficerEp.getDailyReport
);

router.get(
  "/collection-officer/get-collection-officer/:id",
  authMiddleware,
  CollectionOfficerEp.getCollectionOfficerById
);

router.put(
  "/disclaim-officer/:id",
  authMiddleware,
  CollectionOfficerEp.disclaimOfficer
);

router.post(
  "/collection-officer/create-center-head",
  authMiddleware,
  upload.single("image"),
  CollectionOfficerEp.createCenterHead
);

router.put(
  "/update-center-head-details/:id",
  authMiddleware,
  upload.single("image"),
  CollectionOfficerEp.updateCenterHeadDetails
);

router.get(
  "/collection-officer/get-all-center-names",
  authMiddleware,
  CollectionOfficerEp.getAllCenterNames
);

router.get(
  "/collection-officer/get-all-collection-manager-names",
  authMiddleware,
  CollectionOfficerEp.getAllCollectionManagerNames
);

module.exports = router;
