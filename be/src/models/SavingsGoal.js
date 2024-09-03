const mongoose = require('mongoose');
const Schema = mongoose.Schema
const SavingsGoalSchema = new Schema({
    "userId": {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    "name": {
        type: String,
        required: true
    },
    "targetAmount": {
        type: Number,
        required: true
    },
    "currentAmount": {
        type: Number,
        default: 0
    },
    "startDate": {
        type: Date,
        required: true
    },
    "endDate": {
        type: Date,
        required: true
    },
    "categoryId": {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SavingsGoal', SavingsGoalSchema);
