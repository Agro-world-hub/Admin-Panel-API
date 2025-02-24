const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const DashEp = require("../end-point/Dash-ep");
const path = require("path");
const router = express.Router();

router.get(
    "/get-all-customers",
    // authMiddleware,
    DashEp.getAllCustomers
)

module.exports = router;