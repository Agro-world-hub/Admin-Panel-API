const express = require("express");
const db = require("../startup/database");
const AdminEp = require("../end-point/Admin-ep");
const bodyParser = require("body-parser");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
// const upload = require("../middlewares/uploadMiddleware");
const upload = multer({ storage: multer.memoryStorage() });
// const uploadfile = multer({ dest: 'uploads/' });
const path = require("path");
const fs = require('fs');
const xlsx = require('xlsx');

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

router.post('/login',
    AdminEp.loginAdmin);

router.get("/get-all-admin-users", authMiddleware, AdminEp.getAllAdminUsers);

router.delete(
    "/delete-admin-user/:id",
    authMiddleware,
    AdminEp.deleteAdminUser
);

router.post("/edit-admin-user/:id", authMiddleware, AdminEp.editAdminUser);

router.get("/get-admin-by-id/:id", authMiddleware, AdminEp.getAdminById);

router.post("/create-admin", authMiddleware, AdminEp.createAdmin);

router.delete(
    "/delete-plant-care-user/:id",
    authMiddleware,
    AdminEp.deletePlantCareUser
);

router.post(
    "/edit-admin-user-without-id",
    authMiddleware,
    AdminEp.editAdminUserWithoutId
);

router.get("/get-admin-by-id/:id", authMiddleware, AdminEp.getAdminById);

router.get("/get-me", authMiddleware, AdminEp.getMe);

router.post("/admin-create-user", authMiddleware, AdminEp.adminCreateUser);

router.get("/get-all-users", authMiddleware, AdminEp.getAllUsers);

// router.post('/admin-create-crop-cellender',
//     authMiddleware,
//     AdminEp.createCropCallender
// );

router.get(
    "/get-all-crop-calender",
    authMiddleware,
    AdminEp.getAllCropCalender
);

router.post(
    "/admin-create-ongoing-cultivations",
    authMiddleware,
    AdminEp.createOngoingCultivations
);

router.post(
    "/admin-create-news",
    authMiddleware,
    upload.single("image"),
    AdminEp.createNews
);

router.get("/get-all-contents", authMiddleware, AdminEp.getAllNews);

router.get("/get-news-by-id/:id", authMiddleware, AdminEp.getNewsById);

router.post("/edit-news-status/:id", authMiddleware, AdminEp.editNewsStatus);

router.post(
    "/admin-add-crop-calender",
    authMiddleware,
    upload.single("image"),

    AdminEp.createCropCallender
);

router.post(
    "/admin-add-crop-calender-add-task",
    authMiddleware,

    AdminEp.createCropCalenderAddTask
);

router.get("/get-user-by-id/:id", authMiddleware, AdminEp.getUserById);

router.delete("/delete-crop/:id", authMiddleware, AdminEp.deleteCropCalender);

router.get(
    "/get-cropcalender-by-id/:id",
    authMiddleware,
    AdminEp.getCropCalenderById
);

router.put(
    "/edit-cropcalender/:id",
    authMiddleware,
    upload.single("image"), // Handle image upload (Multer)
    AdminEp.editCropCalender
);

router.get("/get-all-market-price", authMiddleware, AdminEp.getAllMarketPrice);

router.delete(
    "/delete-market-price/:id",
    authMiddleware,
    AdminEp.deleteMarketPrice
);

router.post(
    "/edit-market-price-status/:id",
    authMiddleware,
    AdminEp.editMarketPriceStatus
);

router.post(
    "/admin-create-market-price",
    authMiddleware,
    upload.single("image"),
    AdminEp.createMarketPrice
);

router.get(
    "/get-market-price-by-id/:id",
    authMiddleware,
    AdminEp.getMarketPriceById
);

router.put("/edit-market-price/:id", authMiddleware, upload.single('image'), AdminEp.editMarketPrice);

router.get(
    "/get-all-ongoing-culivations",
    authMiddleware,
    AdminEp.getAllOngoingCultivations
);

router.get(
    "/get-ongoing-cultivation-by-id/:id",
    authMiddleware,
    AdminEp.getOngoingCultivationsById
);

router.put('/update-plant-care-user/:id',
    authMiddleware,
    upload.single("image"),
    AdminEp.updatePlantCareUser
);


router.post(
    "/create-plantcare-user",
    authMiddleware,
    upload.single("image"),
    AdminEp.createPlantCareUser
);






router.get('/get-fixed-assets/:id/:category',
    authMiddleware,
    AdminEp.getFixedAssetsByCategory
);

router.get('/get-current-assets-view/:id/:category',
    authMiddleware,
    AdminEp.getCurrentAssetsByCategory
);


// router.get('/get-total-fixed-assets-by-id/:id',
//     authMiddleware,
//     AdminEp.getTotalFixedAssetValue
// );

router.post('/upload-xlsx/:id',
    authMiddleware,
    uploadfile.single('file'),
    AdminEp.uploadXLSX
);




// editAdminUserPassword

router.post(
    "/admin-change-password/",
    authMiddleware,
    AdminEp.editAdminUserPassword
);

//Report current assert --- get-assert-using-userid
router.get(
    "/get-current-assert/:id",
    authMiddleware,
    AdminEp.getCurrentAssertGroup
);

router.get("/get-current-asset-report/:id", authMiddleware, AdminEp.getCurrentAssetRecordById);

//get all task of crop
router.get(
    "/get-all-crop-task/:id",
    authMiddleware,
    AdminEp.getAllTaskByCropId
);

//crop task delete function
router.delete(
    "/delete-crop-task/:id",
    authMiddleware,
    AdminEp.deleteCropTask
);

router.post("/edit-crop-task/:id", authMiddleware, AdminEp.editTask);

router.get(
    "/get-crop-task/:id",
    authMiddleware,
    AdminEp.getCropCalendarDayById
);


router.get(
    "/get-all-users-crop-task/:cropId/:userId",
    authMiddleware,
    AdminEp.getAllUsersTaskByCropId
);

router.delete(
    "/delete-user-task/:id",
    authMiddleware,
    AdminEp.deleteUserTask
);


router.post(
    "/edit-user-task-status/:id",
    authMiddleware,
    AdminEp.editUserTaskStatus
);

router.get(
    "/get-slave-crop-task/:id",
    authMiddleware,
    AdminEp.getSlaveCropCalendarDayById
);

//get each post reply
router.get(
    "/get-all-reply/:postId",
    // authMiddleware,
    AdminEp.getAllReplyByPost
);

router.delete(
    "/delete-reply/:postId",
    // authMiddleware,
    AdminEp.DeleteReply
);

module.exports = router;