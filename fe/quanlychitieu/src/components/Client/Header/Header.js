import React from 'react';
import { useNotifications } from './NotificationContext'; // Import Context hook
import "./Header.css";

const Header = () => {
    const { notifications } = useNotifications();
    
    // Determine the number of notifications to display
    const notificationCount = notifications.length;

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
                                <a className="" href="#" role="button" data-bs-toggle="dropdown">
                                    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M17.5 12H19C19.8284 12 20.5 12.6716 20.5 13.5C20.5 14.3284 19.8284 15 19 15H6C5.17157 15 4.5 14.3284 4.5 13.5C4.5 12.6716 5.17157 12 6 12H7.5L8.05827 6.97553C8.30975 4.71226 10.2228 3 12.5 3C14.7772 3 16.6903 4.71226 16.9417 6.97553L17.5 12Z" fill="#222B40" />
                                        <path opacity="0.3" d="M14.5 18C14.5 16.8954 13.6046 16 12.5 16C11.3954 16 10.5 16.8954 10.5 18C10.5 19.1046 11.3954 20 12.5 20C13.6046 20 14.5 19.1046 14.5 18Z" fill="#222B40" />
                                    </svg>
                                    {/* Only show the badge if there are notifications */}
                                    {notificationCount > 0 && (
                                        <span className="badge light text-white bg-primary rounded-circle">
                                            {notificationCount}
                                        </span>
                                    )}
                                </a>
                                <div className="dropdown-menu dropdown-menu-end" style={{ marginRight: "20px", marginTop: "5px" }}>
                                    <div id="DZ_W_Notification1" className="widget-media dz-scroll p-2" style={{
                                        width: "250px",
                                        maxHeight: "300px",
                                        overflowY: "auto",
                                        scrollbarWidth: "thin",
                                        scrollbarColor: "#888 #f1f1f1",
                                    }}>
                                        <ul className="timeline" style={{ listStyle: "none", padding: 0 }}>
                                            {notifications.length > 0 ? (
                                                notifications.map(notification => (
                                                    <li style={{ marginTop: "10px" }} key={notification.id}>
                                                        <div className="timeline-panel d-flex align-items-center">
                                                            <div style={{marginLeft:"10px"}} className="media-body">
                                                                <h6 className="mb-1" style={{ fontSize: "14px" }}>
                                                                    {notification.title}
                                                                </h6>
                                                                <small style={{ fontSize: "12px" }}>
                                                                    {notification.date}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <li style={{ marginTop: "10px" }}>
                                                    <div className="timeline-panel">
                                                        <div style={{marginLeft:"10px"}} className="media-body">
                                                            <h6 className="mb-1" style={{ fontSize: "14px", textAlign: "center" }}>
                                                                Chưa có thông báo
                                                            </h6>
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
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
