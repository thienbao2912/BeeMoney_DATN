import axios from 'axios';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();
const API_URL = 'http://localhost:4000'; 

const request = async (options) => {
    const token = cookies.get('token');
    const url = `${API_URL}${options.path}`;

    const config = {
        method: options.method || 'GET',
        url,
        headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
            ...options.headers,
        },
        data: options.data || {},
    };

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            // cookies.remove('token');
            // window.location.href = '/login';
        }
        console.error('API error:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export default request;
