const { validationResult } = require('express-validator');
const SavingsFund = require('../models/SavingsFund');
const Category = require('../models/Category');
const User = require('../models/User');
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
            }).populate('categoryId');

            res.json(savingsFunds || []);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Lỗi máy chủ');
        }
    }

   static async getById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id; 

        const data = await SavingsFund.findById(id)
            .populate('userId')
            .populate('members.userId')
            .populate('transactions.participantId');

        if (!data) {
            return res.status(404).json({ message: 'Quỹ tiết kiệm không tồn tại' });
        }

        // Kiểm tra xem userId có trong danh sách members không
        const isMember = data.members.some(member => member.userId && member.userId._id.toString() === userId);

        if (!isMember) {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập chi tiết quỹ tiết kiệm này' });
        }

        res.status(200).json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


    // Thêm giao dịch nạp tiền riêng lẻ 
    static async addTransaction(req, res) {
        try {
            const { amount, note } = req.body;
            const fundId = req.params.id;
            if (amount < 1000) {
                return res.status(400).json({ message: 'Số tiền ít nhất là 1.000đ' });
            }
            const fund = await SavingsFund.findById(fundId);
            if (!fund) {
                return res.status(404).json({ message: 'Fund not found' });
            }
            const userId = req.user.id;
            const user = await User.findById(userId);
            if (!user || user.wallet < amount) {
                return res.status(400).json({ message: 'Số dư trong ví không đủ để thực hiện giao dịch' });
            }
            user.wallet -= amount;
            await user.save();
            
            fund.currentAmount += parseFloat(amount);  
            fund.transactions.push({
                userId,
                amount,
                note,
                date: new Date()
            });
            const memberIndex = fund.members.findIndex(member => member.userId.toString() === userId);
            if (memberIndex !== -1) {
                fund.members[memberIndex].contribution += parseFloat(amount);
            } else {
                fund.members.push({
                    userId: userId,
                    contribution: parseFloat(amount)
                });
            }
           const data = await fund.save();
            res.status(200).json({ 
                message: 'Transaction and contribution updated successfully',
                data: data
            });
        } catch (error) {
            console.error("Error adding transaction:", error); // Detailed error logging
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
    

    static async getFundMembers(req, res) {
        try {
            const fundId = req.params.id;
            const fund = await SavingsFund.findById(fundId).populate('members.userId'); 
            if (!fund) {
                return res.status(404).json({ message: 'Fund not found' });
            }
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
                select: 'name avatar' 
            });
            if (!fund) {
                return res.status(404).json({ message: 'Fund not found' });
            }
            res.status(200).json(fund.transactions);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }
    static async editSavingsFund(req, res) {
        const { id } = req.params; 
        const userId = req.user.id; 
        const { name, targetAmount, categoryId, startDate, endDate } = req.body; 
    
        try {
            if (new Date(startDate) >= new Date(endDate)) {
                return res.status(400).json({ message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc' });
            }
    
            const fund = await SavingsFund.findById(id);
            if (!fund) {
                return res.status(404).json({ message: 'Quỹ tiết kiệm không tồn tại' });
            }
    
            const isOwner = fund.userId.toString() === userId;
            if (!isOwner) {
                return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa quỹ tiết kiệm này' });
            }
    
            if (categoryId) {
                const category = await Category.findById(categoryId);
                if (!category) {
                    return res.status(404).json({ message: 'Danh mục không tồn tại' });
                }
            }
    
            if (name) fund.name = name;
            if (targetAmount) fund.targetAmount = targetAmount;
            if (categoryId) fund.categoryId = categoryId;
            if (startDate) fund.startDate = new Date(startDate);
            if (endDate) fund.endDate = new Date(endDate);
    
            const updatedFund = await fund.save();
    
            res.status(200).json({ message: 'Cập nhật quỹ tiết kiệm thành công', updatedFund });
        } catch (error) {
            console.error("Error updating savings fund:", error); 
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
    

}

module.exports = SavingsFundController;
