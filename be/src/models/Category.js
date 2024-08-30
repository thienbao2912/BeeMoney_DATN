const mongoose = require('mongoose');
const Schema = mongoose.Schema
const CategorySchema = new Schema({
    "type": String,
    "name": String,
    "image": String,
    "description": String,
    "status": { type: String, default: 'active' },
    "userId": {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
