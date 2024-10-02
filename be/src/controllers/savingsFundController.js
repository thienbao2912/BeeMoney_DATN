const { validationResult } = require('express-validator');
const SavingsFund = require('../models/SavingsFund');
const Category = require('../models/Category');



class SavingsFundController {
    static async createSavingsFund(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { name, targetAmount, categoryId, startDate, endDate } = req.body;

        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc' });
        }

        try {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({ message: 'Danh mục không tồn tại' });
            }

            const newFund = new SavingsFund({
                name,
                targetAmount,
                categoryId: categoryId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                userId,
                members: [
                    {
                        userId: req.user.id,
                        contributionAmount: 0,
                    }
                ]
            });

            await newFund.save();
            res.status(201).json({ message: 'Tạo quỹ chung thành công', newFund });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    static async getUserSavingsGoals(req, res) {
        const userId = req.user.id;
    
        if (!userId) {
            return res.status(400).json({ message: 'Thiếu userId' });
        }
    
        try {
            const savingsFunds = await SavingsFund.find({
                'members.userId': userId
            }).populate('category');
    
            res.json(savingsFunds || []);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Lỗi máy chủ');
        }
    }
    static async getById(req, res) {
        try {
            const id = req.params.id;
            const data = await SavingsFund.findById(id)
            .populate('userId')  // Lấy thông tin người tạo quỹ
      .populate('members.userId')  // Lấy thông tin của các thành viên
      .populate('transactions.participantId');  // Lấy thông tin người thực hiện giao dịch

            if (!data) return res.status(404).json({ message: 'Quỹ tiết kiệm không tồn tại' });
            res.status(200).json({ data });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
      // Thêm giao dịch nạp tiền riêng lẻ (bổ sung hàm này để thêm tính năng giao dịch)
      static async addTransaction(req, res) {
        try {
            const { amount, note } = req.body;
            const fundId = req.params.id;
    
            // Kiểm tra giá trị amount
            if (amount < 1000) {
                return res.status(400).json({ message: 'Số tiền ít nhất là 1.000đ' });
            }
    
            // Kiểm tra xem quỹ có tồn tại không
            const fund = await SavingsFund.findById(fundId);
            if (!fund) {
                return res.status(404).json({ message: 'Fund not found' });
            }
    
            // Đảm bảo members là một mảng, khởi tạo nếu cần
            if (!Array.isArray(fund.members)) {
                fund.members = [];
            }
    
            // Lấy participantId từ request (người dùng đăng nhập)
            const userId = req.user.id;
    
            // Thêm giao dịch mới vào transactions
            fund.transactions.push({
                userId,
                amount,
                note
            });
    
            // Chuyển đổi currentAmount thành số nếu cần
            fund.currentAmount = parseFloat(fund.currentAmount) || 0;
    
            // Cập nhật số tiền hiện tại của quỹ
            fund.currentAmount += parseFloat(amount);
    
            // Tìm người dùng trong danh sách thành viên và cộng dồn số tiền đóng góp
            const memberIndex = fund.members.findIndex(member => member.userId.toString() === userId);
    
            if (memberIndex !== -1) {
                // Cập nhật số tiền đóng góp
                fund.members[memberIndex].contribution += parseFloat(amount);
            } else {
                // Nếu người dùng chưa có trong danh sách thành viên, thêm mới họ vào
                fund.members.push({
                    userId: userId,
                    contribution: parseFloat(amount)
                });
            }
    
            // Lưu quỹ sau khi thêm giao dịch và cập nhật đóng góp
            await fund.save();
    
            // Phản hồi sau khi lưu thành công
            res.status(200).json({ message: 'Transaction and contribution updated successfully', fund });
        } catch (error) {
            console.error("Error adding transaction:", error); // Log lỗi chi tiết
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
    
    
static async getFundMembers (req, res)  {
    try{
        const  fundId  = req.params.id;
        const fund = await SavingsFund.findById(fundId).populate('members.userId'); // Populate để lấy thông tin chi tiết về user
    
        if (!fund) {
          return res.status(404).json({ message: 'Fund not found' });
        }
    
        // Trả về danh sách thành viên
        res.status(200).json(fund.members);
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });  
    }
}


static async getFundTransactions(req, res) {
    try {
        const fundId = req.params.id;
        const fund = await SavingsFund.findById(fundId).populate({
            path: 'transactions.userId',
            select: 'name avatar' // Chọn các trường cần thiết
        });

        if (!fund) {
            return res.status(404).json({ message: 'Fund not found' });
        }

        // Trả về danh sách giao dịch
        res.status(200).json(fund.transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

}

module.exports = SavingsFundController;
