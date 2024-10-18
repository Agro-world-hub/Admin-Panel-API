const express = require('express');
const db = require('../startup/database');
const bodyParser = require('body-parser');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require("../middlewares/uploadMiddleware");
const path = require("path");
const CollectionCenterEp = require('../end-point/CollectionCenter-ep')


const router = express.Router();

router.post(
    "/add-collection-center",
    // authMiddleware,
    CollectionCenterEp.addNewCollectionCenter);

router.get(
    "/get-all-center",
    authMiddleware,
    CollectionCenterEp.getAllCollectionCenter
)

//delete collection center
router.delete(
    "/delete-collection-center/:id",
    authMiddleware,
    CollectionCenterEp.deleteCollectionCenter
)



module.exports = router;