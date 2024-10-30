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

        
        console.log('Savings Goals:', data);

    
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
    
            // Validation: Check if startDate is greater than endDate
            if (new Date(startDate) > new Date(endDate)) {
                return res.status(400).json({
                    message: 'Ngày bắt đầu không thể lớn hơn ngày kết thúc'
                });
            }
    
            if (targetAmount < 10000) {
                return res.status(400).json({
                    message: 'Số tiền mục tiêu ít nhất phải là 10,000đ'
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
    
            // Tạo mục tiêu tiết kiệm nếu validation passes
            let data = {
                userId,
                name,
                targetAmount,
                currentAmount,
                startDate,
                endDate,
                categoryId
            };
    
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
            const { amount } = req.body; // Số tiền người dùng muốn nạp vào mục tiêu
    
            // Tìm kiếm mục tiêu tiết kiệm của người dùng
            const savingsGoal = await SavingsGoal.findOne({ userId, _id });
            if (!savingsGoal) {
                return res.status(404).json({ message: 'Mục tiêu tiết kiệm không tồn tại' });
            }
    
            // Kiểm tra số dư ví người dùng
            const user = await User.findById(userId);
            if (!user || user.wallet < amount) { // Kiểm tra xem ví có đủ số tiền để nạp không
                return res.status(400).json({ message: 'Số dư trong ví không đủ để thực hiện giao dịch' });
            }
    
            // Trừ tiền từ ví của người dùng bằng số tiền nạp vào
            user.wallet -= amount; // Trừ từ ví bằng số tiền nạp vào
            await user.save();
    
            // Cập nhật số tiền hiện tại và thêm vào lịch sử nạp tiền
            savingsGoal.currentAmount += amount; // Cập nhật currentAmount với số tiền nạp vào
            savingsGoal.transactionHistory.push({ amount, date: new Date() });
            const updatedGoal = await savingsGoal.save();
    
            res.status(200).json({
                message: 'Cập nhật mục tiêu tiết kiệm thành công',
                data: updatedGoal
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
    
    
static async updateAllFields(req, res) {
    try {
        const _id = req.params.id;
        const userId = req.user.id;
        const { name, targetAmount, currentAmount, startDate, endDate, categoryId } = req.body;

        const checkSavingsGoalUser = await SavingsGoal.findOne({ userId, _id });

        if (checkSavingsGoalUser) {
            const updatedGoal = await SavingsGoal.findByIdAndUpdate(
                _id,
                { $set: { name, targetAmount, currentAmount, startDate, endDate, categoryId } },
                { new: true, useFindAndModify: false }
            );

            if (updatedGoal) {
                res.status(200).json({
                    message: 'Cập nhật mục tiêu tiết kiệm thành công',
                    data: updatedGoal
                });
            } else {
                res.status(403).json({
                    message: 'Đã xảy ra lỗi'
                });
            }
        } else {
            res.status(403).json({
                message: 'Đã xảy ra lỗi'
            });
        }
    } catch (error) {
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
