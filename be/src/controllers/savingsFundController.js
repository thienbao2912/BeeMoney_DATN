const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Confirmation = require('../models/Confirmation');
const SavingsFund = require('../models/SavingsFund');
const User = require('../models/User');
const Category = require('../models/Category');
const nodemailer = require('nodemailer');
const { saveConfirmationCode } = require('../utils/confirmationUtils');

const generateConfirmationCode = () => {
    return Math.random().toString(36).substr(2, 8);
};

const sendConfirmationEmail = async (email, code) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"BeeMoney" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Mã xác nhận tham gia quỹ tiết kiệm',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
                <h2 style="text-align: center; color: #4CAF50;">Mã xác nhận của bạn</h2>
                <p>Chào bạn,</p>
                <p>Bạn đã được mời tham gia vào quỹ tiết kiệm. Sử dụng mã xác nhận bên dưới để hoàn tất quá trình:</p>
                <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 20px; border-radius: 5px; border: 1px solid #ddd;">
                    <strong style="color: #4CAF50;">${code}</strong>
                </div>
                <p style="margin-top: 20px;">Cảm ơn,</p>
                <p>Đội ngũ Quản lý BeeMoney</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

class SavingsFundController {
    static async createSavingsFund(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, targetAmount, categoryId, startDate, endDate } = req.body;

        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc' });
        }

        try {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({ message: 'Danh mục không tồn tại' });
            }

            const newFund = new SavingsFund({
                name,
                targetAmount,
                categoryId: categoryId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                members: [
                    {
                        userId: req.user.id,
                        contributionAmount: 0,
                        contributedAt: null
                    }
                ]
            });

            await newFund.save();
            res.status(201).json({ message: 'Tạo quỹ chung thành công', newFund });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    static async addFriendByEmail(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, goalId, contributionAmount } = req.body;

        try {
            const friend = await User.findOne({ email });
            if (!friend) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }

            const savingsFund = await SavingsFund.findById(goalId);
            if (!savingsFund) {
                return res.status(404).json({ message: 'Quỹ tiết kiệm không tồn tại' });
            }

            if (savingsFund.members.some(member => member.userId.equals(friend._id))) {
                return res.status(400).json({ message: 'Người này đã là thành viên' });
            }

            savingsFund.members.push({
                userId: friend._id,
                contributionAmount,
                contributedAt: new Date()
            });
            await savingsFund.save();

            res.json({ message: 'Thêm bạn bè thành công', savingsFund });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    static async sendInviteCode(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, goalId } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }

            const savingsFund = await SavingsFund.findById(goalId);
            if (!savingsFund) {
                return res.status(404).json({ message: 'Quỹ tiết kiệm không tồn tại' });
            }

            const code = generateConfirmationCode();
            await saveConfirmationCode(goalId, code);
            await sendConfirmationEmail(email, code);

            res.json({ message: 'Mã xác nhận đã được gửi đến email của bạn' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    static async acceptInviteByCode(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { code, contributionAmount } = req.body;

        try {
            const confirmation = await Confirmation.findOne({ code });
            if (!confirmation) {
                return res.status(404).json({ message: 'Mã xác nhận không hợp lệ' });
            }

            if (confirmation.expiresAt < new Date()) {
                return res.status(400).json({ message: 'Mã xác nhận đã hết hạn' });
            }

            const savingsFund = await SavingsFund.findById(confirmation.goalId);
            if (!savingsFund) {
                return res.status(404).json({ message: 'Quỹ tiết kiệm không tồn tại' });
            }

            if (savingsFund.members.some(member => member.userId.equals(req.user.id))) {
                return res.status(400).json({ message: 'Tài khoản đã tồn tại trong quỹ tiết kiệm' });
            }

            savingsFund.members.push({
                userId: req.user.id,
                contributionAmount,
                contributedAt: new Date()
            });
            await savingsFund.save();

            await Confirmation.deleteOne({ code });

            res.json({ message: 'Tham gia quỹ tiết kiệm thành công', savingsFund });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    static async getUserSavingsGoals(req, res) {
        const userId = req.user.id;
    
        if (!userId) {
            return res.status(400).json({ message: 'Thiếu userId' });
        }
    
        try {
            const savingsFunds = await SavingsFund.find({
                'members.userId': userId
            }).populate('category');
    
            res.json(savingsFunds || []);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Lỗi máy chủ');
        }
    }
    
}

module.exports = SavingsFundController;
