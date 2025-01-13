import request from '../../config/API/api'; // Import đúng file request của bạn

export const createPayment = async (amount, orderId, bankCode, language) => {
  if (!amount || isNaN(amount)) {
    throw new Error('Số tiền không hợp lệ!');
  }
  try {
    const response = await request({
      method: 'POST',
      path: '/order/create_payment_url',
      headers: {
        'Content-Type': 'application/json', // Đảm bảo header chính xác
      },
      body:  JSON.stringify({ amount, orderId, bankCode, language }), 
     
    });
    console.log('Data sent to BE:', { amount, orderId, bankCode, language });

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán:', error.message);
    throw error;
  }
};

