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
        user: 'laravelp9@gmail.com',
        pass: 'axiadnjxzrlzthnz'
    },
    tls: {
        rejectUnauthorized: false
    }
    
});

module.exports.lockedAccount = async (email) => {
    try {
        const emailTemplate = await ejs.renderFile(path.join(__dirname, '..', 'views', 'lockedAccount.ejs'));

        const info = await transporter.sendMail({
            from: "BeMoney <bemoney@gmail.com>",
            to: email,
            subject: "Tài khoản của bạn đã bị khóa",
            html: emailTemplate
        });

        return info;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports.inactive = async (email) => {
    try {
        const emailTemplate = await ejs.renderFile(path.join(__dirname, '..', 'views', 'inactive.ejs'));

        const info = await transporter.sendMail({
            from: "BeMoney <bemoney@gmail.com>",
            to: email,
            subject: "Tài khoản của bạn đã bị khóa do liên tục không hoạt động 365 ngày",
            html: emailTemplate
        });

        return info;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
