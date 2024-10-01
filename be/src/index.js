'use strict';
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const ejsMate = require('ejs-mate');
const categorieRoutes = require("./routes/admin/categorieRoutes");
const transactionRoutes = require("./routes/transaction");
const userRoutes = require("./routes/admin/userRoutes");
const authRoutes = require("./routes/auth");
const authGoogle = require("./routes/authGoogle");
const fundRoutes = require('./routes/fund');
const savingsFundRoutes = require("./routes/savingsFund")
require('../passport');  // Make sure this is correctly required

// const expenseRoutes= require("./routes/expenseRoutes");
const income = require("./routes/income");
const budgetRoutes = require("./routes/budget")
const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.URL_FE
}))




app.use(express.urlencoded({ extended: true }));

// Routes
// app.use("/api/auth", authGoogle);
app.use("/api/categories", categorieRoutes);
app.use("/api/v2/categories", require('./routes/category'));
app.use("/api/transactions", transactionRoutes);
app.use('/api/savings-goals', require('./routes/savingsGoal'));
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/savings-funds", savingsFundRoutes);
app.use('/api', fundRoutes);
connectDB();

// app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', income);
app.use('/api/budgets', budgetRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});