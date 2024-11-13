import React from 'react';
import { Link } from 'react-router-dom';
import { House, Person, Box, PersonCircle, Globe, BoxArrowRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

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
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
  };

  return (
    <aside className="sidebar border-end" style={{ backgroundColor: '#f8f9fa', minHeight: '115vh', width: '250px' }}>
      <div className="d-flex flex-column align-items-start">
        <button
          className="btn btn-outline-secondary d-xl-none mb-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidebarCollapse"
          aria-expanded="false"
          aria-controls="sidebarCollapse"
        >
          <span>&times;</span>
        </button>

        <div className="pt-3 text-center w-100">
          <Link className="sidebar-title d-flex align-items-center justify-content-center" to="/admin/dashboard" >
            <img
              src="../../../images/piggy-bank.png"
              alt="Admin Logo"
              style={{ width: '40px', height: '40px', marginRight: '10px' }}
            />
            <span className=" fw-bold text-dark">Admin</span>
          </Link>
        </div>
        <div className="collapse d-xl-block w-100" id="sidebarCollapse">
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link className="nav-linkadmin d-flex align-items-center p-2" to="/admin/dashboard">
                <House className="me-3" size={20} />
                <span>Trang chủ</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-linkadmin d-flex align-items-center p-2" to="/admin/users">
                <Person className="me-3" size={20} />
                <span>Quản lý tài khoản</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-linkadmin d-flex align-items-center p-2" to="/admin/categories">
                <Box className="me-3" size={20} />
                <span>Danh mục chi thu</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-linkadmin d-flex align-items-center p-2" to="/admin/profile">
                <PersonCircle className="me-3" size={20} />
                <span>Quản lý hồ sơ</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-linkadmin d-flex align-items-center p-2" to="/">
                <Globe className="me-3" size={20} />
                <span>Website</span>
              </Link>
            </li>
            <li className="nav-item">
              <button className="nav-linkadmin btn btn-link d-flex align-items-center p-2 text-start" onClick={handleLogout}>
                <BoxArrowRight className="me-3" size={20} />
                <span>Đăng xuất</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
