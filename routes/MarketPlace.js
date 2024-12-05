const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const marketPlaceEp = require("../end-point/MarketPlace-ep");

const router = express.Router();

router.get(
    '/get-crop-category',
    // authMiddleware,
    marketPlaceEp.getAllCropCatogory
)

router.post(
    '/add-market-product',
    authMiddleware,
    marketPlaceEp.createMarketProduct
)

router.get("/get-market-items", marketPlaceEp.getMarketplaceItems);

router.delete(
    "/delete-product/:id",
    // authMiddleware,
    marketPlaceEp.deleteMarketplaceItem
)

router.post(
    '/create-coupen',
    authMiddleware,
    marketPlaceEp.createCoupen
)

router.get(
    '/get-all-coupen',
    authMiddleware,
    marketPlaceEp.getAllCoupen
)

router.delete(
    '/delete-coupen/:id',
    authMiddleware,
    marketPlaceEp.deleteCoupenById
)

router.delete(
    '/delete-all-coupen',
    authMiddleware,
    marketPlaceEp.deleteAllCoupen
)


router.get(
    '/get-product-category',
    authMiddleware,
    marketPlaceEp.getAllProductCropCatogory
)

router.post(
    '/add-product',
    authMiddleware,
    marketPlaceEp.createPackage
)
module.exports = router;
