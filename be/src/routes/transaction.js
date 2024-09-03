const express = require('express');
const TransactionController = require('../controllers/transaction');
const middlewareController = require('../middleware/auth');
const router = express.Router();

router.get('',middlewareController.verifyToken,TransactionController.getAll)
router.get('/:id',middlewareController.verifyToken,TransactionController.getById)
router.post('/',middlewareController.verifyToken,TransactionController.create)
router.patch('/:id',middlewareController.verifyToken,TransactionController.edit)
router.delete('/:id',middlewareController.verifyToken,TransactionController.delete)

module.exports = router;