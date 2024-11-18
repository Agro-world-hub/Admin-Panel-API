const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const cropCalendarEp = require('../end-point/CropCalendar-ep');
const multer = require("multer");
const upload = require("../middlewares/uploadMiddleware");
const path = require("path");


const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const uploadfile = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== ".xlsx" && ext !== ".xls") {
            return callback(new Error("Only Excel files are allowed"));
        }
        callback(null, true);
    },
});

router.get(
    "/crop-groups", 
    authMiddleware, 
    cropCalendarEp.allCropGroups
);


router.post(
    "/create-crop-group", 
    authMiddleware,  
    upload.single("image"), 
    cropCalendarEp.createCropGroup
);

router.get(
    "/get-all-crop-groups", 
    authMiddleware, 
    cropCalendarEp.getAllCropGroups
);

router.delete(
    "/delete-crop-group/:id", 
    authMiddleware, 
    cropCalendarEp.deleteCropGroup
);


router.post(
    "/create-crop-variety", 
    authMiddleware,  
    upload.single("image"), 
    cropCalendarEp.createCropVariety
);


router.get(
    "/crop-variety/:cropGroupId", 
    authMiddleware, 
    cropCalendarEp.allCropVariety
);


router.post(
    "/admin-add-crop-calender",
    authMiddleware,
    upload.single("image"),
    cropCalendarEp.createCropCallender
);


router.post(
    "/upload-xlsx/:id",
    authMiddleware,
    uploadfile.single("file"),
    cropCalendarEp.uploadXLSX
);


router.get(
    "/crop-variety-by-group/:cropGroupId", 
    authMiddleware, 
    cropCalendarEp.getAllVarietyByGroup
);


router.delete(
    "/delete-crop-variety/:id", 
    authMiddleware, 
    cropCalendarEp.deleteCropVariety
);


router.get(
    "/crop-group-by-id/:id", 
    authMiddleware, 
    cropCalendarEp.getGroupById
);

router.put(
    '/update-crop-group/:id', 
    authMiddleware, 
    upload.single('image'),
    cropCalendarEp.updateGroup);




module.exports = router;