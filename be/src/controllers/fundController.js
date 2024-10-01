const { validationResult } = require('express-validator');
const Confirmation = require('../models/confirmation');
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
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
                <h2 style="text-align: center; color: #4CAF50;">Mã xác nhận của bạn</h2>
                <p>Bạn đã được mời tham gia vào quỹ tiết kiệm. Sử dụng mã xác nhận bên dưới để tham gia:</p>
                <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 20px; border-radius: 5px; border: 1px solid #ddd;">
                    <strong style="color: #4CAF50;">${code}</strong>
                </div>
                <p style="margin-top: 20px;">BeeMoney</p>
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
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'Email này không sử dụng BeeMoney' });
            }

            const savingsFund = await SavingsFund.findById(fundId);
            if (!savingsFund) {
                return res.status(404).json({ message: 'Quỹ tiết kiệm không tồn tại' });
            }

            const code = generateConfirmationCode();
            await saveConfirmationCode(fundId, code);

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
