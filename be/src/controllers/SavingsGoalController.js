const SavingsGoal = require("../models/SavingsGoal")
const User = require('../models/User');
class SavingsGoalController {
    static async getAll(req, res) {
        try {
            const userId = req.user.id;
            let data = []
            data = await SavingsGoal.find({ userId }).populate({
                path: 'categoryId',
                select: 'image name'
            });

            res.status(200).json({
                data
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({
                message: 'Server error'
            });
        }
    }

    static async getById(req, res) {
        try {
            let id = req.params.id
            let data = await SavingsGoal.findById(id)
            res.status(200).json({
                data: data
            })
        } catch (error) {
            res.status(500).json({
                message: 'Server error'
            })
        }
    }
    static async create(req, res) {
        try {
            let { name, targetAmount, currentAmount, startDate, endDate, categoryId } = req.body;
            let userId = req.user.id;

            if (new Date(startDate) > new Date(endDate)) {
                return res.status(400).json({
                    message: 'Ngày bắt đầu không thể lớn hơn ngày kết thúc'
                });
            }
            if (!categoryId) {
                return res.status(400).json({
                    message: 'Chưa chọn danh mục'
                });
            }

            // Tìm người dùng để kiểm tra số dư ví
            const user = await User.findById(userId);
            if (!user || user.wallet < currentAmount) {
                return res.status(400).json({
                    message: 'Số dư trong ví không đủ để thực hiện giao dịch'
                });
            }

            // Trừ tiền từ ví của người dùng
            user.wallet -= currentAmount;
            await user.save();

            // Tạo đối tượng dữ liệu mục tiêu tiết kiệm
            let data = {
                userId,
                name,
                targetAmount,
                currentAmount,
                startDate,
                endDate,
                categoryId,
            };

            // Thêm lịch sử giao dịch chỉ khi currentAmount > 0
            if (currentAmount > 0) {
                data.transactionHistory = [{ amount: currentAmount, date: new Date() }];
            }

            const savingsGoal = await SavingsGoal.create(data);
            res.status(200).json({
                data: 'Thêm dữ liệu thành công',
                savingsGoal // có thể trả về mục tiêu vừa tạo
            });
        } catch (error) {
            console.error(error); // Ghi lại lỗi nếu có
            res.status(500).json({
                message: 'Server error'
            });
        }
    }

    static async addTransaction(req, res) {
        try {
            const _id = req.params.id;
            const userId = req.user.id;
            const { amount, note } = req.body;
    
            // Tìm kiếm mục tiêu tiết kiệm của người dùng
            const savingsGoal = await SavingsGoal.findOne({ userId, _id });
            if (!savingsGoal) {
                return res.status(404).json({ message: 'Mục tiêu tiết kiệm không được tìm thấy.' });
            }
    
            // Kiểm tra số dư ví người dùng
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại.' });
            }
    
            if (user.wallet < amount) { 
                return res.status(400).json({ message: 'Số dư ví của bạn không đủ để thực hiện giao dịch này.' });
            }
    
            // Trừ tiền từ ví của người dùng bằng số tiền nạp vào
            user.wallet -= amount;
            await user.save();
    
            // Cập nhật số tiền hiện tại và thêm vào lịch sử nạp tiền
            savingsGoal.currentAmount += amount;
            savingsGoal.transactionHistory.push({ amount, note, date: new Date() });
            const updatedGoal = await savingsGoal.save();
    
            return res.status(200).json({
                message: 'Giao dịch thành công!',
                data: updatedGoal
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.' });
        }
    }
    
    
    


    static async updateAllFields(req, res) {
        try {
            const _id = req.params.id;
            const userId = req.user.id;
            const { name, targetAmount, startDate, endDate, categoryId } = req.body; // Bỏ currentAmount khỏi body

            // Tìm kiếm mục tiêu tiết kiệm của người dùng
            const savingsGoal = await SavingsGoal.findOne({ userId, _id });

            if (savingsGoal) {
                // Cập nhật từng trường ngoại trừ currentAmount
                savingsGoal.name = name;
                savingsGoal.targetAmount = targetAmount;
                savingsGoal.startDate = startDate;
                savingsGoal.endDate = endDate;
                savingsGoal.categoryId = categoryId;

                // Lưu thay đổi
                const updatedGoal = await savingsGoal.save();

                res.status(200).json({
                    message: 'Cập nhật mục tiêu tiết kiệm thành công',
                    data: updatedGoal
                });
            } else {
                res.status(404).json({
                    message: 'Mục tiêu tiết kiệm không tồn tại'
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: 'Server error'
            });
        }
    }


    static async delete(req, res) {
        try {
            const _id = req.params.id;
            const userId = req.user.id;

            // Tìm kiếm mục tiêu tiết kiệm
            const savingsGoal = await SavingsGoal.findOne({ userId, _id });
            if (!savingsGoal) {
                return res.status(404).json({
                    message: 'Mục tiêu tiết kiệm không tồn tại'
                });
            }

            // Phục hồi số tiền vào ví
            const user = await User.findById(userId);
            user.wallet += savingsGoal.currentAmount; // Thêm currentAmount vào wallet
            await user.save();

            // Xóa mục tiêu tiết kiệm
            await SavingsGoal.findOneAndDelete({ userId, _id });

            res.status(200).json({
                data: 'Xóa mục tiêu tiết kiệm thành công và đã phục hồi số tiền vào ví'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: 'Server error'
            });
        }
    }



}

module.exports = SavingsGoalController
