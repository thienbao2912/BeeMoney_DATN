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



router.get('/user-goals', authMiddleware.verifyToken, SavingsFundController.getUserSavingsGoals);
router.get('/:id', authMiddleware.verifyToken, SavingsFundController.getById);
router.patch('/contribute/:id', authMiddleware.verifyToken, SavingsFundController.addTransaction);
router.get('/:id/members', authMiddleware.verifyToken, SavingsFundController.getFundMembers);
router.get('/:id/transactions', authMiddleware.verifyToken, SavingsFundController.getFundTransactions);

module.exports = router;
