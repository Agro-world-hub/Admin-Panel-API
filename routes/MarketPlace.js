const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const marketPlaceEp = require("../end-point/MarketPlace-ep");

const router = express.Router();

router.get("/get-crop-category");

router.get("/get-market-items", marketPlaceEp.getMarketplaceItems);

router.delete(
    "/delete-product/:id",
    // authMiddleware,
    marketPlaceEp.deleteMarketplaceItem
)

module.exports = router;
