import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Offcanvas, Button } from 'react-bootstrap';
import { getUserProfile } from '../../../service/Auth';
import 'bootstrap-icons/font/bootstrap-icons.min.css'; // Kiểm tra đường dẫn đúng
import './Sidebar.css';

const Sidebar = () => {
  const [user, setUser] = useState({
    name: 'Nguyen Van A',
    role: 'user',
    avatar: '/images/default-avatar.jpg'
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
    <>
      <Button
        className="d-md-none btn-hamburger"
        variant="primary"
        onClick={() => setShow(true)}
      >
        <i className="bi bi-list"></i> {/* Bootstrap icon for hamburger menu */}
      </Button>
      <div className="sidebar-client">
        <div className="sidebar-head d-flex align-items-center">
          <img width="50" className="rounded-circle" src="logo512.png" ></img>
          <div>
            <div className="logo-sidebar"><strong>BeeMoney</strong> </div>
          </div>
          {/* <img src={user.avatar} alt="Avatar" width="40" className="rounded-circle" />
          <div>
            <div className="greeting">Xin chào, {user.name}</div>
          </div> */}

        </div>
        <nav className="sidebar-nav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" href="/">Trang chủ</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/expense/add">Giao dịch</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/categories">Danh mục</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/budget">Ngân sách</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/saving-goal/list">Mục tiêu tiết kiệm</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/profile">Hồ Sơ Người Dùng</a>
            </li>
            {user.role === 'admin' && (
              <li className="nav-item">
                <a className="nav-link" href="/admin">Trang chủ quản trị</a>
              </li>
            )}
            <li className="nav-item">
              <button className="nav-link" onClick={handleLogout}>Đăng xuất</button>
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
                <a className="nav-link" href="/">Trang chủ</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/expense/add">Giao dịch</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/categories">Danh mục</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/budget">Ngân sách</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/saving-goal/list">Mục tiêu tiết kiệm</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/profile">Hồ Sơ Người Dùng</a>
              </li>
              {user.role === 'admin' && (
                <li className="nav-item">
                  <a className="nav-link" href="/admin">Trang chủ quản trị</a>
                </li>
              )}
              
            </ul>
          </nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;
