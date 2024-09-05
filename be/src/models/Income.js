const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const IncomeSchema = new Schema({
    income_date: { type: Date, required: true },
    income_amount: { type: String, required: true },
    description: { type: String, required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Create and export the model
module.exports = mongoose.model('incomes', IncomeSchema, 'incomes');
