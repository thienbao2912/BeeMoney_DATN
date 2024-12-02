import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllNotification } from '../../../service/Notification'; // Đảm bảo đường dẫn đúng

export  const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState(0); // Khai báo đúng setNotificationCount

  const fetchNotificationCount = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        const response = await getAllNotification(userId);
        const count = response?.data?.length || 0;
        setNotificationCount(count);  // Cập nhật đúng state
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotificationCount(0);  // Cập nhật đúng state khi có lỗi
      }
    }
  };

  useEffect(() => {
    fetchNotificationCount();
  }, []);

  return (
    <NotificationContext.Provider value={{ notificationCount, setNotificationCount, fetchNotificationCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
