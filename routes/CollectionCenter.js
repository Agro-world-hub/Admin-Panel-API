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
    authMiddleware,
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

//get all complains
router.get(
    "/get-all-complains",
    authMiddleware,
    CollectionCenterEp.getAllComplains
)

router.get(
    "/get-complain-by-id/:id",
    authMiddleware,
    CollectionCenterEp.getComplainById
)

router.post(
    "/create-collection-center",
    authMiddleware,
    CollectionCenterEp.createCollectionCenter
)



router.get(
    "/get-all-centerpage",
    authMiddleware,
    CollectionCenterEp.getAllCollectionCenterPage
)

router.get(
    "/get-center-by-id/:id",
    authMiddleware,
    CollectionCenterEp.getCenterById
)

router.patch(
    "/update-center/:id/:regCode",
    authMiddleware,
    CollectionCenterEp.updateCollectionCenter
)

router.put(
    "/reply-complain/:id/",
    authMiddleware,
    CollectionCenterEp.sendComplainReply
)

router.get(
    "/get-last-emp-id/:role",
    authMiddleware,
    CollectionCenterEp.getForCreateId
)


router.post(
    "/create-company",
    authMiddleware,
    CollectionCenterEp.createCompany
);


router.get(
    "/get-all-company-list",
    authMiddleware,
    CollectionCenterEp.getAllCompanyList
)


module.exports = router;