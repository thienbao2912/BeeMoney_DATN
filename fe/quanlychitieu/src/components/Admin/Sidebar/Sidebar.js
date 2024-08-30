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
    <aside className="sidebar border-end" >
      <div className="d-flex flex-column align-items-start p-3">
        <button
          className="btn btn-secondary d-xl-none mb-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidebarCollapse"
          aria-expanded="false"
          aria-controls="sidebarCollapse"
        >
          <span>&times;</span>
        </button>
        <Link className="sidebar-title" to="/admin/dashboard">
          <img
            src="../../../images/piggy-bank.png"
            alt=""
            style={{ width: '30px', height: '30px', marginRight: '10px' }}
          />
          Admin
        </Link>
        <hr />
        <div className="collapse d-xl-block" id="sidebarCollapse">
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/dashboard">
                <House className="me-2" />
                <span>Trang chủ</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/users">
                <Person className="me-2" />
                <span>Quản lý tài khoản</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/categories">
                <Box className="me-2" />
                <span>Danh mục chi thu</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/profile">
                <PersonCircle className="me-2" />
                <span>Quản lý hồ sơ</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <Globe className="me-2" />
                <span>Website</span>
              </Link>
            </li>
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={handleLogout}>
                <BoxArrowRight className="me-2" />
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
