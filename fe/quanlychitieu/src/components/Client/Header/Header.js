import React, { useEffect, useState } from 'react';
import { getUserProfile } from '../../../service/Auth';
import UserAvatar from '../UserAvatar/userAvatar';
import './Header.css';
import { useNavigate } from 'react-router-dom';
const Header = () => {
  const [user, setUser] = useState({
    name: 'Nguyen Van A',
    role: 'user',
    avatar: '/images/default-avatar.jpg'
  });
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUser({
          name: profile.name,
          role: profile.role,
          avatar: profile.avatar || '/images/default-avatar.jpg'
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      clearCookies();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  const clearCookies = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
  };
  return (
    <nav className="navbar navbar-expand-lg shadow-sm">
      <div className="container-fluid">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item text-muted">Trang chủ</li>
          </ol>
        </nav>
        
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="ms-auto d-flex align-items-center p-2">
            {/* Hiển thị avatar và tên người dùng */}
            <UserAvatar user={user} />
                <a className="ms-4 me-2"  onClick={handleLogout}><img src='/images/exit.png' width={'30px'} style={{cursor:'pointer'}}/></a>    
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
