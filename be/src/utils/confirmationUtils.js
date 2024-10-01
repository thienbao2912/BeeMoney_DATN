const Confirmation = require('../models/confirmation');

const saveConfirmationCode = async (fundId, code) => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Mã xác nhận có hiệu lực trong 1 giờ

    const confirmation = new Confirmation({
        fundId,
        code,
        expiresAt
    });

    await confirmation.save();
};

module.exports = { saveConfirmationCode };
