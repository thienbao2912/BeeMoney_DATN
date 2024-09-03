const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { Types } = require('mongoose');
const Category = require('../models/Category'); // Import model Category

class BudgetController {
    static async createBudget(req, res) {
        try {
            const { categoryId, startDate, endDate, amount, userId } = req.body;
    
            // Kiểm tra tính hợp lệ của userId
            if (!Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'UserId không hợp lệ' });
            }
    
            // Kiểm tra ngày bắt đầu và ngày kết thúc
            if (new Date(startDate) > new Date(endDate)) {
                return res.status(400).json({ message: 'Ngày bắt đầu không được sau ngày kết thúc' });
            }
    
            // Kiểm tra categoryId
            const existingCategory = await Category.findById(categoryId);
            if (!existingCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }
    
            // Kiểm tra ngân sách đã tồn tại
            const existingBudget = await Budget.findOne({ categoryId, userId, startDate: { $lte: endDate }, endDate: { $gte: startDate } });
            if (existingBudget) {
                return res.status(400).json({ message: 'Ngân sách của danh mục này đã tồn tại' });
            }
    
            // Tạo ngân sách mới
            const budget = new Budget({
                categoryId,
                startDate,
                endDate,
                amount,
                userId
            });
    
            await budget.save();
            console.log(`Budget created: ${JSON.stringify(budget)}`);
    
            // Tính toán tổng chi tiêu
            const expenses = await Transaction.find({
                categoryId,
                type: 'expense',
                userId,
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }).exec();
    
            console.log(`Expenses found: ${expenses.length}`);
            expenses.forEach(transaction => {
                console.log(`Transaction ID: ${transaction._id}, Amount: ${transaction.amount}`);
            });
    
            const totalExpenses = expenses.reduce((total, transaction) => {
                const transactionAmount = parseFloat(transaction.amount);
                console.log(`Transaction amount: ${transaction.amount}, Parsed amount: ${transactionAmount}`);
                return total + transactionAmount;
            }, 0);
    
            console.log(`Total expenses calculated: ${totalExpenses}`);
    
            // Cập nhật ngân sách
            budget.totalExpenses = totalExpenses;
            budget.remainingBudget = budget.amount - totalExpenses;
            await budget.save();
    
            let message = 'Budget created successfully';
            if (budget.remainingBudget === 0) {
                message = 'Ngân sách đã hết';
            } else if (budget.remainingBudget < 0) {
                message = 'Chi tiêu vượt ngân sách';
            }
    
            res.status(201).json({ budget, message });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            let userId = req.headers['authorization'] ? req.headers['authorization'].replace('Bearer ', '') : req.params.userId;
            let budgetId = req.params.budgetId;

            if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(budgetId)) {
                return res.status(400).json({ message: 'Invalid IDs' });
            }

            console.log(`Received User ID: ${userId}, Budget ID: ${budgetId}`);

            let data = await Budget.findOne({ userId, _id: budgetId }).populate('categoryId');

            if (!data) {
                return res.status(404).json({ message: 'Budget not found' });
            }

            res.status(200).json({ data: data });
        } catch (error) {
            console.error('Server Error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }     

    static async deleteBudget(req, res) {
        try {
            const { budgetId } = req.params;

            // Xóa budget theo Id
            const deletedBudget = await Budget.findByIdAndDelete(budgetId);

            if (!deletedBudget) {
                return res.status(404).json({ message: 'Budget not found' });
            }

            res.status(200).json({ message: 'Budget deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
        static async getAllBudgets(req, res) {
        try {
            const { userId } = req.query;
            // Lấy tất cả các ngân sách của userId và populate các trường liên quan
            const budgets = await Budget.find({ userId }).populate('categoryId').exec();

            console.log(`Budgets found: ${budgets.length}`);
            console.log(budgets);

            res.status(200).json(budgets);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getExpensesForBudget(req, res) {
        try {
            const budgetId = req.params.budgetId;

            // Tìm budget để lấy thông tin startDate và endDate
            const budget = await Budget.findById(budgetId);
            if (!budget) {
                return res.status(404).json({ message: 'Budget not found' });
            }

            const categoryId = budget.categoryId;
            const startDate = new Date(budget.startDate);
            const endDate = new Date(budget.endDate);

            // Tìm các giao dịch có categoryId và date nằm trong khoảng startDate và endDate của ngân sách
            const expenses = await Transaction.find({
                categoryId,
                type: 'expense',
                date: {
                    $gte: startDate,
                    $lte: endDate
                },
                userId: req.user.id
            }).exec();

            res.status(200).json({ expenses });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
    
}

module.exports = BudgetController;