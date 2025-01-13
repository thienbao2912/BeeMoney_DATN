const { createPaymentUrl, verifyVNPayHash } = require('../services/paymentService');

const createPayment = async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        if (!amount || !orderId) {
            return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ!' });
        }

        const paymentUrl = await createPaymentUrl(amount, orderId, req);
        res.redirect(paymentUrl);
        console.log('Received Request:', req.body);

    } catch (error) {
        console.error('Lỗi tạo thanh toán:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống!' });
    }
};

const vnpayReturn = (req, res) => {
    try {
      const vnp_Params = req.query;
      
      // Kiểm tra hash từ VNPay
      const isValid = verifyVNPayHash(vnp_Params);
  
      if (isValid) {
        // Nếu chữ ký hợp lệ, xử lý thông tin trả về từ VNPay
        const responseCode = vnp_Params['vnp_ResponseCode'];
  
        if (responseCode === '00') {
          // Xử lý giao dịch thành công (Có thể kiểm tra thêm dữ liệu trong DB nếu cần)
          return res.json({ success: true, message: 'Giao dịch thành công', code: '00' });
        } else {
          // Xử lý giao dịch thất bại
          return res.json({ success: false, message: 'Giao dịch thất bại', code: responseCode });
        }
      } else {
        // Nếu chữ ký không hợp lệ
        return res.json({ success: false, message: 'Lỗi kiểm tra chữ ký', code: '97' }); // Lỗi kiểm tra chữ ký
      }
    } catch (error) {
      console.error('Error in vnpayReturn:', error.message);
      return res.status(500).json({ success: false, message: 'Lỗi hệ thống!' });
    }
    
};

  
module.exports = { createPayment,vnpayReturn };
