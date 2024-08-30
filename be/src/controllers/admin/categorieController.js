const modelCategorie = require("../../models/Categorie");
const Transaction = require("../../models/Transaction");

exports.list = async (req, res) => {
    try {
        let userRole = req.user.role;

        if (userRole === "admin") {
            // Query to find categories excluding those with soft-delete and where userId.role is "user"
            const categories = await modelCategorie.find({ status: { $ne: 'disable' } })
                .populate({
                    path: 'userId',
                    select: 'role'
                });

            // Filter out categories where userId.role is "user"
            const adminCategories = categories.filter(category => category.userId && category.userId.role !== 'user');

            // Count types
            const typeCount = adminCategories.reduce((acc, category) => {
                acc[category.type] = acc[category.type] ? acc[category.type] + 1 : 1;
                return acc;
            }, {});

            return res.status(200).json({
                data: adminCategories,
                typeCount: typeCount // Add type count info to response
            });
        } else {
            return res.status(403).json({
                message: 'Access denied: Only admins can view the category list'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Server error'
        });
    }
};

// Add a new category
exports.add = async (req, res) => {
    try {
        let userRole = req.user.role;

        // Only allow admin to add category
        if (userRole === "admin") {
            const { name, image, description, type } = req.body;

            // Check required fields
            if (!name || !type || !req.user.id) {
                return res.status(400).json({ message: 'Name, type, and user are required' });
            }

            let data = { userId: req.user.id, name, image, description, type, createdAt: new Date() };

            // Create and save a new category in the database
            const savedCategory = await modelCategorie.create(data);

            // Return success response
            res.status(201).json({ message: "Category created successfully", savedCategory });
        } else {
            res.status(403).json({ message: "Access denied: Only admins can add categories" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Soft delete category
exports.softDelete = async (req, res) => {
    try {
        let userRole = req.user.role;

        // Only allow admin to delete category
        if (userRole === "admin") {
            const id = req.params.id;

            // Update category status to "disabled"
            const softDeletedCategory = await modelCategorie.findByIdAndUpdate(id, { status: 'disable' }, { new: true });

            if (!softDeletedCategory) {
                return res.status(404).json({ message: "Category not found" });
            }

            // Return success response
            res.status(200).json({ message: 'Successfully deleted', data: softDeletedCategory });
        } else {
            res.status(403).json({ message: "Access denied: Only admins can delete categories" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Restore soft-deleted category
exports.restore = async (req, res) => {
    try {
        let userRole = req.user.role;

        // Only allow admin to restore category
        if (userRole === "admin") {
            const id = req.params.id;

            // Update category status to 'active'
            const restoredCategory = await modelCategorie.findByIdAndUpdate(id, { status: 'active' }, { new: true });

            if (!restoredCategory) {
                return res.status(404).json({ message: "Category not found" });
            }

            // Return success response
            res.status(200).json({ message: "Category restored successfully", data: restoredCategory });
        } else {
            res.status(403).json({ message: "Access denied: Only admins can restore categories" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get list of soft-deleted categories
exports.deletedList = async (req, res) => {
    try {
        let userRole = req.user.role;

        // Only allow admin to view soft-deleted categories
        if (userRole === "admin") {
            const deleteListCategory = await modelCategorie.find({ status: 'disable' });

            res.status(200).json({ data: deleteListCategory });
        } else {
            res.status(403).json({ message: "Access denied: Only admins can view the deleted category list" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Hard delete category
exports.hardDelete = async (req, res) => {
    try {
        let userRole = req.user.role;

        // Only allow admin to hard delete category
        if (userRole === "admin") {
            const id = req.params.id;
            const checkidCategory = await Transaction.findOne({ categoryId: id })
            console.log(checkidCategory);
            if (checkidCategory) {
                return res.status(400).json({ message: "Danh mục đã được sử dụng!" });
            }

            // Hard delete category
            const hardDeleteCategory = await modelCategorie.findByIdAndDelete(id);

            if (!hardDeleteCategory) {
                return res.status(404).json({ message: "Category not found" });
            }

            // Return success response
            res.status(200).json({ message: "Category deleted successfully" });
        } else {
            res.status(403).json({ message: "Access denied: Only admins can hard delete categories" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get details of a category (for admin)
exports.getOne = async (req, res) => {
    try {
        let userRole = req.user.role;
        const id = req.params.id;

        // Only allow admin to get category details
        if (userRole === "admin") {
            const getOneCategory = await modelCategorie.findById(id);

            if (!getOneCategory) {
                return res.status(404).json({ message: "Category not found" });
            }

            res.status(200).json(getOneCategory);
        } else {
            res.status(403).json({ message: "Access denied: Only admins can view category details" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update a category (for admin)
exports.update = async (req, res) => {
    try {
        let userRole = req.user.role;
        const id = req.params.id;
        const { type, image, name, description, createdAt } = req.body;

        // Only allow admin to update category
        if (userRole === "admin") {
            const updateCategory = await modelCategorie.findByIdAndUpdate(id, {
                type,
                image,
                name,
                description,
                createdAt: createdAt || new Date()
            }, { new: true });

            if (!updateCategory) {
                return res.status(404).json({ message: "Category not found" });
            }

            res.status(200).json(updateCategory);
        } else {
            res.status(403).json({ message: "Access denied: Only admins can update categories" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
