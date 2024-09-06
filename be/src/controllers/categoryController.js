const categoryModel = require('../models/Category')
const Transaction = require("../models/Transaction");
class CategoryController {
    static async getAll(req, res) {
        try {
            let userId = req.user.id
            let userRole = req.user.role
            if (userRole === "user") {
                let categories = []
                let adminCategories = []
                const adminCategoriesDb = await categoryModel.find({ status: 'active' }).populate({
                    path: 'userId',
                    select: 'role'
                });
                adminCategoriesDb.forEach(element => {
                    if (element.userId && element.userId.role === "admin") {
                        adminCategories.push(element)
                    }
                });
                let userCategories = await categoryModel.find({ userId }).populate({
                    path: 'userId',
                    select: 'role'
                });
                categories = [...adminCategories, ...userCategories]
                return res.status(200).json({
                    data: categories,
                })
            }
        } catch (error) {
            res.status(500).json({
                message: 'Server error'
            })
        }
    }
    
    static async add(req, res) {
        try {
            let userId = req.user.id
            let { name, image, description, type } = req.body
            let data = { userId, name, image, description, type }
            const savedCategory = await categoryModel.create(data)
            res.status(201).json({ message: "Danh mục đã được tạo thành công", savedCategory });
        } catch (error) {
            res.status(500).json({
                message: 'Server error'
            })
        }
    }
    static async getById(req, res) {
        try {
            let userId = req.user.id
            let id = req.params.id

            let data = await categoryModel.findOne({ userId, _id: id })
            res.status(200).json({ data });
        } catch (error) {
            res.status(500).json({
                message: 'Server error'
            })
        }
    }
    static async edit(req, res) {
        try {
            let userId = req.user.id
            let id = req.params.id
            let data = { userId, ...req.body }
            console.log(data);
            let result = await categoryModel.findOneAndUpdate({ userId, _id: id }, data)
            res.status(200).json({ message: 'Đã sửa thành công', data: result });
        } catch (error) {
            res.status(500).json({
                message: 'Server error'
            })
        }
    }
    static async delete(req, res) {
        try {
            let userId = req.user.id
            let id = req.params.id
            const checkidCategory = await Transaction.findOne({ categoryId: id })
            console.log(checkidCategory);
            if (checkidCategory) {
                return res.status(400).json({ message: "Danh mục đang được sử dụng" });
            }
            let data = await categoryModel.findOneAndDelete({ userId, _id: id })

            res.status(200).json({ message: 'Đã xóa thành công', data });
        } catch (error) {
            res.status(500).json({
                message: 'Server error'
            })
        }

    }
}

module.exports = CategoryController;