const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SavingsFundSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
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
}, {
    timestamps: true
});

module.exports = mongoose.model('SavingsFund', SavingsFundSchema);
