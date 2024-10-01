import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Offcanvas, Button } from 'react-bootstrap';
import { getUserProfile } from '../../../service/Auth';
import 'bootstrap-icons/font/bootstrap-icons.min.css'; // Import Bootstrap icons
import './Sidebar.css';

const Sidebar = () => {
  const [user, setUser] = useState({
    name: 'Nguyen Van A',
    role: 'user',
    avatar: '/images/default-avatar.jpg',
  });
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUser({
          name: profile.name,
          role: profile.role,
          avatar: profile.avatar || '/images/default-avatar.jpg',
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
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
    <>
      <Button
        className="d-md-none btn-hamburger"
        variant="primary"
        onClick={() => setShow(true)}
      >
        <i className="bi bi-list"></i>
      </Button>
      <div className="sidebar-client">
        <div className="sidebar-head d-flex align-items-center justify-content-between">
          <img src={user.avatar} alt="Avatar" width="40" className="rounded-circle" />
          <div>
            <div className="greeting">Xin chào, {user.name}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                <i className="bi bi-house-door"></i> Trang chủ
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/expense/add">
                <i className="bi bi-wallet2"></i> Giao dịch
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/categories">
                <i className="bi bi-tags"></i> Danh mục
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/budget">
                <i className="bi bi-coin"></i> Ngân sách
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/saving-goal/list">
                <i className="bi bi-piggy-bank"></i> Mục tiêu tiết kiệm
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/profile">
                <i className="bi bi-person-circle"></i> Hồ sơ
              </NavLink>
            </li>
            {user.role === 'admin' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  <i className="bi bi-speedometer2"></i> Quản trị
                </NavLink>
              </li>
            )}
            <li className="nav-item">
              <button className="nav-link" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Đăng xuất
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <Offcanvas show={show} onHide={() => setShow(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="sidebar-head d-flex align-items-center justify-content-between">
            <img src={user.avatar} alt="Avatar" width="40" className="rounded-circle" />
            <div>
              <div className="greeting">Xin chào, {user.name}</div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  <i className="bi bi-house-door"></i> Trang chủ
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/expense/add">
                  <i className="bi bi-wallet2"></i> Giao dịch
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/categories">
                  <i className="bi bi-tags"></i> Danh mục
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/budget">
                  <i className="bi bi-coin"></i> Ngân sách
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/saving-goal/list">
                  <i className="bi bi-piggy-bank"></i> Mục tiêu tiết kiệm
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/profile">
                  <i className="bi bi-person-circle"></i> Hồ sơ
                </NavLink>
              </li>
              {user.role === 'admin' && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin">
                    <i className="bi bi-speedometer2"></i> Quản trị
                  </NavLink>
                </li>
              )}
              <li className="nav-item">
                <button className="nav-link" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i> Đăng xuất
                </button>
              </li>
            </ul>
          </nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;
