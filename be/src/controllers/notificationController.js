const Notification = require("../models/Notification");
const User = require('../models/User');
const SavingsGoal = require("../models/SavingsGoal");
const Budget = require('../models/Budget');
const cron = require('node-cron');

class NotifiController {

    static async getAll (req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: "User ID không xác định" });
            }
            
            const notifications = await Notification.find({ userId: id });
            res.status(200).json(notifications);
        } catch (error) {
            console.error("Lỗi khi lấy thông báo:", error);
            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    };

    static async addNotification(req, res) {
        try {
            const { userId, content, customId, categoryId } = req.body; 

            if (!userId || !content) {
                return res.status(400).json({ message: "Thiếu thông tin người dùng hoặc nội dung thông báo" });
            }

            const newNotification = new Notification({
                userId,
                content,
                customId,
                categoryId, 
            });

            await newNotification.save();
            res.status(201).json({ message: "Thông báo đã được thêm thành công", data: newNotification });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    }

    static async deleteNotification(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: "Notification ID không xác định" });
            }
            
            const deleteNotification = await Notification.findByIdAndDelete(id);
            
            if (!deleteNotification) {
                return res.status(404).json({ message: "Không tìm thấy thông báo" });
            }
    
            res.status(200).json({ message: "Đã xóa thông báo thành công"});
        } catch (error) {
            console.error("Lỗi khi xóa thông báo:", error);
            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    }
};

cron.schedule('*/1 * * * *', async () => { 
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const expiringGoals = await SavingsGoal.find({ endDate: { $lte: tomorrow, $gte: today } });

        expiringGoals.forEach(async (goal) => {
            const user = await User.findById(goal.userId);

            if (user) {
                const content = `Mục tiêu "${goal.name}" của bạn chỉ còn 1 ngày là đến hạn.`;

                const existingNotification = await Notification.findOne({ customId: goal._id });

                if (!existingNotification) {
                    await Notification.create({
                        userId: user._id,
                        content: content,
                        customId: goal._id,
                        categoryId: goal.categoryId 
                    });
                }
            }
        });

    } catch (error) {
        console.error("Lỗi khi chạy cron job:", error);
    }
});


// cron.schedule('*/1 * * * *', async () => { 
//     try {
//         const today = new Date();
//         const tomorrow = new Date(today);
//         tomorrow.setDate(today.getDate() + 1);

//         const expiringBudgets = await Budget.find({ endDate: { $lte: tomorrow, $gte: today } }).populate('categoryId');
//         expiringBudgets.forEach(async (budget) => {
//             const user = await User.findById(budget.userId);
//             if (user) {
//                 const content = `Ngân sách của bạn cho danh mục "${budget.categoryId.name}" chỉ còn 1 ngày là đến hạn.`;
//                 const existingNotification = await Notification.findOne({ customId: budget._id });
//                 if (!existingNotification) {
//                     await Notification.create({
//                         userId: user._id,
//                         content,
//                         customId: budget._id,
//                         categoryId: budget.categoryId._id 
//                     });
//                 }
//             }
//         });
//     } catch (error) {
//         console.error("Lỗi khi chạy cron job:", error);
//     }
// });


// cron.schedule('*/1 * * * *', async () => {
//     try {
//         const todayStart = new Date();
//         todayStart.setHours(0, 0, 0, 0); 
//         const todayEnd = new Date();
//         todayEnd.setHours(23, 59, 59, 999); 
        
//         const dueTodayBudgets = await Budget.find({ endDate: { $gte: todayStart, $lte: todayEnd } }).populate('categoryId');
//         dueTodayBudgets.forEach(async (budget) => {
//             const user = await User.findById(budget.userId);
//             if (user) {
//                 const content = `Ngân sách của bạn cho danh mục "${budget.categoryId.name}" đã đến hạn.`;
//                 const existingNotification = await Notification.findOne({
//                     userId: user._id,
//                     customId: budget._id,
//                     content: content
//                 });
//                 if (!existingNotification) {
//                     await Notification.create({
//                         userId: user._id,
//                         content,
//                         customId: budget._id,
//                         categoryId: budget.categoryId._id 
//                     });
//                 }
//             }
//         });
//     } catch (error) {
//         console.error("Lỗi khi chạy cron job:", error);
//     }
// });

module.exports = NotifiController;
