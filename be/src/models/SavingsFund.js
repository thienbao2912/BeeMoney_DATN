const mongoose = require('mongoose');

// Schema SavingsFund
const savingsFundSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  // Thêm categoryId để liên kết với danh mục
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contribution: { type: Number, default: 0 }
  }],
  
  transactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    note: { type: String },
    date: { type: Date, default: Date.now }
  }] 
});

const SavingsFund = mongoose.model('SavingsFund', savingsFundSchema);

module.exports = SavingsFund;
