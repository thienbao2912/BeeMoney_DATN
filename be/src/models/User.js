const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, default: 'active' },
    socialLogin: {
        googleId: String,
        facebookId: String
    },
    avatar: String,
    role: { type: String, default: 'user' },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    tokenLogin: String,
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.password && !user.isModified('password')) return next();

    if (user.password) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
    }
    next();
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.methods.createPasswordChangedToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Token hết hạn sau 15 phút
    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);