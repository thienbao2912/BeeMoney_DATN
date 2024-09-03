import request from "../../config/API/api";

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

// Get all budgets for a user
const getAllBudgets = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/budgets/budgets?userId=${userId}`, // Thay đổi để thêm userId vào query string
        });
        return response; // Giả sử response đã bao gồm dữ liệu cần thiết
    } catch (error) {
        console.error('Error fetching all budgets:', error);
        throw error;
    }
};
// Get a budget by ID
const getBudgetById = async (budgetId, userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/budgets/${budgetId}`,
            headers: {
                'Authorization': `Bearer ${userId}` // Nếu cần thiết
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching budget by ID:', error);
        throw error;
    }
};

// Delete a budget by ID
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

// Get expenses for a specific budget
const getExpensesForBudget = async (budgetId) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/budgets/${budgetId}/expenses`
        });
        
        // Kiểm tra phản hồi
        console.log('Expenses response:', response);

        return response;
    } catch (error) {
        console.error('Error fetching expenses for budget:', error.message);
        throw error;
    }
};


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
    getCategories
};