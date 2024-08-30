const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const ejs = require('ejs');
const path = require('path');
dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Gửi email khôi phục mật khẩu
module.exports.sendPasswordResetEmail = async (email, token) => {
    try {
        const resetUrl = `${process.env.URL_FE}/reset-password?token=${token}`;
        const emailTemplate = await ejs.renderFile(path.join(__dirname, '..', 'views', 'resetPasswordEmail.ejs'), { resetUrl });

        const info = await transporter.sendMail({
            from: "Be Money <noreply@gmail.com",
            to: email,
            subject: "Reset Password",
            html: emailTemplate
        });
        
        return info;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Gửi email xác nhận
module.exports.sendVerificationEmail = async (email, token) => {
    try {
        const verifyUrl = `${process.env.URL_FE}/verify-email?token=${token}`;
        const emailTemplate = await ejs.renderFile(path.join(__dirname, '..', 'views', 'verifyEmail.ejs'), { token, verifyUrl });

        const info = await transporter.sendMail({
            from: "Be Money <haudppc07506@fpt.edu.vn>",
            to: email,
            subject: "Verify Email",
            html: emailTemplate
        });
        
        return info;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
module.exports.sendRandomPasswordEmail = async (email, randomPassword) => {
    try {
        const resetUrl = `${process.env.APP_URL}/reset-password?password=${randomPassword}`;
        const emailTemplate = await ejs.renderFile(path.join(__dirname, '..', 'views', 'randomPasswordEmail.ejs'), { randomPassword, resetUrl });

        const info = await transporter.sendMail({
            from: "Be Money <noreply@gmail.com>",
            to: email,
            subject: "Your Temporary Password",
            html: emailTemplate
        });

        return info;
    } catch (error) {
        console.error(error);
        throw error;
    }
};