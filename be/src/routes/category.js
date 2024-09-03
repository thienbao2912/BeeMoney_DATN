const CategoryController = require("../controllers/categoryController");
const middlewareController = require("../middleware/auth");

const router = require("express").Router();

router.get('/', middlewareController.verifyToken, CategoryController.getAll )
router.get('/:id', middlewareController.verifyToken, CategoryController.getById )
router.post('/', middlewareController.verifyToken, CategoryController.add )
router.patch('/:id', middlewareController.verifyToken, CategoryController.edit )
router.delete('/:id', middlewareController.verifyToken, CategoryController.delete )

module.exports = router