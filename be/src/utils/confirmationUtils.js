const Confirmation = require('../models/Confirmation');

const saveConfirmationCode = async (fundId, code) => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const confirmation = new Confirmation({
        fundId,
        code,
        expiresAt
    });

    await confirmation.save();
};

module.exports = { saveConfirmationCode };
