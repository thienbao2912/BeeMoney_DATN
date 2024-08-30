import axios from 'axios';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();
const API_URL = 'http://localhost:4000/api';

export const getAllCategories = async (page = 1, limit = 10, navigate, searchTerm = '') => {
    const token = cookies.get('token');
    const url = `${API_URL}/categories/list?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`; // Include search term

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });
        return response.data; 
    } catch (error) {
        console.error('Fetch categories error:', error);
        if (error.response && error.response.status === 401) {
            cookies.remove('token');
            navigate('/login');
        }
        throw error;
    }
};

export const addCategory = async (categoryData, navigate) => {
    const token = cookies.get('token');
    const url = `${API_URL}/categories/add`;

    try {
        const response = await axios.post(url, categoryData, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });
        console.log('Add category response:', response);
        return response.data;
    } catch (error) {
        console.error('Add category error:', error.response ? error.response.data : error);
        if (error.response && error.response.status === 401) {
            cookies.remove('token');
            navigate('/login');
        }
        throw error;
    }
};

export const getCategoryById = async (id, navigate) => {
    const token = cookies.get('token');
    const url = `${API_URL}/categories/get-one/${id}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Fetch category error:', error);
        if (error.response && error.response.status === 401) {
            cookies.remove('token');
            navigate('/login');
        }
        throw error;
    }
};

export const updateCategory = async (id, categoryData, navigate) => {
    const token = cookies.get('token');
    const url = `${API_URL}/categories/update/${id}`;

    try {
        const response = await axios.put(url, categoryData, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Update category error:', error.response ? error.response.data : error);
        if (error.response && error.response.status === 401) {
            cookies.remove('token');
            navigate('/login');
        }
        throw error;
    }
};


export const deleteCategory = async (id, navigate) => {
    const token = cookies.get('token');
    const url = `${API_URL}/categories/delete/${id}`;

    try {
        const response = await axios.delete(url, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Delete category error:', error.response ? error.response.data : error);
        if (error.response && error.response.status === 401) {
            cookies.remove('token');
            navigate('/login');
        }
        throw error;
    }
};