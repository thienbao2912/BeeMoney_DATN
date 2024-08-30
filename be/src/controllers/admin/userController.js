const modelUser = require('../../models/User');
const bcrypt = require('bcryptjs');


exports.add = async (req, res) => {
    const { email, password, name, avatar, role } = req.body;

    try {
        let user = await modelUser.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new modelUser({
            email,
            password: passwordHash,
            name,
            avatar,
            role: role ? role : 'user',
            createdAt: new Date()
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.list = async (req, res) => {
    try {
        const arayUser = await modelUser.find({ status: { $ne: 'Đã xóa' } });
        res.status(200).json({data:arayUser});
    } catch (error) {
        res.status(500).json({ message: "Server errors" });
    }
};

// Xóa cứng danh mục
exports.hardDelete = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedUser = await modelUser.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        res.status(200).json({ message: "người dùng đã được xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};
// Xóa mềm danh mục
exports.softDelete = async (req, res) => {
    try {
        const id = req.params.id;
        const softDeleteUser = await modelUser.findByIdAndUpdate(id, { status: 'Đã xóa' }, { new: true });
        if (!softDeleteUser) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
        res.status(200).json(softDeleteUser);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Lấy danh sách các danh mục đã xóa mềm
exports.deletedList = async (req, res) => {
    try {
        const deleteListUser = await modelUser.find({ status: 'Đã xóa' });
        res.status(200).json(deleteListUser);
    } catch (error) {
        res.status(500).json({ message: "Server errors" });
    }
};
// Khôi phục danh mục đã xóa mềm
exports.restore = async (req, res) => {
    try {
        const id = req.params.id;
        const restoredUser = await modelUser.findByIdAndUpdate(id, { status: 'Hoạt động' }, { new: true });
        if (!restoredUser) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
        res.status(200).json(restoredUser);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};
exports.getOne = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await modelUser.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.update = async (req, res) => {
    const { email, password, name, avatar, role } = req.body;
    const id = req.params.id;

    try {
        let user = await modelUser.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        if (email) user.email = email;
        if (name) user.name = name;
        if (avatar) user.avatar = avatar;
        if (role) user.role = role;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};