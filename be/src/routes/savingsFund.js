const express = require('express');
const router = express.Router();
const SavingsFundController = require('../controllers/savingsFundController');
const middlewareController = require('../middleware/auth');

router.get('/', middlewareController.verifyToken, SavingsFundController.getAll);
router.get('/:id', middlewareController.verifyToken, SavingsFundController.getById);
router.post('/', middlewareController.verifyToken, SavingsFundController.create);
router.delete('/:id', middlewareController.verifyToken, SavingsFundController.delete);
router.patch('/contribute/:id', middlewareController.verifyToken, SavingsFundController.addTransaction);
router.get('/:id/members', middlewareController.verifyToken, SavingsFundController.getFundMembers);
router.get('/:id/transactions', middlewareController.verifyToken, SavingsFundController.getFundTransactions);
module.exports = router;
