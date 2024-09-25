import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAllBudgets } from '../../../service/Budget'; 
import { getAllSavingsGoals } from '../../../service/SavingGoal'; 

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [deletedNotifications, setDeletedNotifications] = useState([]);

    useEffect(() => {
        const storedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
        const storedDeletedNotifications = JSON.parse(localStorage.getItem('deletedNotifications')) || [];

        setNotifications(storedNotifications);
        setDeletedNotifications(storedDeletedNotifications);
    }, []);

    const saveNotifications = (updatedNotifications) => {
        setNotifications(updatedNotifications);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    };

    const saveDeletedNotifications = (notificationId) => {
        const updatedDeletedNotifications = [...deletedNotifications, notificationId];
        setDeletedNotifications(updatedDeletedNotifications);
        localStorage.setItem('deletedNotifications', JSON.stringify(updatedDeletedNotifications));
    };

    const addNotification = (notification) => {
        setNotifications((prevNotifications) => {
            const exists = prevNotifications.some(n => n._id === notification._id);
            if (!exists && !deletedNotifications.includes(notification._id)) { 
                const updatedNotifications = [notification, ...prevNotifications]; 
                saveNotifications(updatedNotifications);
                return updatedNotifications;
            }
            return prevNotifications;
        });
    };

    const removeNotification = (notificationId) => {
        setNotifications(prevNotifications => {
            const updatedNotifications = prevNotifications.filter(notification => notification._id !== notificationId);
            saveNotifications(updatedNotifications);
            saveDeletedNotifications(notificationId); 
            return updatedNotifications;
        });
    };

    const checkBudgetExceed = async (userId) => {
        try {
            const budgets = await getAllBudgets(userId);
            const today = new Date();

            budgets.forEach(budget => {
                const endDate = new Date(budget.endDate);

                if (budget.remainingBudget < 0 && endDate > today) {
                    const notificationId = `budget-${budget._id}`;
                    const notificationExists = notifications.some(n => n._id === notificationId);
                    
                    if (!notificationExists && !deletedNotifications.includes(notificationId)) {
                        addNotification({
                            _id: notificationId,
                            content: `Chi tiêu vượt ngân sách cho ngân sách ${budget.categoryId ? budget.categoryId.name : 'Unknown'}`,
                            createdAt: new Date(),
                        });
                    }
                }

                if (endDate <= today) {
                    removeNotification(`budget-${budget._id}`);
                }
            });
        } catch (err) {
            console.error('Error checking budget exceed:', err);
        }
    };

    const checkSavingGoals = async (userId) => {
        try {
            const savingsGoals = await getAllSavingsGoals(userId);
            const today = new Date();
            const oneDay = 24 * 60 * 60 * 1000;

            savingsGoals.forEach(goal => {
                const startDate = new Date(goal.startDate);
                const endDate = new Date(goal.endDate);
                const timeRemainingFromStart = endDate - startDate;
                const timeRemainingFromToday = endDate - today;

                const notificationId = `goal-${goal._id}`;
                const notificationExists = notifications.some(n => n._id === notificationId);

                if (timeRemainingFromStart <= oneDay && timeRemainingFromStart > 0 && !deletedNotifications.includes(notificationId)) {
                    if (!notificationExists) {
                        addNotification({
                            _id: notificationId,
                            content: `Mục tiêu ${goal.name} chỉ còn 1 ngày từ ngày bắt đầu!`,
                            createdAt: new Date(),
                        });
                    }
                }

                if (timeRemainingFromToday <= oneDay && timeRemainingFromToday > 0 && !deletedNotifications.includes(notificationId)) {
                    if (!notificationExists) {
                        addNotification({
                            _id: notificationId,
                            content: `Mục tiêu ${goal.name} chỉ còn 1 ngày!`,
                            createdAt: new Date(),
                        });
                    }
                }

                if (endDate <= today) {
                    removeNotification(notificationId);
                }
            });
        } catch (err) {
            console.error('Error checking saving goals:', err);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, checkBudgetExceed, checkSavingGoals }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
