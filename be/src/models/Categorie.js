const mongoose = require("mongoose");
const { Schema } = mongoose;

const CategorieSchema = new Schema(
    {
        type: { type: String, required: true },
        image: { type: String },
        name: { type: String },
        description: { type: String },
        status: { type: String, default: 'active' },
        "userId": {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    },

    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("categories", CategorieSchema);
