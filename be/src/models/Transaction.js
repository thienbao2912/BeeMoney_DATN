const mongoose = require('mongoose');
const Schema = mongoose.Schema
const TransactionSchema = new Schema({
    "userId": {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    "amount": {type: String, required: true},
    "date": {type: Date, required: true},
    "type": {type: String, required: true},
    "categoryId": {type: Schema.Types.ObjectId, ref: 'categories'},
    "description": String,
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
