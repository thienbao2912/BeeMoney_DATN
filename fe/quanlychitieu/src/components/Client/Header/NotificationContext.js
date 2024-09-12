// src/components/Client/Header/NotificationContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAllBudgets, deleteBudget } from '../../../service/Budget'; // Import service functions
import { getAllSavingsGoals, deleteSavingsGoal } from '../../../service/SavingGoal'; // Import service functions

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const storedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
        setNotifications(storedNotifications);
    }, []);

    const addNotification = (notification) => {
        setNotifications((prevNotifications) => {
            const exists = prevNotifications.some(n => n._id === notification._id);
            if (!exists) {
                const updatedNotifications = [...prevNotifications, notification];
                localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
                return updatedNotifications;
            }
            return prevNotifications;
        });
    };

    const removeNotification = (notificationId) => {
        setNotifications(prevNotifications => {
            const updatedNotifications = prevNotifications.filter(notification => notification._id !== notificationId);
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
            return updatedNotifications;
        });
    };

    const checkBudgetExceed = async (userId) => {
        try {
            const budgets = await getAllBudgets(userId);
            budgets.forEach(budget => {
                if (budget.remainingBudget < 0) {
                    addNotification({
                        _id: `budget-${budget._id}`,
                        content: `Chi tiêu vượt ngân sách cho ngân sách ${budget.categoryId ? budget.categoryId.name : 'Unknown'}`,
                        createdAt: new Date(),
                    });
                }
            });
        } catch (err) {
            console.error('Error checking budget exceed:', err);
        }
    };

    const checkSavingGoals = async (userId) => {
        try {
            const savingsGoals = await getAllSavingsGoals(userId);
            savingsGoals.forEach(goal => {
                const endDate = new Date(goal.endDate);
                const today = new Date();
                const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
                if (endDate - today <= oneDay && endDate > today) {
                    addNotification({
                        _id: `goal-${goal._id}`,
                        content: `Mục tiêu ${goal.name} chỉ còn 1 ngày!`,
                        createdAt: new Date(),
                    });
                }
            });
        } catch (err) {
            console.error('Error checking saving goals:', err);
        }
    };

    const handleBudgetDeletion = (budgetId) => {
        removeNotification(`budget-${budgetId}`);
    };

    const handleGoalDeletion = (goalId) => {
        removeNotification(`goal-${goalId}`);
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, checkBudgetExceed, checkSavingGoals, handleBudgetDeletion, handleGoalDeletion }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);