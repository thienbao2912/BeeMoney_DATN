import request from '../../config/API/api';

const getAllSavingsGoals = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: '/api/savings-goals',
            params: { userId }
        });

        if (response  && Array.isArray(response.data)) {
            return response.data; 
        } else {
            throw new Error('Unexpected data format');
        }
    } catch (error) {
        console.error('Error fetching savings goals:', error.response ? error.response.data : error.message);
        throw error; 
    }
};

const getSavingsGoalById = async (id) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/savings-goals/${id}`
        });

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error fetching savings goal by ID:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const addSavingsGoal = async (savingsGoal) => {
    try {
      const response = await request({
        method: 'POST',
        path: '/api/savings-goals',
        data: savingsGoal
      });
  
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('Unexpected response format');
      } 
    } catch (error) {
      console.error('Error adding savings goal:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  const addTransaction = async (goalId, data) => {
    try {
        const response = await request({
            method: 'POST',
            path: `/api/savings-goals/${goalId}`,
            data: data,
        });

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error("Unexpected response format"); // Chỉ xảy ra nếu phản hồi không hợp lệ
        }
    } catch (error) {
        // Log để kiểm tra
        console.error("Request Error:", error);

        // Ensure that the error message from backend is shown in the toast
        if (error.response?.status === 400) {
            throw {
                status: 400,
                message: error.response?.data?.message || 'Số dư không đủ', // Default message if none from the backend
            };
        }
        // Re-throw the error for other cases
        throw error;
    }
};


const updateSavingsGoal = async (goalId, updatedFields) => {
    try {
      const response = await request({
        method: 'PATCH',
        path: `/api/savings-goals/allFields/${goalId}`,
        data: updatedFields
      });
  
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error updating all fields in savings goal:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  
const deleteSavingsGoal = async (id) => {
    try {
        const response = await request({
            method: 'DELETE',
            path: `/api/savings-goals/${id}`
        });

        if (response && response.data === 'Xóa mục tiêu tiết kiệm thành công') {
            return response; 
        } 
    } catch (error) {
        console.error('Error deleting savings goal:', error.response ? error.response.data : error.message);
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

export { getAllSavingsGoals, getSavingsGoalById, addSavingsGoal, addTransaction, updateSavingsGoal, deleteSavingsGoal, getCategories };
