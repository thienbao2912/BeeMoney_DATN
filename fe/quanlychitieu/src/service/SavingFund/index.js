import request from '../../config/API/api';

const getAllSavingsFunds = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: '/api/savings-funds',
            params: { userId }
        });

        console.log('API Response:', response);

        if (response && Array.isArray(response.data)) {
            return response.data; 
        } else {
            throw new Error('Unexpected data format');
        }
    } catch (error) {
        console.error('Error fetching savings funds:', error.response ? error.response.data : error.message);
        throw error; 
    }
};

const getSavingsFundById = async (id) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/savings-funds/${id}`
        });

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error fetching savings fund by ID:', error.response ? error.response.data : error.message);
        throw error;
    }
};
const addSavingsFund = async (savingsFund) => {
    try {
      console.log('Payload for addSavingsFund:', savingsFund);

      // Cấu hình request
      const response = await request({
        method: 'POST',
        path: '/api/savings-funds', // Đảm bảo đường dẫn chính xác
        data: savingsFund,
        headers: {
          'Content-Type': 'application/json',
          // Thêm header token nếu cần thiết
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
  
      console.log('Response from addSavingsFund:', response);

      // Kiểm tra phản hồi từ API
      if (response && response.data) { // Thay đổi nếu cần theo định dạng phản hồi
        return response.data;
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      // Xử lý lỗi từ API
      console.error('Error adding savings fund:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

  
const updateSavingFundAmount = async (fundId, updateData) => {
    try {
        const response = await request({
            method: 'PATCH',
            path: `/api/savings-funds/contribute/${fundId}`,
            data: updateData
        });
        console.log("Data nạp tiền", updateData);

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error updating savings fund:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const updateSavingsFund = async (fundId, updatedFields) => {
    try {
      console.log('Updating fund with ID:', fundId);
      console.log('Updated fields:', updatedFields);
      
      const response = await request({
        method: 'PATCH',
        path: `/api/savings-funds/allFields/${fundId}`,
        data: updatedFields
      });
  
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error updating all fields in savings fund:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  
const deleteSavingsFund = async (id) => {
    try {
        const response = await request({
            method: 'DELETE',
            path: `/api/savings-funds/${id}`
        });

        console.log('Delete response:', response);

        if (response && response.data === 'Xóa quỹ tiết kiệm thành công') {
            return response; 
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error deleting savings fund:', error.response ? error.response.data : error.message);
        throw error;
    }
};



// service/SavingFund.js
 const getCategoryById = async (categoryId) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching category:', error);
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

const getUserProfile = async () => {
  try {
      const userId = localStorage.getItem('userId'); // Lấy userId từ localStorage
      const res = await request({
          method: "GET",
          path: `/api/auth/get-profile/${userId}`
      });
      return res;
  } catch (error) {
      console.error('Get profile error:', error.response || error.message);
      throw error;
  }
};
const getAllUsers = async () => {
  try {
      const res = await request({
          method: "GET",
          path: "/api/auth/list"
      });
      return res;
  } catch (error) {
      console.error('Get all users error:', error.response || error.message);
      throw error;
  }
};
const getFundMembers = async (id) => {
    try {
        // Gửi yêu cầu API
        const response = await request({
            method: "GET",
            path: `/api/savings-funds/${id}/members`
        });

        // Kiểm tra cấu trúc của phản hồi
        console.log('API Response:', response);

        // Kiểm tra xem phản hồi có phải là mảng không
        if (Array.isArray(response)) {
            console.log('Members Data:', response);
            return response; // Trả về dữ liệu nếu đúng cấu trúc
        } else {
            console.error('Response is not an array:', response);
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error fetching members:', error);
        throw error;
    }

}




const getFundTransactions = async (id) => {
    try {
        // Gửi yêu cầu API để lấy thông tin giao dịch
        const response = await request({
            method: "GET",
            path: `/api/savings-funds/${id}/transactions`
        });

        // Kiểm tra cấu trúc của phản hồi
        console.log('API Response:', response);

        // Kiểm tra xem phản hồi có phải là mảng không
        if (Array.isArray(response)) {
            console.log('Transactions Data:', response);
            return response; // Trả về dữ liệu nếu đúng cấu trúc
        } else {
            console.error('Response is not an array:', response);
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};







export { getAllSavingsFunds, getSavingsFundById, addSavingsFund, updateSavingFundAmount, updateSavingsFund, deleteSavingsFund, getCategories, getCategoryById, getUserProfile, getAllUsers, getFundMembers, getFundTransactions };
