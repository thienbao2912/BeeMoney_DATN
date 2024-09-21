import React, { useState, useEffect } from 'react';
import CookieConsent from 'react-cookie-consent';

const PrivacyPolicy = () => {
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    
    const isCookieAccepted = localStorage.getItem('cookieConsentAccepted');
    
    if (isCookieAccepted === 'true') {
      setShowOverlay(false);
      enableRightClickAndInspect(); 
    } else {
      disableRightClickAndInspect(); 
    }
  }, []);

  const handleAcceptCookies = () => {
    
    localStorage.setItem('cookieConsentAccepted', 'true');
    setShowOverlay(false); 
    enableRightClickAndInspect(); 
  };

  const disableRightClickAndInspect = () => {
    const disableInspect = (e) => {
      if (e.type === 'contextmenu') {
        e.preventDefault();
      }

      if (
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || 
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', disableInspect);
    document.addEventListener('keydown', disableInspect);
  };

  const enableRightClickAndInspect = () => {
    const enableInspect = (e) => {
      document.removeEventListener('contextmenu', e.preventDefault);
      document.removeEventListener('keydown', e.preventDefault);
    };

    document.removeEventListener('contextmenu', enableInspect);
    document.removeEventListener('keydown', enableInspect);
  };

  return (
    <div>
      {showOverlay && (
        <div style={overlayStyle}>
          <CookieConsent
            location="bottom"
            buttonText="Accept"
            cookieName="cookieConsentAccepted"
            style={{ background: "#2B373B" }}
            buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
            onAccept={handleAcceptCookies}
          >
            Trang web sử dụng cookie để cải thiện trải nghiệm người dùng. Để sử dụng trang web của chúng tôi, bạn phải đồng ý với tất cả các <a href="/privacy-policy" style={linkStyle}> Điều khoản</a> sử dụng theo Chính sách quyền riêng tư của chúng tôi.
          </CookieConsent>
        </div>
      )}
    </div>
  );
};

// CSS cho lớp phủ
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  zIndex: 9999,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
};
const linkStyle = {
  textDecoration: 'none',  // Xóa gạch chân
  fontWeight: 'bold',      // Làm in đậm
  color: 'white',          // Đổi màu chữ (tuỳ chọn)
};

export default PrivacyPolicy;
