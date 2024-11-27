const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailservices');
const passport = require('passport');
const { inactive } = require('../services/lockedaccount');
const cron = require('node-cron');
const crypto = require('crypto');

const authController = {

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
    
            if (user.status === 'locked') {
                return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
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
    
            const token = jwt.sign(payload, jwtSecret, { expiresIn: '100h' });
    
            const isFirstLogin = user.isFirstLogin;
    
            if (isFirstLogin) {
                await User.findByIdAndUpdate(user._id, { isFirstLogin: false });
            }
    
            await authController.updateLastLogin(user._id);
            const { password, ...others } = user._doc;
    
            return res.status(200).json({ 
                ...others, 
                accessToken: token, 
                isFirstLogin 
            });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },    

    updateLastLogin: async (userId) => {
        try {
            await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
        } catch (error) {
            console.error('Error updating last login:', error);
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

            const { _id, email, name, avatar, role, wallet } = user;
            res.status(200).json({ _id, email, name, avatar, role,  wallet });
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
    },
    addHobbies : async (req, res) => {
        try {
            const { userId, hobbies } = req.body; // userId và hobbies sẽ được gửi từ frontend
            const user = await User.findById(userId);
    
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
    
            // Thêm sở thích vào mảng hobbies của người dùng
            user.hobbies.push(...hobbies); // hobbies là mảng sở thích
            await user.save();
    
            return res.status(200).json({ success: true, message: 'Hobbies added successfully', user });
        } catch (error) {
            console.error("Error adding hobbies:", error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
      },
      getUserHobbies: async (req, res) => {
        try {
            const { userId } = req.params;

            // Tìm người dùng trong cơ sở dữ liệu
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Giả sử bạn đã có trường hobbies trong schema User
            const hobbies = user.hobbies || [];  // Lấy danh sách sở thích của người dùng

            res.status(200).json({ success: true, hobbies });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    removeHobby: async (req, res) => {
        try {
            const { userId, hobbyId } = req.body;  // userId and hobbyId will be passed from the frontend
            const user = await User.findById(userId);
    
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
    
            // Remove the hobby from the hobbies array
            user.hobbies = user.hobbies.filter(hobby => hobby !== hobbyId); // hobbyId is used here for simplicity
            await user.save();
    
            return res.status(200).json({ success: true, message: 'Hobby removed successfully', user });
        } catch (error) {
            console.error("Error removing hobby:", error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    
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

cron.schedule('*/1 * * * *', async () => { 
    try {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const result = await User.updateMany(
            { lastLogin: { $lte: oneYearAgo }, status: { $ne: 'locked' } }, 
            { $set: { status: 'locked' } }
        );

        const lockedUsers = await User.find({ lastLogin: { $lte: oneYearAgo }, status: 'locked', emailSent: false  });

        for (const user of lockedUsers) {
            try {
                await inactive(user.email, user._id);
                console.log(`Sent email to ${user.email}`);
                await User.findByIdAndUpdate(user._id, { emailSent: true });
            } catch (error) {
                console.error(`Error sending email to ${user.email}:`, error);
            }
        }

    } catch (error) {
        console.error('Error locking inactive accounts:', error);
    }
    
});

module.exports = authController;
