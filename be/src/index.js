'use strict';
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const ejsMate = require('ejs-mate');

require('../passport'); 

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

connectDB();

// app.use('/api/expenses', expenseRoutes);


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});