import request from "../../config/API/api";

// Tạo ngân sách mới
const createBudget = async (budgetData) => {
    try {
        const response = await request({
            method: 'POST',
            path: '/api/budgets/budget',
            data: budgetData
        });
        return response;
    } catch (error) {
        console.error('Error creating budget:', error);
        throw error;
    }
};

// Lấy tất cả ngân sách của một người dùng
const getAllBudgets = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/budgets/budgets?userId=${userId}`, // Thêm userId vào query string
        });
        return response; // Giả sử response đã bao gồm dữ liệu cần thiết
    } catch (error) {
        console.error('Error fetching all budgets:', error);
        throw error;
    }
};

// Lấy ngân sách theo ID
const getBudgetById = async (budgetId, userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/budgets/${budgetId}`,
            headers: {
                'Authorization': `Bearer ${userId}` 
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching budget by ID:', error);
        throw error;
    }
};

// Xóa ngân sách theo ID
const deleteBudget = async (budgetId) => {
    try {
        const response = await request({
            method: 'DELETE',
            path: `/api/budgets/${budgetId}`
        });
        return response;
    } catch (error) {
        console.error('Error deleting budget:', error);
        throw error;
    }
};

// Lấy các khoản chi tiêu cho ngân sách cụ thể
const getExpensesForBudget = async (budgetId) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/budgets/${budgetId}/expenses`
        });
        return response;
    } catch (error) {
        console.error('Error fetching expenses for budget:', error.message);
        throw error;
    }
};

// Cập nhật số tiền của ngân sách
// Cập nhật số tiền của ngân sách
const updateBudget = async (budgetId, updateData) => {
    try {
        const response = await request({
            method: 'PATCH',
            path: `/api/budgets/${budgetId}`,
            data: updateData
        });

        // Trả về toàn bộ phản hồi hoặc chỉ dữ liệu nếu có
        return response.data || response;
    } catch (error) {
        console.error('Error updating budget:', error.response ? error.response.data : error.message);
        throw error;
    }
};





// Lấy danh sách các danh mục
const getCategories = async () => {
    try {
        const response = await request({
            method: 'GET',
            path: '/api/v2/categories'
        });
        return response;
    } catch (error) {
        console.error('Error fetching categories:', error.response || error.message);
        throw error;
    }
};

export {
    createBudget,
    getAllBudgets,
    getBudgetById,
    deleteBudget,
    getExpensesForBudget,
    getCategories,
    updateBudget
};
