const Confirmation = require('../models/Confirmation');

const saveConfirmationCode = async (goalId, code) => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const confirmation = new Confirmation({
        goalId,
        code,
        expiresAt
    });

    await confirmation.save();
};

module.exports = { saveConfirmationCode };