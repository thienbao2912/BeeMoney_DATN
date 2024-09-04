// isAdmin.js
const jwt = require('jsonwebtoken');
const modelUser = require('../models/User');

module.exports = async function (req, res, next) {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_ACCESS_KEY);
        const user = await modelUser.findOne({ _id: decoded.id });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
        }
        next();
    } catch (err) {
        console.error('Middleware isAdmin error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
