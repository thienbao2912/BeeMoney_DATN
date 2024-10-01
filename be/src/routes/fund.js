const express = require('express');
const router = express.Router();
const SavingsFundController = require('../controllers/fundController');
const authMiddleware = require('../middleware/auth');
const { check } = require('express-validator');
const { validationResult } = require('express-validator');

router.post(
    '/send-invite-code',
    [
        authMiddleware.verifyToken,
        check('email', 'Email không hợp lệ').isEmail(),
        check('fundId', 'Mục tiêu tiết kiệm là bắt buộc').not().isEmpty()
    ],
    SavingsFundController.sendInviteCode
);

router.post(
    '/accept-invite',
    [
        authMiddleware.verifyToken,
        check('code', 'Mã xác nhận là bắt buộc').not().isEmpty()
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        SavingsFundController.acceptInviteByCode(req, res);
    }
);


module.exports = router;
