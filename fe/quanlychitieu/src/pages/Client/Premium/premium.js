import React from "react";
import "./Premium.css";
import { createPayment } from "../../../service/Premium"; // Import service

const Premium = () => {
  const plans = [
    { 
      title: "Premium", 
      price: "29.000đ /mo", 
      amount: 29000, 
      orderId: "premium_1month", 
      button: "Mua ngay", 
      bankCode: "VISA",
      language: "vn" 
    },
    { 
      title: "Super Premium", 
      price: "139.000đ /6 mo", 
      amount: 139000, 
      orderId: "premium_6month", 
      button: "Mua ngay", 
      bankCode: "VISA", // ACB
      language: "vn" 
    },
  ];

  const handleSubscribe = async (plan) => {
    try {
      const { amount, orderId, bankCode, language } = plan;
      const paymentUrl = await createPayment(amount, orderId, bankCode, language);
      window.location.href = paymentUrl; // Chuyển hướng người dùng đến trang thanh toán VNPay
    } catch (error) {
      console.error("Lỗi khi gọi API tạo thanh toán:", error);
      alert("Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại!");
    }
  };

  return (
    <div className="premium-container">
      <div className="premium-header">
        <img src="/images/piggy-bank.png" alt="BeeMoney Logo" className="premium-logo" />
        <h1 className="premium-title">BeeMoney Premium</h1>
      </div>
      <p className="premium-subtitle">
        BeeMoney Premium - Tận hưởng tính năng nâng cao, quản lý tài chính dễ dàng hơn bao giờ hết.
      </p>

      {/* Phần giới thiệu */}
      <section className="premium-intro">
        <p>
          Trải nghiệm toàn bộ tính năng nâng cao và tiện lợi hơn trong 1 tuần miễn phí
          <br />
          và sau đó chỉ từ 29.000đ hoặc 25.000đ / tháng
        </p>
        <button className="btn-try-free" onClick={() => handleSubscribe({
          amount: 0, 
          orderId: "trial_1week", 
          bankCode: "VCB", 
          language: "vn"
        })}>
          Dùng thử 1 tuần
        </button>
      </section>

      {/* Các thẻ gói premium */}
      <div className="premium-cards">
        {plans.map((plan) => (
          <div key={plan.orderId} className="premium-card">
            <h3>{plan.title}</h3>
            <p className="premium-price">{plan.price}</p>
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
