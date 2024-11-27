const { validationResult } = require('express-validator');
const Confirmation = require('../models/Confirmation');
const SavingsFund = require('../models/SavingsFund');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { saveConfirmationCode } = require('../utils/confirmationUtils');

const generateConfirmationCode = () => {
    return Math.random().toString(36).substr(2, 8);
};



const sendConfirmationEmail = async (email, code) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });


    const mailOptions = {
        from: `"BeeMoney" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Mã xác nhận tham gia quỹ tiết kiệm',
        html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    <h2 style="text-align: center; color: #8A2BE2; font-size: 24px; margin-bottom: 20px; letter-spacing: 1px;">Mã xác nhận của bạn</h2>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        Bạn đã được mời tham gia vào quỹ tiết kiệm. Vui lòng sử dụng mã xác nhận dưới đây để tham gia:
    </p>
    <div style="background-color: #f3e8ff; padding: 25px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px; border: 1px solid #dcd3f0; margin-bottom: 20px;">
        <span style="color: #8A2BE2;">${code}</span>
    </div>
    <p style="font-size: 14px; text-align: center; color: #888; margin-bottom: 20px;">
        Mã xác nhận này có hiệu lực trong 24 giờ.
    </p>
    <p style="margin-top: 40px; font-size: 14px; color: #666; text-align: center;">
        BeeMoney - Quản lý chi tiêu
    </p>
</div>

        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email đã được gửi thành công');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

class SavingsFundController {
    static async sendInviteCode(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const { email, fundId } = req.body;
    
        try {
            // Tìm người dùng theo email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'Email này không sử dụng BeeMoney' });
            }
    
            // Tìm quỹ tiết kiệm theo ID
            const savingsFund = await SavingsFund.findById(fundId);
            if (!savingsFund) {
                return res.status(404).json({ message: 'Quỹ tiết kiệm không tồn tại' });
            }
    
            // Kiểm tra xem email đã tham gia quỹ chưa
            const isMember = savingsFund.members.some(member => member.userId.equals(user._id));
            if (isMember) {
                return res.status(400).json({ message: 'Email này đã tham gia quỹ' });
            }
    
            // Tạo mã xác nhận
            const code = generateConfirmationCode();
            await saveConfirmationCode(fundId, code);
    
            // Gửi email xác nhận
            await sendConfirmationEmail(email, code);
    
            res.json({ message: 'Mã xác nhận đã được gửi đến email' });
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

        const { code } = req.body;

        try {
            const confirmation = await Confirmation.findOne({ code });
            if (!confirmation) {
                return res.status(404).json({ message: 'Mã xác nhận không hợp lệ' });
            }

            if (confirmation.expiresAt < new Date()) {
                return res.status(400).json({ message: 'Mã xác nhận đã hết hạn' });
            }

            const savingsFund = await SavingsFund.findById(confirmation.fundId);
            if (!savingsFund) {
                return res.status(404).json({ message: 'Quỹ tiết kiệm không tồn tại' });
            }

            // Kiểm tra và khởi tạo members nếu nó không tồn tại
            if (!savingsFund.members) {
                savingsFund.members = [];
            }

            // Kiểm tra nếu người dùng đã là thành viên
            if (savingsFund.members.some(member => member.userId.equals(req.user.id))) {
                return res.status(400).json({ message: 'Tài khoản đã tồn tại trong quỹ tiết kiệm' });
            }

            // Thêm người dùng vào quỹ tiết kiệm
            savingsFund.members.push({
                userId: req.user.id,
                contribution: 0
            });
            await savingsFund.save();
            await Confirmation.deleteOne({ code });

            res.json({ message: 'Tham gia quỹ tiết kiệm thành công', savingsFund });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Lỗi máy chủ');
        }
    }
}

module.exports = SavingsFundController;
