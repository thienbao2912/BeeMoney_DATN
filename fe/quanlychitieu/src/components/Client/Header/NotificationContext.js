import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Load notifications from localStorage
        const storedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
        setNotifications(storedNotifications);
    }, []);

    const addNotification = (notification) => {
        const updatedNotifications = [...notifications, notification];
        setNotifications(updatedNotifications);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
