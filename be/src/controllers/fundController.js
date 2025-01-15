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
        subject: 'Thư Mời Tham Gia Quỹ Tiết Kiệm BeeMoney',
        html: `
        <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <header style="text-align: center; margin-bottom: 20px;">
                <img src="https://firebasestorage.googleapis.com/v0/b/dax-bemoney.appspot.com/o/logoemail%2Femail-thankyou.png?alt=media&token=d8b6f8f3-7563-467e-9ac4-848eaf7a7a1b" alt="BeeMoney Logo" style="max-width: 590px;">
            </header>
        
            <!-- Title -->
            <h2 style="color: #4CAF50; text-align: center; font-size: 20px; margin-bottom: 15px; font-weight: 600;">
                Bạn Đã Nhận Một Lời Mời!
            </h2>
                https://beemoney.id.vn/login
            <!-- Intro -->
            <p style="font-size: 16px; line-height: 1.6; text-align: center; color: #555; margin-bottom: 20px;">
                Bạn được mời tham gia Quỹ Tiết Kiệm BeeMoney. Mã xác nhận để tham gia:
            </p>
    
            <!-- Confirmation Code -->
            <div style="background-color: #e8f5e9; color: #388E3C; font-size: 24px; font-weight: bold; text-align: center; padding: 15px; margin-bottom: 20px; border: 2px dashed #81C784; border-radius: 6px;">
                ${code}
            </div>
    
            <!-- Expiry Info -->
            <p style="font-size: 14px; color: #888; text-align: center; margin-bottom: 20px;">
                Mã xác nhận sẽ hết hạn sau 1 giờ.
            </p>
               <p style="font-size: 14px; color: #888; text-align: center; margin-bottom: 20px;">
               Hãy nhanh chóng sử dụng mã xác nhận để không bỏ lỡ cơ hội tham gia quỹ tiết kiệm
            </p>
    
            <!-- Footer -->
            <footer style="text-align: center; font-size: 12px; color: #999;">
                <p>BeeMoney - Giải pháp tài chính thông minh.</p>
            </footer>
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
            // Tìm quỹ tiết kiệm theo ID
            const savingsFund = await SavingsFund.findById(fundId);
            if (!savingsFund) {
                return res.status(404).json({ message: 'Quỹ tiết kiệm không tồn tại' });
            }
    
            // Kiểm tra xem số lượng thành viên hiện tại đã đạt giới hạn chưa
            if (savingsFund.members.length >= savingsFund.memberCount) {
                return res.status(401).json({ message: 'Số lượng thành viên đã đạt giới hạn' });
            }
    
            // Kiểm tra xem email đã tham gia quỹ chưa
            const user = await User.findOne({ email }); // Có thể không tìm thấy user
            const isMember = savingsFund.members.some(member => user && member.userId.equals(user._id));
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
