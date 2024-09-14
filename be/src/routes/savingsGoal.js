const SavingsGoalController = require("../controllers/SavingsGoalController");
const middlewareController = require('../middleware/auth');

const router = require("express").Router();

router.get('/', middlewareController.verifyToken,SavingsGoalController.getAll)
router.get('/:id',middlewareController.verifyToken, SavingsGoalController.getById)
router.post('/',middlewareController.verifyToken, SavingsGoalController.create)
router.patch('/:id',middlewareController.verifyToken, SavingsGoalController.edit)
router.patch('/allFields/:id',middlewareController.verifyToken, SavingsGoalController.updateAllFields)
router.delete('/:id',middlewareController.verifyToken, SavingsGoalController.delete)

module.exports = router
