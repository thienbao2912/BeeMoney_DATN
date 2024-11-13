const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budgetController');
const middlewareController = require('../middleware/auth');

router.get('/:budgetId/expenses', middlewareController.verifyToken, BudgetController.getExpensesForBudget);

router.post('/budget',  BudgetController.createBudget);
router.get('/budgets',  BudgetController.getAllBudgets);
router.get('/:budgetId',  BudgetController.getById);
router.delete('/:budgetId',  BudgetController.deleteBudget);
router.patch('/:budgetId', BudgetController.updateBudget);

module.exports = router;