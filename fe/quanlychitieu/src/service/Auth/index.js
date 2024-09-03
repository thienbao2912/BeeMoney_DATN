import request from "../../config/API/index";
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

const registerUser = async ({ email, password, name }) => {
    try {
        const res = await request({
            method: 'POST',
            path: '/api/auth/register',
            data: { email, password, name }
        });
        
        // Kiểm tra thông báo thành công từ phản hồi API
        if (res.success) {
            return { success: true, message: res.msg };
        } else {
            return { success: false, message: res.msg };
        }
    } catch (error) {
        console.error('Registration error:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const loginUser = async ({ email, password }) => {
    try {
        const res = await request({
            method: 'POST',
            path: '/api/auth/login',
            data: { email, password }
        });

        if (res?.accessToken) {
            localStorage.setItem('userId', res._id); // Lưu userId vào localStorage
            localStorage.setItem('userName', res.name); // Save user name
            localStorage.setItem('userRole', res.role);

            // Lưu token và role vào cookie
            cookies.set('token', res.accessToken, {
                path: '/',
                secure: true,
                httpOnly: false,
                sameSite: 'Lax'
            });
            cookies.set('role', res.role, { // Giả sử vai trò được trả về từ API
                path: '/',
                secure: true,
                httpOnly: false,
                sameSite: 'Lax'
            });
        } else {
            throw new Error('No access token in response');
        }

        return res;
    } catch (error) {
        console.error('Login error:', error.response || error.message);
        throw error;
    }
};


const forgotPassword = async (email) => {
    const res = await request({
        method: "POST",
        path: "/api/auth/forgot-password",
        data: { email }
    });

    return res;
};

const resetPassword = async ({ password, token }) => {
    const res = await request({
        method: "POST",
        path: "/api/auth/reset-password",
        data: { password, token }
    });

    return res;
};

const getAllUsers = async () => {
    try {
        const res = await request({
            method: "GET",
            path: "/api/auth/list"
        });
        return res;
    } catch (error) {
        console.error('Get all users error:', error.response || error.message);
        throw error;
    }
};

const getUserProfile = async () => {
    try {
        const userId = localStorage.getItem('userId'); // Lấy userId từ localStorage
        const res = await request({
            method: "GET",
            path: `/api/auth/get-profile/${userId}`
        });
        return res;
    } catch (error) {
        console.error('Get profile error:', error.response || error.message);
        throw error;
    }
};

const getUser = async (id) => {
    try {
        const res = await request({
            method: "GET",
            path: `/api/auth/get-profile/${id}`
        });
        return res;
    } catch (error) {
        console.error('Get profile error:', error.response || error.message);
        throw error;
    }
};


const updateUser = async (userId, { email, password, name, avatar, role }) => {
    const data = { email, password, name, avatar, role };
    const res = await request({
        method: "PUT",
        path: `/api/auth/update/${userId}`,
        data: data
    });

    return res;
};

const  deleteUser = async (id) => {
    try {
        const res = await request({
            method: "DELETE",
            path: `/api/users/delete/${id}`  // Correct endpoint based on your backend routes
        });
        return res;
    } catch (error) {
        console.error('Delete user error:', error.response || error.message);
        throw error;
    }
};

export {
    getUser,
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    getAllUsers,
    getUserProfile,
    updateUser,
    deleteUser
};