import { useState, useEffect } from 'react';

const useNotifications = () => {
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

    return { notifications, addNotification };
};

export default useNotifications;
