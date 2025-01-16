const express = require('express');
const router = express.Router();
const { checkPremiumStatus } = require('../services/userService');
const middlewareController = require('../middleware/auth');
const checkPremiumMiddleware  = require('../middleware/premiumMiddleware')

console.log('checkPremiumStatus:', checkPremiumStatus);
console.log('authMiddleware:', middlewareController.verifyToken);
router.get('/check_premium', middlewareController.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; 
    const premiumStatus = await checkPremiumStatus(userId);

    res.json(premiumStatus);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
});
router.get('/premium-content', middlewareController.verifyToken,checkPremiumMiddleware, (req, res) => {
  res.json({ message: 'Chào mừng bạn đến nội dung Premium!' });
});
module.exports = router;
