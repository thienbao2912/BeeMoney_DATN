const Notification = require("../models/Notification");
const User = require('../models/User');
const SavingsGoal = require("../models/SavingsGoal");
const Budget = require('../models/Budget');
const cron = require('node-cron');
const SavingsFund = require('../models/SavingsFund');

class NotifiController {

    static async getAll(req, res) {
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
            const { userId, content, customId, categoryId } = req.body; // Thêm categoryId vào

            if (!userId || !content) {
                return res.status(400).json({ message: "Thiếu thông tin người dùng hoặc nội dung thông báo" });
            }

            const newNotification = new Notification({
                userId,
                content,
                customId,
                categoryId, // Lưu categoryId nếu có
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

            res.status(200).json({ message: "Đã xóa thông báo thành công" });
        } catch (error) {
            console.error("Lỗi khi xóa thông báo:", error);
            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    }
};

// Cron job cho thông báo khi mục tiêu tiết kiệm hết hạn
cron.schedule('*/1 * * * *', async () => {
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const expiringGoals = await SavingsGoal.find({ endDate: { $lte: tomorrow, $gte: today } });

        expiringGoals.forEach(async (goal) => {
            const user = await User.findById(goal.userId);

            if (user) {
                const content = `Mục tiêu \"${goal.name}\" của bạn chỉ còn 1 ngày là đến hạn.`;

                const existingNotification = await Notification.findOne({ customId: goal._id });

                if (!existingNotification) {
                    await Notification.create({
                        userId: user._id,
                        content: content,
                        customId: goal._id,
                        categoryId: goal.categoryId // Lấy categoryId từ SavingsGoal
                    });
                }
            }
        });

    } catch (error) {
        console.error("Lỗi khi chạy cron job:", error);
    }
});

// Cron job cho thông báo khi ngân sách hết hạn
// cron.schedule('*/1 * * * *', async () => {
//     try {
//         const today = new Date();
//         const tomorrow = new Date(today);
//         tomorrow.setDate(today.getDate() + 1);

//         const expiringBudgets = await Budget.find({ endDate: { $lte: tomorrow, $gte: today } });
//         expiringBudgets.forEach(async (budget) => {
//             const user = await User.findById(budget.userId);
//             if (user) {
//                 const content = `Ngân sách của bạn cho danh mục chỉ còn 1 ngày là đến hạn.`;
//                 const existingNotification = await Notification.findOne({ customId: budget._id });
//                 if (!existingNotification) {
//                     await Notification.create({
//                         userId: user._id,
//                         content,
//                         customId: budget._id,
                        
//                     });
//                 }
//             }
//         });
//     } catch (error) {
//         console.error("Lỗi khi chạy cron job:", error);
//     }
// });

// Cron job cho thông báo khi ngân sách đến hạn
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
//                 const content = `Ngân sách của bạn cho danh mục đã đến hạn.`;
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
//                         categoryId: budget.categoryId // Lưu categoryId từ Budget
//                     });
//                 }
//             }
//         });
//     } catch (error) {
//         console.error("Lỗi khi chạy cron job:", error);
//     }
// });

// Cron job cho thông báo khi quỹ tiết kiệm hết hạn
cron.schedule('*/1 * * * *', async () => {
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const expiringFunds = await SavingsFund.find({ endDate: { $lte: tomorrow, $gte: today } });

        expiringFunds.forEach(async (fund) => {
            const user = await User.findById(fund.userId);

            if (user) {
                const content = `Quỹ tiết kiệm \"${fund.name}\" của bạn chỉ còn 1 ngày là đến hạn.`;

                const existingNotification = await Notification.findOne({ customId: fund._id });

                if (!existingNotification) {
                    await Notification.create({
                        userId: user._id,
                        content,
                        customId: fund._id,
                        categoryId: fund.categoryId // Lưu categoryId từ SavingsFund nếu có
                    });
                }
            }
        });

    } catch (error) {
        console.error("Lỗi khi chạy cron job SavingsFund sắp hết hạn:", error);
    }
});

// Cron job cho thông báo khi quỹ tiết kiệm đến hạn
cron.schedule('*/1 * * * *', async () => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const dueTodayFunds = await SavingsFund.find({ endDate: { $gte: todayStart, $lte: todayEnd } });

        dueTodayFunds.forEach(async (fund) => {
            const user = await User.findById(fund.userId);

            if (user) {
                const content = `Quỹ tiết kiệm \"${fund.name}\" của bạn đã đến hạn.`;

                const existingNotification = await Notification.findOne({
                    userId: user._id,
                    customId: fund._id,
                    content: content
                });

                if (!existingNotification) {
                    await Notification.create({
                        userId: user._id,
                        content,
                        customId: fund._id,
                        categoryId: fund.categoryId // Lưu categoryId từ SavingsFund nếu có
                    });
                }
            }
        });
    } catch (error) {
        console.error("Lỗi khi chạy cron job SavingsFund đến hạn:", error);
    }
});
cron.schedule('00 16 * * *', async () => { // Chạy vào 4:00 chiều mỗi ngày
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Đầu ngày
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999); // Cuối ngày

        // Lấy tất cả các SavingsFund đang hoạt động
        const activeSavingsFunds = await SavingsFund.find({ isCompleted: false });

        for (const fund of activeSavingsFunds) {
            const user = await User.findById(fund.userId);
            if (user) {
                // Kiểm tra xem có khoản nạp tiền nào trong ngày chưa
                const todaysTransactions = await SavingsFund.find({
                    _id: fund._id,
                    transactions: {
                        $elemMatch: {
                            date: { $gte: todayStart, $lte: todayEnd },
                        },
                    },
                });

                // Nếu không có giao dịch nào trong ngày
                if (todaysTransactions.length === 0) {
                    const content = `Mục tiêu tiết kiệm "${fund.name}" của bạn chưa có khoản nạp tiền nào trong hôm nay. Hãy nạp tiền để đạt mục tiêu nhé!`;

                    // Kiểm tra xem đã tồn tại thông báo tương tự chưa
                    const existingNotification = await Notification.findOne({
                        userId: user._id,
                        customId: fund._id,
                        content: content,
                    });

                    // Nếu chưa có thông báo, tạo mới
                    if (!existingNotification) {
                        await Notification.create({
                            userId: user._id,
                            content,
                            customId: fund._id,
                            categoryId: fund.categoryId, // Lưu categoryId từ SavingsFund nếu có
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error("Lỗi khi chạy cron job nhắc nhở nạp tiền:", error);
    }
});

module.exports = NotifiController;
