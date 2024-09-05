import request from '../../config/API/api';

const getAllSavingsGoals = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: '/api/savings-goals',
            params: { userId }
        });

        console.log('API Response:', response);

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
      console.log('Payload for addSavingsGoal:', savingsGoal);
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
  
const updateSavingGoalAmount  = async (goalId, updateData) => {
    try {
        const response = await request({
            method: 'PATCH',
            path: `/api/savings-goals/${goalId}`,
            data: updateData
        });

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error updating savings goal:', error.response ? error.response.data : error.message);
        throw error;
    }
};
const updateSavingsGoal = async (goalId, updatedFields) => {
    try {
      console.log('Updating goal with ID:', goalId);
      console.log('Updated fields:', updatedFields);
      
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

        console.log('Delete response:', response);

        // Adjust the response check based on the actual response format
        if (response && response.data === 'Xóa mục tiêu tiết kiệm thành công') {
            return response; 
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        // Improved error handling
        console.error('Error deleting savings goal:', error.response ? error.response.data : error.message);
        throw error; // Re-throw the error for the calling function to handle
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

export { getAllSavingsGoals, getSavingsGoalById, addSavingsGoal, updateSavingGoalAmount, updateSavingsGoal, deleteSavingsGoal, getCategories };
