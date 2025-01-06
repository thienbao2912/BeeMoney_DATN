const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    name: { // Thêm trường tên ngân sách
        type: String
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    totalExpenses: {
        type: Number,
        default: 0
    },
    remainingBudget: {
        type: Number,
        default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: { // Trạng thái hoạt động (active, inactive)
        type: String,
        enum: ['active', 'inactive'], // Chỉ cho phép 2 giá trị này
        default: 'active' // Mặc định là active
    },
    budgetStatus: { // Trạng thái ngân sách (available, exhausted, over-budget)
        type: String,
        enum: ['available', 'exhausted', 'over-budget'], // Chỉ cho phép 3 giá trị này
        default: 'available' // Mặc định là available
    },
    repeat: { type: Boolean, default: false }, // Thêm cờ lặp lại
}, { timestamps: true });

module.exports = mongoose.model('budgets', BudgetSchema);
