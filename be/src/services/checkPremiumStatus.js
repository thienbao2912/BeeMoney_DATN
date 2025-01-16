const User = require('../models/User');
const cron = require('node-cron');

// Hàm kiểm tra trạng thái Premium
const checkPremiumStatus = async () => {
  try {
    const now = new Date();

    // Tìm tất cả người dùng Premium đã hết hạn
    const usersToUpdate = await User.find({
      isPremium: true,
      premiumExpiry: { $lt: now }, // Ngày hết hạn nhỏ hơn hiện tại
    });

    if (usersToUpdate.length === 0) {
      console.log('Không có người dùng nào cần cập nhật.');
      return;
    }

    // Cập nhật isPremium thành false
    const updatePromises = usersToUpdate.map((user) => {
      user.isPremium = false;
      return user.save();
    });

    await Promise.all(updatePromises);

    console.log(`Đã cập nhật ${usersToUpdate.length} người dùng hết hạn Premium.`);
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái Premium:', error.message);
  }
};

// Lên lịch chạy mỗi ngày vào lúc 00:00
cron.schedule('0 0 * * *', checkPremiumStatus, {
  timezone: 'Asia/Ho_Chi_Minh', // Đặt múi giờ nếu cần
});

module.exports = checkPremiumStatus;
