const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const TargetEP = require('../end-point/Target-ep');

const router = express.Router();

router.get(
    '/get-selected-officer-target-data',
    authMiddleware,
    TargetEP.getSelectedOfficerTarget
)

module.exports = router;