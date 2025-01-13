const express = require('express');
const router = express.Router();
const { createPayment } = require('../controllers/paymentController');

// Route tạo thanh toán
router.post('/create_payment_url', createPayment);

module.exports = router;
