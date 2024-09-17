const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailservices');
const passport = require('passport');
const cron = require('node-cron');
const crypto = require('crypto');

const authController = {

    // Đăng ký
    registerUser: async (req, res) => {
        try {
            const { email, password, name } = req.body;

            const checkEmail = await User.findOne({ email });
            if (checkEmail) {
                return res.status(400).json({ error: 'Email đã tồn tại' });
            }

            const newUser = new User({ email, password, name });
            await newUser.save();

            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Đăng nhập
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(400).json({ error: 'Thông tin đăng nhập không chính xác' });
            }

            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.status(400).json({ error: 'Thông tin đăng nhập không chính xác' });
            }

            if (user.status != 'active') {
                return res.status(400).json({ error: 'Tài khoản đã bị khóa' });
            }
            const payload = {
                id: user.id,
                role: user.role,
                name: user.name,
            };
            const jwtSecret = process.env.JWT_ACCESS_KEY;
            if (!jwtSecret) {
                throw new Error('JWT_ACCESS_KEY is not defined');
            }

            const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
            const { password, ...others } = user._doc
            return res.status(200).json({ ...others, accessToken: token });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },

    forgotPassword: async (req, res) => {
        const { email } = req.body;
        try {
            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ error: 'No account found with that email' });
            }

            const token = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = Date.now() + 7200000; // 1 giờ
            await user.save();

            await sendPasswordResetEmail(user.email, token);

            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    verifyOldPassword: async (req, res) => {
        const { userId, oldPassword } = req.body;

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ success: false, msg: 'User not found' });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);

            if (!isMatch) {
                return res.status(400).json({ success: false, msg: 'Old password is incorrect' });
            }

            return res.status(200).json({ success: true, msg: 'Old password is correct' });
        } catch (error) {
            return res.status(500).json({ success: false, msg: 'Server error' });
        }
    },

    resetPassword : async (req, res) => {
        try {
            const { password, token } = req.body;
    
            if (!password || !token) {
                return res.status(400).json({ error: 'Password and token are required' });
            }
    
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
    
            if (!user) {
                return res.status(400).json({ error: 'Token đã hết hạn hoặc không hợp lệ' });
            }
    
            user.password = password; // Bạn có thể thêm mã hóa mật khẩu nếu cần
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
    
            res.status(200).json({ success: true });
        } catch (error) {
            console.error("Server Error:", error); // Debugging
            res.status(500).json({ error: 'Server error' });
        }
    },

    getAllUser: async (req, res) => {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    deleteUser: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getUserProfile: async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('-password');
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    getOne: async (req, res) => {
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: "Không tìm thấy người dùng" });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const userId = req.params.id;
            const { name, email, avatar, password, role } = req.body;
    
            let updateData = { name, email, avatar, role };
    
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateData.password = hashedPassword;
            }
    
            const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            res.status(200).json({ success: true, user });
        } catch (error) {
            res.status(500).json({ error: 'Server error while updating user' });
        }
    },

    getProfile: async (req, res) => {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: "User ID is required" });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: "Không tìm thấy người dùng" });
            }

            const { _id, email, name, avatar, role } = user;
            res.status(200).json({ _id, email, name, avatar, role });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    list: async (req, res) => {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    }
}

cron.schedule('*/1 * * * *', async () => {
    try {
        const now = new Date();
        await User.updateMany(
            { resetPasswordExpires: { $lte: now } },
            { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } }
        );
    } catch (error) {
        console.error('Error clearing expired reset password tokens:', error);
    }
});

module.exports = authController;
