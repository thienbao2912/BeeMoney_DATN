import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../../layouts/AdminLayout';
import { getUserProfile, updateUser } from '../../../service/Auth'; 
import { storage } from '../../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { RingLoader } from 'react-spinners';
import './Profile.css';

const Profile = () => {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null); 

    const userId = localStorage.getItem('userId'); 

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUserProfile(userId);
                console.log('Fetched user data:', data); 
                setUserData(data);
                setValue('username', data.name || ''); 
                setValue('email', data.email || '');
                setValue('role', data.role || localStorage.getItem('userRole') || '');
                setValue('avatar', data.avatar || ''); 
                setAvatarPreview(data.avatar || '/images/default-avatar.jpg'); 
                setLoading(false);
            } catch (error) {
                console.error('Profile fetch error:', error);
                setLoading(false);
            }
        };

        fetchProfile();
    }, [setValue, userId]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = async (data) => {
        try {
            console.log('Data to be sent:', data);

            let avatarURL = userData.avatar;
            if (avatar) {
                const avatarRef = ref(storage, `avatars/${userId}`);
                await uploadBytes(avatarRef, avatar);
                avatarURL = await getDownloadURL(avatarRef);
            }

            const updateData = {
                name: data.username,
                email: data.email,
                role: data.role,
                avatar: avatarURL
            };                    
            await updateUser(userId, updateData);
            localStorage.setItem('userRole', data.role);
            setIsEditing(false);
        } catch (error) {
            console.error('Profile update error:', error);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file)); 
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="container-fluid py-4">
                    <div className="card">
                        <div className="card-body d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                            <RingLoader color="#007bff" />
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="card-title">Hồ sơ</h5>
                        <button onClick={handleEditToggle} className="btn btn-primary">
                            {isEditing ? 'Hủy' : 'Sửa thông tin'}
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="d-flex align-items-start">
                            <div className="avatar-section me-4">
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="img-thumbnail profile-avatar"
                                />
                                
                            </div>

                            <form onSubmit={handleSubmit(handleSave)} className="flex-grow-1">
                                <div className="mb-3">
                                    <div className="info-box">
                                        <label htmlFor="username" className="form-label">Họ tên</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm mt-2"
                                            id="username"
                                            {...register('username', {
                                                required: 'Họ tên không được để trống',
                                                minLength: {
                                                    value: 3,
                                                    message: 'Họ tên phải có ít nhất 3 kí tự'
                                                }
                                            })}
                                            readOnly={!isEditing}
                                        />
                                        {errors.username && (
                                            <small className='text-danger'>
                                                {errors.username.message}
                                            </small>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <div className="info-box">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-sm mt-2"
                                            id="email"
                                            {...register('email', {
                                                required: 'Email không được để trống',
                                                pattern: {
                                                    value: /^\S+@\S+$/i,
                                                    message: 'Email không hợp lệ'
                                                }
                                            })}
                                            readOnly={!isEditing}
                                        />
                                        {errors.email && (
                                            <small className='text-danger'>
                                                {errors.email.message}
                                            </small>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-3">
                                
                                {isEditing && (
                                    <div className="info-box">
                                    <input
                                        type="file"
                                        className="form-control mt-2"
                                        id="avatar"
                                        onChange={handleAvatarChange}
                                    />
                                    </div>
                                )}
                                
                                </div>

                                <div className="mb-3">
                                    <div className="info-box">
                                        <label htmlFor="role" className="form-label">Chức vụ</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm mt-2"
                                            id="role"
                                            {...register('role')}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <button type="submit" className="btn-submit btn btn-primary">
                                        Lưu
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
