const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SpendingCategorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    },
    amount: Number,
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('SpendingCategory', SpendingCategorySchema);
