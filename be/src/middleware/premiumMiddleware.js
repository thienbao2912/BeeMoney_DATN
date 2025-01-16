const User = require('../models/User');
const cron = require('node-cron');

const checkPremiumMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id; // Lấy ID từ token
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại!' });
    }

    const now = new Date();
    const isPremium = user.isPremium && new Date(user.premiumExpiry) > now;

    if (!isPremium) {
      return res.status(403).json({ message: 'Bạn cần gói Premium để truy cập!' });
    }

    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Lỗi hệ thống!' });
  }
};



module.exports = checkPremiumMiddleware;
