const Expense = require('../models/Income');

// Create a new expense
exports.createIncome = async (req, res) => {
    try {
        const expense = new Expense(req.body);
        await expense.save();
        res.status(201).send(expense);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get all expenses
exports.getAllIncomes = async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.status(200).send(expenses);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get a single expense by ID
exports.getIncomeById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).send();
        }
        res.status(200).send(expense);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Update an expense by ID
exports.updateIncome = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!expense) {
            return res.status(404).send();
        }
        res.status(200).send(expense);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Delete an expense by ID
exports.deleteIncome = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).send();
        }
        res.status(200).send(expense);
    } catch (error) {
        res.status(500).send(error);
    }
};
// GET all incomes by userId

