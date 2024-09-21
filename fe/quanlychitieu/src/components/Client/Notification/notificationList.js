import React from 'react';
import { useNotifications } from '../Header/NotificationContext';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons

const NotificationList = () => {
    const { notifications, removeNotification } = useNotifications();

    const handleDelete = (notificationId) => {
        removeNotification(notificationId);
    };

    const formatTimeElapsed = (createdAt) => {
        const now = new Date();
        const createdDate = new Date(createdAt);
        const timeDiff = now - createdDate;

        const oneMinute = 60 * 1000;
        const oneHour = 60 * oneMinute;
        const oneDay = 24 * oneHour;

        if (timeDiff < oneMinute) {
            return 'Vừa mới';
        } else if (timeDiff < oneHour) {
            const minutes = Math.floor(timeDiff / oneMinute);
            return `${minutes} phút trước`;
        } else if (timeDiff < oneDay) {
            const hours = Math.floor(timeDiff / oneHour);
            return `${hours} giờ trước`;
        } else {
            return new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(createdDate);
        }
    };

    // Sắp xếp thông báo theo thứ tự thời gian, mới nhất lên đầu
    const sortedNotifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div className="notification-list">
            <div className="widget-media dz-scroll" style={{
                width: "250px",
                maxHeight: "300px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#888 #f1f1f1",
            }}>
                <h6 className="ms-3">Thông báo</h6>
                <hr style={{ marginTop: '5px' }} />
                <ul className="list-unstyled">
                    {sortedNotifications && sortedNotifications.length > 0 ? (
                        sortedNotifications.map(notification => (
                            notification && notification.content ? (
                                <li className="d-flex justify-content-between align-items-center mb-2" key={notification._id}>
                                    <div className="d-flex flex-column">
                                        <h6 className="mb-1" style={{ fontSize: "14px", paddingLeft: "10px" }}>
                                            {notification.content}
                                        </h6>
                                        <small style={{ fontSize: "12px", paddingLeft: "10px" }}>
                                            {formatTimeElapsed(notification.createdAt)}
                                        </small>
                                    </div>
                                    <button style={{ marginRight: "10px" }}
                                        onClick={() => handleDelete(notification._id)}
                                        className="btn btn-sm btn-outline-danger ms-3"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </li>
                            ) : null
                        ))
                    ) : (
                        <li className="text-center mb-2">
                            <h6 className="mb-1" style={{ fontSize: "14px" }}>
                                Chưa có thông báo
                            </h6>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default NotificationList;
