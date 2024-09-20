const SavingsGoal = require("../models/SavingsGoal")

class SavingsGoalController {

  static async getAll(req, res) {
    try {
        const userId = req.user.id;
        let data = []
        data = await SavingsGoal.find({ userId }).populate({
            path: 'categoryId',
            select: 'image name'
        });

        
        console.log('Savings Goals:', data);

    
        res.status(200).json({
           data
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
}

    
    static async getById(req, res) {
        try {
            let id = req.params.id
            let data = await SavingsGoal.findById(id)
            res.status(200).json({
                data: data
            })
        } catch (error) {
            res.status(500).json({
                message: 'Server error'
            })
        }
    }
    static create(req, res) {
        try {
            let { name, targetAmount, currentAmount, startDate, endDate, categoryId } = req.body;
            let userId = req.user.id;
    
            // Validation: Check if startDate is greater than endDate
            if (new Date(startDate) > new Date(endDate)) {
                return res.status(400).json({
                    message: 'Ngày bắt đầu không thể lớn hơn ngày kết thúc'
                });
            }
    
            if (targetAmount < 10000) {
                return res.status(400).json({
                    message: 'Số tiền mục tiêu ít nhất phải là 10,000đ'
                });
            }
            if (!categoryId) {
                return res.status(400).json({
                    message: 'Chưa chọn danh mục'
                });
            }
            
            let data = {
                userId,
                name,
                targetAmount,
                currentAmount,
                startDate,
                endDate,
                categoryId
            };
    
            // Create the savings goal if validation passes
            SavingsGoal.create(data)
                .then(() => {
                    res.status(200).json({
                        data: 'Thêm dữ liệu thành công'
                    });
                })
                .catch(error => {
                    res.status(400).json({
                        message: error.message || 'Error adding data'
                    });
                });
        } catch (error) {
            res.status(500).json({
                message: 'Server error'
            });
        }
    }
    
// controllers/SavingsGoalController.js
static async edit(req, res) {
    try {
        const _id = req.params.id;
        const userId = req.user.id;
        const { currentAmount } = req.body;

        const checkSavingsGoalUser = await SavingsGoal.findOne({ userId, _id });
        console.log(userId, _id, checkSavingsGoalUser);

        if (checkSavingsGoalUser) {
            // Update only the currentAmount field and preserve the rest
            const updatedGoal = await SavingsGoal.findByIdAndUpdate(
                _id,
                { $set: { currentAmount } },
                { new: true, useFindAndModify: false }
            );

          
            if (updatedGoal) {
                res.status(200).json({
                    message: 'Cập nhật mục tiêu tiết kiệm thành công',
                    data: updatedGoal
                });
            } else {
                res.status(403).json({
                    message: 'Đã xảy ra lỗi'
                });
            }
        } else {
            res.status(403).json({
                message: 'Đã xảy ra lỗi'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Server error'
        });
    }
}
static async updateAllFields(req, res) {
    try {
        const _id = req.params.id;
        const userId = req.user.id;
        const { name, targetAmount, currentAmount, startDate, endDate, categoryId } = req.body;

        const checkSavingsGoalUser = await SavingsGoal.findOne({ userId, _id });

        if (checkSavingsGoalUser) {
            const updatedGoal = await SavingsGoal.findByIdAndUpdate(
                _id,
                { $set: { name, targetAmount, currentAmount, startDate, endDate, categoryId } },
                { new: true, useFindAndModify: false }
            );

            if (updatedGoal) {
                res.status(200).json({
                    message: 'Cập nhật mục tiêu tiết kiệm thành công',
                    data: updatedGoal
                });
            } else {
                res.status(403).json({
                    message: 'Đã xảy ra lỗi'
                });
            }
        } else {
            res.status(403).json({
                message: 'Đã xảy ra lỗi'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Server error'
        });
    }
}


    static async delete(req, res) {
        try {
            let _id = req.params.id
            let userId = req.user.id
            let result = await SavingsGoal.findOneAndDelete({ userId, _id })
            if (result) {
                return res.status(200).json({
                    data: 'Xóa mục tiêu tiết kiệm thành công'
                })
            }
        } catch (error) {
            res.status(500).json({
                message: 'Server error'
            })
        }
    }
    
}

module.exports = SavingsGoalController
