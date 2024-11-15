import request from "../../config/API/api";

const getAllNotification = async (userId) => {
    try {
        const response = await request({
            method: 'GET',
            path: `/api/notification/${userId}`, 
        });
        return response; 
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

// Thêm một thông báo mới
const addNotification = async (userId, content) => {
    try {
        const response = await request({
            path: `/api/notification/add`,
            method: 'POST',
            data: {
                userId,
                content,
            },
        });
        return response;
    } catch (error) {
        console.error('Error adding notification:', error.response || error.message);
        throw error;
    }
};

const deleteNotification = async (id) => {
    try {
        const response = await request({
            path: `/api/notification/delete/${id}`,
            method: 'DELETE',
        });
        return response;
    } catch (error) {
        console.error('Error deleting notification:', error.response || error.message);
        throw error;
    }
};

export {
    getAllNotification,
    addNotification,
    deleteNotification
};
