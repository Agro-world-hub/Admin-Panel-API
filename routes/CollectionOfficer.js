const express = require("express");
const db = require("../startup/database");
const CollectionOfficerEp = require("../end-point/CollectionOfficer-ep");
const bodyParser = require("body-parser");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = require("../middlewares/uploadMiddleware");
// const uploadfile = multer({ dest: 'uploads/' });
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
const uploadfile = multer({
    storage: storage,
    fileFilter: function(req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.xlsx' && ext !== '.xls') {
            return callback(new Error('Only Excel files are allowed'))
        }
        callback(null, true)
    }
});

router.post(
    "/collection-officer/create-collection-officer",
    authMiddleware,
    CollectionOfficerEp.createCollectionOfficer
);

router.get(
    "/collection-officer/get-all-collection-officers",
    authMiddleware,
    CollectionOfficerEp.getAllCollectionOfficers
);


router.get(
    "/collection-officer/get-collection-officer-report/:id/:date",
    // authMiddleware,
    CollectionOfficerEp.getCollectionOfficerReports
);

router.get(
    "/collection-officer/district-report/:district",
    authMiddleware,
    CollectionOfficerEp.getCollectionOfficerDistrictReports
);

//province report
router.get(
    "/collection-officer/province-report/:province",
    authMiddleware,
    CollectionOfficerEp.getCollectionOfficerProvinceReports
);

router.get(
    "/collection-officer/get-all-company-names",
    authMiddleware,
    CollectionOfficerEp.getAllCompanyNames
)

router.get(
    "/collection-officer/update-status/:id/:status",
    authMiddleware,
    CollectionOfficerEp.UpdateCollectionOfficerStatus
)

router.delete(
    "/collection-officer/delete-officer/:id",
    authMiddleware,
    CollectionOfficerEp.deleteCollectionOfficer
)


router.get(
    "/collection-officer-by-id/:id",
    authMiddleware,
    CollectionOfficerEp.getOfficerById
);

router.put(
    '/update-officer-details/:id', 
    authMiddleware, 
    CollectionOfficerEp.updateCollectionOfficerDetails
);




module.exports = router;