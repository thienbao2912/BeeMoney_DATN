import React, { useEffect, useState } from 'react';
import { getAllNotification, deleteNotification } from '../../../service/Notification';
import { useNotification } from '../Header/NotificationContext'; // Import hook context
import 'bootstrap-icons/font/bootstrap-icons.css';
import './notificationList.css'
import { getAllBudgets } from "../../../service/Budget"; // Import the getAllBudgets function

const NotificationList = () => {
    const { setNotificationCount } = useNotification(); // Lấy setNotificationCount từ context
    const [notifications, setNotifications] = useState([]);
    const [budgets, setBudgets] = useState([]); // Store budgets to fetch category images

    // Fetching notifications
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
            setNotificationCount(sortedNotifications.length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setNotifications([]);
            setNotificationCount(0);
        }
    };

    // Fetching budgets to get the category image
    const fetchBudgets = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            console.log("User ID not found");
            return;
        }
        try {
            const response = await getAllBudgets(userId);
            setBudgets(response);
        } catch (error) {
            console.error("Error fetching budgets:", error);
        }
    };

    // Matching the category image to the notification
    const getCategoryImage = (categoryId) => {
        const budget = budgets.find(budget => budget.categoryId && budget.categoryId._id === categoryId);
        return budget ? budget.categoryId.image : "images/exclamation.png";
    };

    useEffect(() => {
        fetchNotifications();
        fetchBudgets();
    }, []);

    const handleDeleteNotification = async (id) => {
        try {
            console.log("Deleting notification with ID:", id);
            await deleteNotification(id);
            setNotifications((prevNotifications) =>
                prevNotifications.filter((notification) => notification._id !== id)
            );
            setNotificationCount((prevCount) => prevCount - 1);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <div className="notification-list">
            <div
                className="widget-media dz-scroll"
                style={{
                    width: "100%",
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
                            <li key={notification._id} className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex" style={{ width: '20%' }}>
                                    <img
                                        src={getCategoryImage(notification.categoryId)}  // Set the image dynamically based on categoryId
                                        alt="Notification"
                                        style={{ width: '60px', height: '60px', borderRadius: '50%', marginLeft: '20px' }}
                                    />
                                </div>
                                <div className="d-flex flex-column" style={{ width: '40%' }}>
                                    <h6 className="mb-1 notification-title" style={{ fontSize: "14px" }}>
                                        {notification.content}
                                    </h6>
                                    <small style={{ fontSize: "12px" }}>
                                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Ngày không hợp lệ"}
                                    </small>
                                </div>
                                <div className="d-flex" style={{ width: '20%' }}>
                                    <button
                                        style={{
                                            border: "none",  // Loại bỏ viền của nút
                                        }}
                                        onClick={() => handleDeleteNotification(notification._id)}
                                        className="btn btn-sm btn-outline-danger ms-3"
                                        aria-label="Delete notification"
                                    >
                                        <i className="bi bi-x-circle"></i>
                                    </button>
                                </div>
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
