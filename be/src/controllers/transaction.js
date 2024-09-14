const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

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

      let data = { userId, date, amount, type, categoryId, description };
      let createRes = await Transaction.create(data);

      await TransactionController.updateBudget(userId, categoryId, date);

      console.log("Transaction created:", createRes);

      return res.status(200).json({
        message: "Created successfully",
        data: createRes,
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async edit(req, res) {
    try {
      let userId = req.user.id;
      let transactionId = req.params.id;
      let { date, amount, type, categoryId, description } = req.body;

      if (!date || !amount || !type || !categoryId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let data = { userId, date, amount, type, categoryId, description };
      let result = await Transaction.findByIdAndUpdate(transactionId, data, {
        new: true,
      });

      if (!result) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Update budget after updating transaction
      await TransactionController.updateBudget(userId, categoryId, date);

      // Log the successful update
      console.log("Transaction updated:", result);

      return res.status(200).json({
        message: "Updated successfully",
        data: result,
      });
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Error updating transaction:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async delete(req, res) {
    try {
      let userId = req.user.id;
      let transactionId = req.params.id;

      let transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

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
