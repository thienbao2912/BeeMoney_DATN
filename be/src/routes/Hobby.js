const HobbyController = require("../controllers/hobbyController");
const middlewareController = require("../middleware/auth");

const router = require("express").Router();

router.get('/', middlewareController.verifyToken)


module.exports = router