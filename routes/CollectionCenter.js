const express = require("express");
const CollectionCenterEp = require("../end-point/CollectionCenter-ep");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post(
    "/add-collection-center",
    // authMiddleware,
    CollectionCenterEp.addNewCollectionCenter);