const mongoose = require('mongoose');

const ConfirmationSchema = new mongoose.Schema({
    goalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SavingsFund',
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Confirmation', ConfirmationSchema);
