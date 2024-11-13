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

const getAllBudgets = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/budgets/budgets?userId=${userId}`, 
        });
        return response; 
    } catch (error) {
        console.error('Error fetching all budgets:', error);
        throw error;
    }
};

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

const updateBudget = async (budgetId, updateData) => {
    try {
        const response = await request({
            method: 'PATCH',
            path: `/api/budgets/${budgetId}`,
            data: updateData
        });

        return response.data || response;
    } catch (error) {
        console.error('Error updating budget:', error.response ? error.response.data : error.message);
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
    getCategories,
    updateBudget
};
