import React from "react";
import "./Premium.css";
import moment from 'moment';

const Premium = () => {
  // Tính toán ngày hết hạn cho mỗi gói
  const getExpiryDate = (months) => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + months);
    return moment(currentDate).toISOString();  // Trả về định dạng ISO 8601
  };

  const plans = [
    {
      title: "Premium",
      price: "29.000đ /mo",
      amount: 29000,
      orderId: "premium_1month",
      button: "Mua ngay",
      bankCode: "NCB",
      language: "vn",
      premiumExpiry: getExpiryDate(1), // Hết hạn sau 1 tháng
    },
    {
      title: "Super Premium",
      price: "139.000đ /6 mo",
      amount: 139000,
      orderId: "premium_6month",
      button: "Mua ngay",
      bankCode: "NCB", // ACB
      language: "vn",
      premiumExpiry: getExpiryDate(6), // Hết hạn sau 6 tháng
    },
  ];

  const handleSubscribe = async (plan) => {
    try {
      const userId = localStorage.getItem('userId'); 
      const { amount, orderId, bankCode, language, premiumExpiry } = plan;
      console.log("Dữ liệu gửi đi:", { amount, orderId, bankCode, language, premiumExpiry });
  
      // Dữ liệu cần gửi dưới dạng JSON
      const requestBody = {
        amount,
        orderId,
        bankCode,
        language,
        userId,
        premiumExpiry, // Thêm trường premiumExpiry vào dữ liệu gửi
      };
  
      console.log("Request body:", requestBody);  // Kiểm tra dữ liệu gửi đi
  
      // Gửi yêu cầu tạo thanh toán qua API tại localhost:4000
      const response = await fetch("http://localhost:4000/proxy/paymentvnp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify(requestBody), // Chuyển dữ liệu thành JSON
      });
  
      if (!response.ok) {
        throw new Error("Lỗi khi tạo thanh toán");
      }
  
      // Nhận URL thanh toán từ phản hồi API
      const data = await response.json();
      const paymentUrl = data.paymentUrl;
  
      console.log(data.paymentUrl);
      // Chuyển hướng người dùng đến trang thanh toán VNPay
      window.location.href = paymentUrl;
  
    } catch (error) {
      console.error("Lỗi khi gọi API tạo thanh toán:", error);
      alert("Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại!");
    }
  };
  

  return (
    <div className="premium-container">
      <div className="premium-header">
        <img
          src="/images/piggy-bank.png"
          alt="BeeMoney Logo"
          className="premium-logo"
        />
        <h1 className="premium-title">BeeMoney Premium</h1>
      </div>
      <p className="premium-subtitle">
        BeeMoney Premium - Tận hưởng tính năng nâng cao, quản lý tài chính dễ
        dàng hơn bao giờ hết.
      </p>

      {/* Phần giới thiệu */}
      <section className="premium-intro">
        <p>
          Trải nghiệm toàn bộ tính năng nâng cao và tiện lợi hơn trong 1 tuần
          miễn phí
          <br />
          và sau đó chỉ từ 29.000đ hoặc 25.000đ / tháng
        </p>
        <button
          className="btn-try-free"
          onClick={() =>
            handleSubscribe({
              amount: 0,
              orderId: "trial_1week",
              bankCode: "VCB",
              language: "vn",
            })
          }
        >
          Dùng thử 1 tuần
        </button>
      </section>

      {/* Các thẻ gói premium */}
      <div className="premium-cards">
        {plans.map((plan) => (
          <div key={plan.orderId} className="premium-card">
            <h3>{plan.title}</h3>
            <p className="premium-price">{plan.price}</p>
            <p className="premium-expiry">Hết hạn: {moment(plan.premiumExpiry).format("DD/MM/YYYY")}</p> {/* Hiển thị ngày hết hạn */}
            <ul>
              <li>Tính năng cao cấp 1</li>
              <li>Tính năng cao cấp 2</li>
              <li>Tính năng cao cấp 3</li>
            </ul>
            <button
              className="btn-active"
              onClick={() => handleSubscribe(plan)}
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Premium;
