const cron = require('node-cron');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { Types } = require('mongoose');
const Category = require('../models/Category');

class BudgetController {
    static async createBudget(req, res) {
        try {
            const { name, categoryId, startDate, endDate, amount, userId, repeat } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({ message: 'Tên ngân sách không được để trống' });
            }

            if (!Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'UserId không hợp lệ' });
            }

            if (new Date(startDate) > new Date(endDate)) {
                return res.status(400).json({ message: 'Ngày bắt đầu không được sau ngày kết thúc' });
            }

            const existingCategory = await Category.findById(categoryId);
            if (!existingCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }

            const currentDate = new Date();
            const existingBudget = await Budget.findOne({
                categoryId,
                userId,
                startDate: { $lte: endDate },
                endDate: { $gte: startDate, $gte: currentDate }
            });

            if (existingBudget) {
                return res.status(400).json({ message: 'Ngân sách của danh mục này đã tồn tại và còn hiệu lực' });
            }

            const budget = new Budget({
                name,
                categoryId,
                startDate,
                endDate,
                amount,
                userId,
                status: 'active',
                budgetStatus: 'available',
                repeat: repeat || false, // Mặc định repeat là false nếu không được cung cấp
            });

            await budget.save();

            const expenses = await Transaction.find({
                categoryId,
                type: 'expense',
                userId,
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }).exec();

            const totalExpenses = expenses.reduce((total, transaction) => total + parseFloat(transaction.amount), 0);
            budget.totalExpenses = totalExpenses;
            budget.remainingBudget = budget.amount - totalExpenses;

            if (new Date() > new Date(budget.endDate)) {
                budget.status = 'inactive';
            }

            if (budget.remainingBudget === 0) {
                budget.budgetStatus = 'exhausted';
            } else if (budget.remainingBudget < 0) {
                budget.budgetStatus = 'over-budget';
            }

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

            let data = await Budget.findOne({ userId, _id: budgetId }).populate('categoryId');

            if (!data) {
                return res.status(404).json({ message: 'Budget not found' });
            }

            res.status(200).json({ data });
        } catch (error) {
            console.error('Server Error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async deleteBudget(req, res) {
        try {
            const { budgetId } = req.params;

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

            const budgets = await Budget.find({ userId }).populate('categoryId').exec();

            res.status(200).json(budgets);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getExpensesForBudget(req, res) {
        try {
            const budgetId = req.params.budgetId;

            const budget = await Budget.findById(budgetId);
            if (!budget) {
                return res.status(404).json({ message: 'Budget not found' });
            }

            const categoryId = budget.categoryId;
            const startDate = new Date(budget.startDate);
            const endDate = new Date(budget.endDate);

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

    static async updateBudget(req, res) {
        try {
            const { budgetId } = req.params;
            const { name, categoryId, startDate, endDate, amount, userId, repeat } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({ message: 'Tên ngân sách không được để trống' });
            }

            if (!Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'UserId không hợp lệ' });
            }

            if (new Date(startDate) > new Date(endDate)) {
                return res.status(400).json({ message: 'Ngày bắt đầu không được sau ngày kết thúc' });
            }

            const existingCategory = await Category.findById(categoryId);
            if (!existingCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }

            const budget = await Budget.findById(budgetId);
            if (!budget) {
                return res.status(404).json({ message: 'Budget not found' });
            }

            budget.name = name;
            budget.categoryId = categoryId;
            budget.startDate = startDate;
            budget.endDate = endDate;
            budget.amount = amount;
            budget.repeat = repeat || false;

            const expenses = await Transaction.find({
                categoryId,
                type: 'expense',
                userId,
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }).exec();

            const totalExpenses = expenses.reduce((total, transaction) => total + parseFloat(transaction.amount), 0);

            budget.totalExpenses = totalExpenses;
            budget.remainingBudget = budget.amount - totalExpenses;

            if (new Date() > new Date(budget.endDate)) {
                budget.status = 'inactive';
            }

            if (budget.remainingBudget === 0) {
                budget.budgetStatus = 'exhausted';
            } else if (budget.remainingBudget < 0) {
                budget.budgetStatus = 'over-budget';
            } else {
                budget.budgetStatus = 'available';
            }

            await budget.save();

            let message = 'Budget updated successfully';
            if (budget.remainingBudget === 0) {
                message = 'Ngân sách đã hết';
            } else if (budget.remainingBudget < 0) {
                message = 'Chi tiêu vượt ngân sách';
            }

            res.status(200).json({ budget, message });
        } catch (error) {
            console.error('Error updating budget:', error);
            res.status(500).json({ error: error.message });
        }
    }
    static async checkAndRepeatBudgets() {
        try {
            const currentDate = new Date();

            const budgetsToRepeat = await Budget.find({
                endDate: { $lt: currentDate },
                repeat: true,
                status: 'inactive',
            });

            for (const oldBudget of budgetsToRepeat) {
                const oldStartDate = new Date(oldBudget.startDate);
                const oldEndDate = new Date(oldBudget.endDate);
                const duration = oldEndDate - oldStartDate;

                const newStartDate = new Date(oldEndDate.getTime() + 1);
                const newEndDate = new Date(newStartDate.getTime() + duration);

                const newBudget = new Budget({
                    name: oldBudget.name,
                    categoryId: oldBudget.categoryId,
                    startDate: newStartDate,
                    endDate: newEndDate,
                    amount: oldBudget.amount,
                    userId: oldBudget.userId,
                    status: 'active',
                    budgetStatus: 'available',
                    repeat: true,
                });

                await newBudget.save();
            }
        } catch (error) {
            console.error('Error in repeating budgets:', error);
        }
    }

    static setupBudgetCronJob() {
        cron.schedule('0 0 * * *', async () => {
            console.log('Running Budget Repeat Cron Job...');
            await BudgetController.checkAndRepeatBudgets();
        });
        console.log('Budget Cron Job setup completed.');
    }

}

module.exports = BudgetController;
