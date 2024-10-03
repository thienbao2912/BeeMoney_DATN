const express = require('express');
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const SavingsFundController = require('../controllers/savingsFundController');

const router = express.Router();

router.post(
    '/create',
    [
        authMiddleware.verifyToken,
        check('name', 'Tên quỹ là bắt buộc').not().isEmpty(),
        check('targetAmount', 'Mục tiêu số tiền là bắt buộc').isNumeric(),
        check('categoryId', 'Danh mục là bắt buộc').not().isEmpty(),
    ],
    SavingsFundController.createSavingsFund
);

router.post(
    '/add-friend-by-email',
    [
        authMiddleware.verifyToken,
        check('email', 'Email không hợp lệ').isEmail(),
        check('goalId', 'Mục tiêu tiết kiệm là bắt buộc').not().isEmpty(),
    ],
    SavingsFundController.addFriendByEmail
);

router.post(
    '/send-invite-code',
    [
        authMiddleware.verifyToken,
        check('email', 'Email không hợp lệ').isEmail(),
        check('goalId', 'Mục tiêu tiết kiệm là bắt buộc').not().isEmpty()
    ],
    SavingsFundController.sendInviteCode
);

router.post(
    '/accept-invite',
    [
        authMiddleware.verifyToken,
        check('code', 'Mã xác nhận là bắt buộc').not().isEmpty(),
        check('contributionAmount', 'Số tiền góp là bắt buộc').not().isEmpty()
    ],
    SavingsFundController.acceptInviteByCode
);

router.get('/user-goals', authMiddleware.verifyToken, SavingsFundController.getUserSavingsGoals);

module.exports = router;
