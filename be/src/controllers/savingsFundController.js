const SavingsFund = require('../models/SavingsFund');

const User = require('../models/User');
const { checkAuth } = require('../middleware/auth');

class SavingsFundController {
    // Lấy tất cả quỹ tiết kiệm của người dùng
    static async getAll(req, res) {
        try {
            const userId = req.user.id;
            const data = await SavingsFund.find({ 'members.userId': userId }).populate({
                path: 'categoryId',
                select: 'image name'
            });
            console.log('Saving Fund:', data);
            res.status(200).json({ data });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // Lấy quỹ tiết kiệm theo ID
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
    // Controller function on backend

// Controller function on backend
static async create(req, res) {
    try {
        // Lấy thông tin quỹ từ body của request
        const fundData = req.body;

        // Lấy userId của người dùng đã đăng nhập từ req.user (giả sử middleware xác thực đã chạy)
        const userId = req.user.id;

        // Log payload từ frontend (tùy chọn)
        console.log("Payload received on backend:", fundData);

        // Tạo quỹ mới với thông tin từ request và thêm người tạo quỹ vào danh sách thành viên
        const fund = new SavingsFund({
            ...fundData, // Lấy tất cả thông tin từ fundData
            userId, // Thêm userId của người tạo vào quỹ
            members: [{ // Thêm người tạo làm thành viên đầu tiên với đóng góp ban đầu là 0
                userId,
                contribution: 0
            }]
        });

        // Lưu quỹ vào cơ sở dữ liệu
        await fund.save();

        // Trả về kết quả thành công cùng với thông tin của quỹ vừa tạo
        res.status(201).json(fund);
    } catch (error) {
        // Xử lý lỗi
        console.error("Error creating savings fund:", error);
        res.status(400).json({ error: error.message });
    }
}

static async update(req, res) {
    
}

    // Xóa quỹ tiết kiệm
    static async delete(req, res) {
        try {
            const _id = req.params.id;
            const userId = req.user.id;
            const result = await SavingsFund.findOneAndDelete({ userId, _id });
            if (result) {
                res.status(200).json({ message: 'Xóa quỹ tiết kiệm thành công' });
            } else {
                res.status(404).json({ message: 'Savings fund not found' });
            }
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
