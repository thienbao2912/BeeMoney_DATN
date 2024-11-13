// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { getAllBudgets } from '../../../service/Budget';
// import { getAllSavingsGoals } from '../../../service/SavingGoal';
// import { getAllNotification, addNotification as addNotificationAPI, deleteNotification as deleteNotificationAPI } from '../../../service/Notification';

// const NotificationContext = createContext();

// export const NotificationProvider = ({ children, userId }) => {
//     const [notifications, setNotifications] = useState([]);
//     const [deletedNotifications, setDeletedNotifications] = useState([]);

//     useEffect(() => {
//         // Load notifications from the API
//         const loadNotifications = async () => {
//             try {
//                 const response = await getAllNotification(userId);
//                 const storedDeletedNotifications = JSON.parse(localStorage.getItem('deletedNotifications')) || [];
//                 setNotifications(response.filter(n => !storedDeletedNotifications.includes(n._id)));
//                 setDeletedNotifications(storedDeletedNotifications);
//             } catch (error) {
//                 console.error('Error fetching notifications:', error);
//             }
//         };

//         loadNotifications();
//     }, [userId]);

//     const saveNotifications = (updatedNotifications) => {
//         setNotifications(updatedNotifications);
//     };

//     const saveDeletedNotifications = (notificationId) => {
//         const updatedDeletedNotifications = [...deletedNotifications, notificationId];
//         setDeletedNotifications(updatedDeletedNotifications);
//         localStorage.setItem('deletedNotifications', JSON.stringify(updatedDeletedNotifications));
//     };

//     const addNotification = async (notificationContent) => {
//         try {
//             const response = await addNotificationAPI(userId, notificationContent);
//             setNotifications((prevNotifications) => {
//                 const exists = prevNotifications.some(n => n._id === response._id);
//                 if (!exists) {
//                     const updatedNotifications = [response, ...prevNotifications];
//                     saveNotifications(updatedNotifications);
//                     return updatedNotifications;
//                 }
//                 return prevNotifications;
//             });
//         } catch (error) {
//             console.error('Error adding notification:', error);
//         }
//     };

//     const removeNotification = async (notificationId) => {
//         try {
//             await deleteNotificationAPI(notificationId);
//             setNotifications(prevNotifications => {
//                 const updatedNotifications = prevNotifications.filter(notification => notification._id !== notificationId);
//                 saveNotifications(updatedNotifications);
//                 saveDeletedNotifications(notificationId);
//                 return updatedNotifications;
//             });
//         } catch (error) {
//             console.error('Error deleting notification:', error);
//         }
//     };


//     return (
//         <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, checkBudgetExceed, checkSavingGoals }}>
//             {children}
//         </NotificationContext.Provider>
//     );
// };

// export const useNotifications = () => useContext(NotificationContext);
