import request from "../../config/API/api";

const getAllCategories = async () => {
    try {
        const response = await request({
            method: 'GET',
            path: '/api/v2/categories'
        });
        return response;
    } catch (error) {
        console.error('Error fetching categories:', error.response || error.message);
        throw error;
    }
};

const getCategories = async () => {
    try {
        const response = await request({
            method: 'GET',
            path: '/api/v2/categories'
        });
        return response.data; // Chỉ trả về phần dữ liệu của response
    } catch (error) {
        console.error('Error fetching categories:', error.response || error.message);
        throw error;
    }
};

const addCategory = async (categoryData) => {
    try {
        const response = await request({
            path: `/api/v2/categories`,
            method: 'POST',
            data: categoryData,
        });
        return response;
    } catch (error) {
        throw error;
    }
};

const getCategoryById = async (userId, id) => {
    try {
        const response = await request({
            path: `/api/v2/categories/${id}?userId=${userId}`,
            method: 'GET',
        });
        return response;
    } catch (error) {
        throw error;
    }
};

const editCategory = async (userId, id, categoryData) => {
    try {
        const response = await request({
            path: `/api/v2/categories/${id}`,
            method: 'PATCH',
            data: categoryData,
        });
        return response;
    } catch (error) {
        throw error;
    }
};

const deleteCategory = async (id) => {
    try {
        const response = await request({
            path: `/api/v2/categories/${id}`,
            method: 'DELETE',
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export {
    getAllCategories,
    addCategory,
    getCategoryById,
    editCategory,
    deleteCategory,
    getCategories
};
