const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const marketPlaceEp = require("../end-point/MarketPlace-ep");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get(
  "/get-crop-category",
  // authMiddleware,
  marketPlaceEp.getAllCropCatogory
);

router.post(
  "/add-market-product",
  authMiddleware,
  marketPlaceEp.createMarketProduct
);

router.get("/get-market-items", marketPlaceEp.getMarketplaceItems);

router.delete(
  "/delete-product/:id",
  // authMiddleware,
  marketPlaceEp.deleteMarketplaceItem
);

router.post("/create-coupen", authMiddleware, marketPlaceEp.createCoupen);

router.get("/get-all-coupen", authMiddleware, marketPlaceEp.getAllCoupen);

router.delete(
  "/delete-coupen/:id",
  authMiddleware,
  marketPlaceEp.deleteCoupenById
);

router.delete(
  "/delete-all-coupen",
  authMiddleware,
  marketPlaceEp.deleteAllCoupen
);

router.get(
  "/get-product-category",
  authMiddleware,
  marketPlaceEp.getAllProductCropCatogory
);

router.post(
  "/add-package",
  authMiddleware,
  upload.single("file"),
  marketPlaceEp.createPackage
);

router.get(
  "/get-product-by-id/:id",
  authMiddleware,
  marketPlaceEp.getProductById
);

router.patch(
  "/edit-market-product/:id",
  authMiddleware,
  marketPlaceEp.editMarketProduct
);

router.get(
  "/get-all-package-list",
  authMiddleware,
  marketPlaceEp.getAllMarketplacePackages
);

router.delete(
  "/delete-packages/:id",
  // authMiddleware,
  marketPlaceEp.deleteMarketplacePackages
);

router.patch(
  "/edit-market-packages/:id",
  authMiddleware,
  marketPlaceEp.updateMarketplacePackage
);

router.get(
  "/get-package-by-id/:id",
  authMiddleware,
  marketPlaceEp.getMarketplacePackageById
);

router.get(
  "/get-packagedetails-by-id/:id",
  authMiddleware,
  marketPlaceEp.getMarketplacePackageWithDetailsById
);

router.patch("/edit-product/:id", authMiddleware, marketPlaceEp.updatePackage);

module.exports = router;
