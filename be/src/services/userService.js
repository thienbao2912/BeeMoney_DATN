const User = require("../models/User")

// Hàm checkPremiumStatus lấy dữ liệu dựa trên `_id`
const checkPremiumStatus = async (userId) => {
  try {
    // Chuyển đổi userId từ string sang ObjectId
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User không tồn tại!');
    }

    // Trả về trạng thái premium
    return {
      isPremium: user.isPremium || false,
      premiumExpiry: user.premiumExpiry || null,
    };
  } catch (error) {
    console.error('Lỗi khi kiểm tra premium:', error.message);
    throw error;
  }
};
  
  module.exports = {
    checkPremiumStatus,
  };