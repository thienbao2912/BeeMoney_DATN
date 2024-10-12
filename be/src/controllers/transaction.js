const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const User = require('../models/User'); // Đảm bảo đường dẫn đúng với vị trí model User của bạn
class TransactionController {
  static async getAll(req, res) {
    try {
      let userId = req.user.id;
      let queryString = req.query;
      let type = queryString.type;
      let data = [];
      if (type) {
        data = await Transaction.find({ userId, type }).populate({
          path: "categoryId",
          select: "image name",
        });
        console.log(data);
        return res.status(200).json({
          data,
        });
      }
      data = await Transaction.find({ userId }).populate({
        path: "categoryId",
        select: "image name",
      });
      console.log(data);
      res.status(200).json({
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  }

  static async getById(req, res) {
    try {
      let userId = req.user.id;
      let transactionId = req.params.id;
      let data = await Transaction.findOne({ userId, _id: transactionId });
      res.status(200).json({
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error",
      });
    }
  }

  static async create(req, res) {
    try {
        let userId = req.user.id;
        let { date, amount, type, categoryId, description } = req.body;

        if (!date || !amount || !type || !categoryId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (type === 'expense') {
            user.wallet -= amount; // Có thể âm
        } else if (type === 'income') {
            user.wallet += amount; // Cộng vào ví
        }

        await user.save();

        let data = { userId, date, amount, type, categoryId, description };
        let createRes = await Transaction.create(data);

        await TransactionController.updateBudget(userId, categoryId, date);

        return res.status(200).json({
            message: "Created successfully",
            data: createRes,
        });
    } catch (error) {
        console.error("Error creating transaction:", error); // Log chi tiết lỗi
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}


static async edit(req, res) {
  try {
    let userId = req.user.id;
    let transactionId = req.params.id;
    let { date, amount, type, categoryId, description } = req.body;

    // Validate required fields
    if (!date || !amount || !type || !categoryId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the current transaction before editing
    let oldTransaction = await Transaction.findById(transactionId);
    if (!oldTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Get user information to update wallet
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure the amounts are treated as numbers
    const oldAmount = Number(oldTransaction.amount);
    const newAmount = Number(amount);

    // Update wallet based on the old transaction type
    if (oldTransaction.type === 'expense') {
      user.wallet += oldAmount; // Refund the old amount to wallet
    } else if (oldTransaction.type === 'income') {
      user.wallet -= oldAmount; // Deduct the old amount from wallet
    }

    // Update wallet with the new amount
    if (type === 'expense') {
      user.wallet -= newAmount; // Deduct new amount from wallet
    } else if (type === 'income') {
      user.wallet += newAmount; // Add new amount to wallet
    }

    // Save user with the new wallet balance
    await user.save();

    // Update the transaction
    let data = { userId, date, amount, type, categoryId, description };
    let result = await Transaction.findByIdAndUpdate(transactionId, data, { new: true });

    // Check if updating the transaction was successful
    if (!result) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Update budget after editing the transaction
    await TransactionController.updateBudget(userId, categoryId, date);

    // Log the updated transaction
    console.log("Transaction updated:", result);

    return res.status(200).json({
      message: "Updated successfully",
      data: result,
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error updating transaction:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

static async delete(req, res) {
  try {
    let userId = req.user.id;
    let transactionId = req.params.id;

    // Find the transaction to delete
    let transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Find the user to update the wallet
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure the amount is treated as a number
    const amount = Number(transaction.amount);

    // Update the wallet based on the type of transaction
    if (transaction.type === 'expense') {
      user.wallet += amount; // Add back the amount for expense
    } else if (transaction.type === 'income') {
      user.wallet -= amount; // Subtract the amount for income
    }

    await user.save(); // Save the updated wallet balance

    // Delete the transaction
    await Transaction.findByIdAndDelete(transactionId);

    // Update budget after deleting transaction
    await TransactionController.updateBudget(
      userId,
      transaction.categoryId,
      transaction.date
    );

    res.status(200).json({
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error); // Log the error for debugging
    res.status(500).json({
      message: "Server error",
    });
  }
}



  static async updateBudget(userId, categoryId, transactionDate) {
    try {
      // Tìm ngân sách liên quan tới giao dịch
      const budgets = await Budget.find({
        userId,
        categoryId,
        startDate: { $lte: new Date(transactionDate) },
        endDate: { $gte: new Date(transactionDate) },
      });

      for (let budget of budgets) {
        // Tính toán lại tổng chi tiêu và ngân sách còn lại
        const expenses = await Transaction.find({
          categoryId,
          type: "expense",
          userId,
          date: {
            $gte: new Date(budget.startDate),
            $lte: new Date(budget.endDate),
          },
        });

        const totalExpenses = expenses.reduce((total, transaction) => {
          return total + parseFloat(transaction.amount);
        }, 0);

        budget.totalExpenses = totalExpenses;
        budget.remainingBudget = budget.amount - totalExpenses;
        await budget.save();
      }
    } catch (error) {
      console.error("Error updating budget:", error);
    }
  }
}

module.exports = TransactionController;
