const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const marketPlaceEp = require('../end-point/MarketPlace-ep')


const router = express.Router();

router.get(
    '/get-crop-category',
    // authMiddleware,
    marketPlaceEp.getAllCropCatogory
)



module.exports = router;