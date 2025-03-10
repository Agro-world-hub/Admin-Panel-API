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

router.get(
    "/get-all-sales-agents",
    authMiddleware,
    DashEp.getAllSalesAgents
)

router.delete(
    "/delete-sales-agent/:id", 
    authMiddleware, 
    DashEp.deleteSalesAgent
  );

module.exports = router;