const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SavingsFundSchema = new Schema({
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    members: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            contributionAmount: { type: Number, required: true },
            contributedAt: { type: Date, default: Date.now }
        }
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('SavingsFund', SavingsFundSchema);
