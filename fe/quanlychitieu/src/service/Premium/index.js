import request from '../../config/API/api'; // Import đúng file request của bạn

export const createPayment = async (amount, orderId, bankCode, language) => {
  try {
    const response = await request({
      method: 'POST',
      path: '/order/create_payment_url',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, orderId, bankCode, language }),
    });

    console.log('Data sent to BE:', { amount, orderId, bankCode, language });

    // Kiểm tra nếu API trả về lỗi
    if (!response || !response.ok) {
      throw new Error(`API trả về lỗi: ${response?.status || 'unknown'}`);
    }

    // Kiểm tra content-type để đảm bảo phản hồi là JSON
    if (response.headers.get('content-type')?.includes('application/json')) {
      return await response.json();
    } else {
      throw new Error('Phản hồi không phải là JSON');
    }
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán:', error.message);
    throw error;
  }
};
