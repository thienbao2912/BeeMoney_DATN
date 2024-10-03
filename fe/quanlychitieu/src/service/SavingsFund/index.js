import request from '../../config/API/api';

const createSavingsFund = async (fundData) => {
    try {
        const response = await request({
            method: 'POST',
            path: '/api/savings-fund/create',
            data: fundData
        });
        // console.log("Full API response:", response);

        if (response && response.newFund) {
            // console.log("Response newFund:", response.newFund);
            return response.newFund;
        } else {
            throw new Error('Unexpected response format: Missing newFund');
        }
    } catch (error) {
        console.error('API error message:', error.response || error.message);
        throw error;
    }
};

const addFriendByEmail = async (email, goalId, contributionAmount) => {
    try {
        const response = await request({
            method: 'POST',
            path: '/api/savings-fund/add-friend-by-email',
            data: { email, goalId, contributionAmount }
        });

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error adding friend by email:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const sendInviteCode = async (email, goalId) => {
    try {
        const response = await request({
            method: 'POST',
            path: '/api/savings-fund/send-invite-code',
            data: { email, goalId }
        });

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error sending invite code:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const acceptInviteByCode = async (code, contributionAmount) => {
    try {
        const response = await request({
            method: 'POST',
            path: '/api/savings-fund/accept-invite',
            data: { code, contributionAmount }
        });

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error accepting invite by code:', error.response ? error.response.data : error.message);
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
const getUserSavingsGoals = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: '/api/savings-fund/user-goals',
            params: { userId }
        });

        console.log('API Response:', response);

        if (response && Array.isArray(response.data)) {
            return response.data;
        } else if (response && Array.isArray(response)) {
            return response;
        } else {
            // console.warn('Unexpected response format:', response);
            return [];
        }
    } catch (error) {
        console.error('Error fetching user savings goals:', error.message || error);
        return [];
    }
};

export { 
    createSavingsFund, 
    addFriendByEmail, 
    sendInviteCode, 
    acceptInviteByCode,
    getCategories,
    getUserSavingsGoals
};