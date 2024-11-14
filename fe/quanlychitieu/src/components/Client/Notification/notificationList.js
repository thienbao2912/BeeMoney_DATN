import React, { useEffect, useState } from 'react';
import { getAllNotification, deleteNotification } from '../../../service/Notification';
import 'bootstrap-icons/font/bootstrap-icons.css';

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            console.log("User ID not found");
            return;
        }
        try {
            const response = await getAllNotification(userId);
            const sortedNotifications = Array.isArray(response) ? response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
            setNotifications(sortedNotifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setNotifications([]);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleDeleteNotification = async (id) => {
        try {
            console.log("Deleting notification with ID:", id);
            await deleteNotification(id);

            setNotifications((prevNotifications) =>
                prevNotifications.filter((notification) => notification._id !== id)
            );
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <div className="notification-list">
            <div
                className="widget-media dz-scroll"
                style={{
                    width: "250px",
                    maxHeight: "300px",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#888 #f1f1f1",
                }}
            >
                <div className="d-flex align-items-center">
                    <h6 className="ms-3">Thông báo</h6>
                    <button 
                        onClick={fetchNotifications}
                        className="btn btn-sm btn-outline-white ms-auto me-3"
                        aria-label="Refresh notification"
                    >
                        <i className="bi bi-arrow-clockwise fs-5"></i>
                    </button>
                </div>
                <hr style={{ marginTop: '5px' }} />
                <ul className="list-unstyled">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <li key={notification._id} className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex flex-column">
                                    <h6 className="mb-1" style={{ fontSize: "14px", paddingLeft: "10px" }}>
                                        {notification.content}
                                    </h6>
                                    <small style={{ fontSize: "12px", paddingLeft: "10px" }}>
                                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Ngày không hợp lệ"}
                                    </small>
                                </div>
                                <button
                                    style={{ marginRight: "10px" }}
                                    onClick={() => handleDeleteNotification(notification._id)}
                                    className="btn btn-sm btn-outline-danger ms-3"
                                    aria-label="Delete notification"
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </li>
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
