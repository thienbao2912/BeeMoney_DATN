import React, { useState } from 'react';

const AdBanner = ({ imageSrc, altText, link }) => {
  const [isVisible, setIsVisible] = useState(true); // Trạng thái hiển thị banner

  // Hàm xử lý ẩn banner
  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null; // Không hiển thị nếu banner bị ẩn

  return (
    <div
      className="ad-banner"
      style={{
        backgroundColor: '#fff',
        position: 'fixed',
        bottom: '0px', 
        left: '50%', // Đặt giữa ngang
        transform: 'translateX(-50%)', // Căn giữa ngang
        padding: '10px',
        border: '1px solid #e0e0e0',
        display: 'flex',
        width: '30%', // Banner chiếm 30% chiều rộng màn hình
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', // Hiệu ứng nổi nhẹ
      }}
    >
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
      >
        <img
          src={imageSrc}
          alt={altText}
          style={{
            maxWidth: '728px',
            height: '60px',
            objectFit: 'contain',
          }}
        />
      </a>
      <button
        onClick={handleClose}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '18px',
          color: '#888',
          position: 'absolute',
          right: '20px',
          cursor: 'pointer',
        }}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default AdBanner;
