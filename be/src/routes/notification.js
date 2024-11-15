const express = require('express');
const router = express.Router();
const NotifiController = require("../controllers/notificationController");

router.get("/:id", NotifiController.getAll);
router.post("/add", NotifiController.addNotification);
router.delete("/delete/:id", NotifiController.deleteNotification);

module.exports = router;