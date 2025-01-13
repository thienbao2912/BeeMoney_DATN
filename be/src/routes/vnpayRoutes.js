const express = require('express');
const { vnpayReturn } = require('../controllers/paymentController');

const router = express.Router();

// Route xử lý VNPay Return
router.get('/vnpay_return', vnpayReturn);

module.exports = router;
