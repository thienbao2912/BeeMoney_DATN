const authService = require('../services/authService');
const loginSuccess = async (req, res) => {
    const { id, tokenLogin } = req.body;
    try {
      if (!id || !tokenLogin) {
        return res.status(400).json({
          err: 1,
          msg: 'Missing inputs'
        });
      }
      
      // Gọi service để xử lý lưu trữ thông tin và trả về token
      let response = await authService.loginSuccessService(id, tokenLogin);
  
      // Xử lý kết quả từ authService
      if (response.err === 1) {
        console.log('User not found or invalid token:', id, tokenLogin); 
      }
  
      // Trả về kết quả
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in loginSuccess controller:', error);
      return res.status(500).json({
        err: -1,
        msg: 'Failed to process login: ' + error.message
      });
    }
  };
  
  module.exports = {
    loginSuccess
  };
