// src/components/Client/Header/Header.js

import React, { useEffect } from 'react';
import NotificationList from '../Notification/notificationList'; // Đảm bảo đường dẫn đúng
import { useNotifications } from './NotificationContext'; // Đảm bảo đường dẫn đúng
import './Header.css';

const Header = () => {
    const { notifications, checkBudgetExceed, checkSavingGoals } = useNotifications(); // Sử dụng các hàm kiểm tra
    const notificationCount = (notifications && notifications.length) ? notifications.length : 0;

    // Kiểm tra ngân sách và mục tiêu khi header được render
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            checkBudgetExceed(userId); // Kiểm tra ngân sách để thêm thông báo nếu vượt
            checkSavingGoals(userId); // Kiểm tra mục tiêu để thêm thông báo nếu còn 1 ngày
        }
    }, []); // Không theo dõi bất kỳ trạng thái nào, chỉ gọi một lần khi component mount
    

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
                        <ul className="navbar-nav">
                            <li className="nav-item dropdown notification_dropdown">
                                <button className="btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M17.5 12H19C19.8284 12 20.5 12.6716 20.5 13.5C20.5 14.3284 19.8284 15 19 15H6C5.17157 15 4.5 14.3284 4.5 13.5C4.5 12.6716 5.17157 12 6 12H7.5L8.05827 6.97553C8.30975 4.71226 10.2228 3 12.5 3C14.7772 3 16.6903 4.71226 16.9417 6.97553L17.5 12Z" fill="#222B40" />
                                        <path opacity="0.3" d="M14.5 18C14.5 16.8954 13.6046 16 12.5 16C11.3954 16 10.5 16.8954 10.5 18C10.5 19.1046 11.3954 20 12.5 20C13.6046 20 14.5 19.1046 14.5 18Z" fill="#222B40" />
                                    </svg>
                                    {notificationCount > 0 && (
                                        <span className="badge light text-white bg-primary rounded-circle">
                                            {notificationCount}
                                        </span>
                                    )}
                                </button>
                                <div className="dropdown-menu dropdown-menu-end" style={{ marginRight: "20px", marginTop: "5px" }}>
                                    <NotificationList />
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
