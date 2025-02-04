const express = require('express');
const db = require('../startup/database');
const NewsEp = require('../end-point/News-ep');
const bodyParser = require('body-parser');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = require("../middlewares/uploadMiddleware");
const path = require("path");
const router = express.Router();

const uploadfile = multer({
    fileFilter: function(req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.xlsx' && ext !== '.xls') {
            return callback(new Error('Only Excel files are allowed'))
        }
        callback(null, true)
    }
});

router.delete('/delete-news/:id', 
    authMiddleware, 
    NewsEp.deleteNews
);


router.put("/edit-news/:id", authMiddleware,upload.single('image'), NewsEp.editNews);


module.exports = router;