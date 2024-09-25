import request from '../../config/API/api';

const getAllTransactions = async (type, userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: '/api/transactions',
            params: { type, userId }
        });

        if (response && Array.isArray(response.data)) {
            return response.data;
        } else {
            throw new Error('Unexpected data format');
        }
    } catch (error) {
        console.error('Error fetching transactions:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const addTransaction = async (transaction) => {
    try {
        const { amount, ...rest } = transaction;
        const payload = { ...rest, amount: Number(amount) };
        
        const response = await request({
            method: 'POST',
            path: '/api/transactions',
            data: payload
        });

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error adding transaction:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const deleteTransaction = async (id) => {
    try {
        const response = await request({
            method: 'DELETE',
            path: `/api/transactions/${id}`
        });

        console.log('Delete response:', response);

        if (response && response.message === 'Deleted successfully') {
            return response; 
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const getCategories = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: '/api/v2/categories',
            params: { userId }
        });

        console.log('API Response:', response);
        if (response && Array.isArray(response.data)) {
            return response.data;
        } else {
            throw new Error('Unexpected data format');
        }
    } catch (error) {
        console.error('Error fetching categories:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const updateTransaction = async (id, updatedTransaction) => {
    try {
        const { amount, ...rest } = updatedTransaction;
        const payload = { ...rest, amount: Number(amount) };

        const response = await request({
            method: 'PATCH', 
            path: `/api/transactions/${id}`,
            data: payload
        });

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error updating transaction:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const getTransactionById = async (id) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/transactions/${id}`
        });

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error fetching transaction by ID:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const getExpensesByCategory = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: '/api/transactions',
            params: { type: 'expense', userId }
        });

        if (response && Array.isArray(response.data)) {
            return response.data;
        } else {
            throw new Error('Unexpected data format');
        }
    } catch (error) {
        console.error('Error fetching expenses:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const getIncomeByCategory = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: '/api/transactions',
            params: { type: 'income', userId }
        });

        if (response && Array.isArray(response.data)) {
            return response.data;
        } else {
            throw new Error('Unexpected data format');
        }
    } catch (error) {
        console.error('Error fetching income:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const getExpensesByCategories = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/v2/transactions/expenses?userId=${userId}`
        });
        return response.data; 
    } catch (error) {
        console.error('Error fetching expenses:', error.response || error.message);
        throw error;
    }
};

const getIncomeByCategories = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/v2/transactions/income?userId=${userId}`
        });
        return response.data; 
    } catch (error) {
        console.error('Error fetching income:', error.response || error.message);
        throw error;
    }
};

export { getAllTransactions, addTransaction, deleteTransaction, updateTransaction, getCategories, getTransactionById, getExpensesByCategory, getIncomeByCategory, getExpensesByCategories, getIncomeByCategories };
