import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../layouts/AdminLayout';
import { useForm } from 'react-hook-form';
import { getUser, updateUser } from '../../../service/Auth';

const forbiddenWords = ['Chết', 'Ma Túy', 'Khùng']; // Add forbidden words here

const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const normalizeText = (text) => {
  return removeAccents(text).toLowerCase().replace(/\s+/g, ''); // Remove spaces
};

const containsForbiddenWords = (value) => {
  const normalizedValue = normalizeText(value);
  return forbiddenWords.some(word => normalizedValue.includes(normalizeText(word)));
};

const UpdateUser = () => {
    const { id } = useParams();
    const {
        register,
        formState: { errors },
        reset,
        handleSubmit,
        setValue,
    } = useForm();

    const navigate = useNavigate();
    const [submitError, setSubmitError] = React.useState(null);
    const [submitSuccess, setSubmitSuccess] = React.useState(null);
    const [user, setUser] = React.useState(null);

    useEffect(() => {
        if (!id) {
            console.error('User ID is undefined');
            return;
        }

        console.log('Fetching user with ID:', id);
        const fetchUser = async () => {
            try {
                const data = await getUser(id);
                console.log('Fetched user data:', data);
                if (data) {
                    setUser(data);
                    setValue('username', data.name || '');
                    setValue('email', data.email || '');
                    setValue('role', data.role || '');
                    setValue('password', '••••••');
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setSubmitError('Failed to fetch user details.');
            }
        };

        fetchUser();
    }, [id, setValue]);

    const userSubmit = async (data) => {
        try {
            if (data.password === '••••••') {
                delete data.password;
            }

            const updateData = {
                ...data,
                name: data.username || user.name,
                email: data.email || user.email,
                role: data.role || user.role,
            };

            console.log('Data to update:', updateData);

            const response = await updateUser(id, updateData);
            if (response.success) {
                setSubmitSuccess(response.message);
                setUser(updateData);
                reset();
                setTimeout(() => navigate('/admin/users'), 2000);
            } else {
                setSubmitError(response.message);
            }
        } catch (error) {
            setSubmitError('Failed to update user. Please try again later.');
            console.error('User update error:', error);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="card-title">Cập nhật thông tin</h5>
                        <button onClick={handleBack} className="btn btn-secondary">Quay lại</button>
                    </div>
                    <div className="card-body">
                        {user ? (
                            <form onSubmit={handleSubmit(userSubmit)}>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">Họ tên</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        {...register('username', {
                                            required: {
                                              value: true,
                                              message: 'Họ tên không được để trống'
                                            },
                                            minLength: {
                                              value: 3,
                                              message: 'Họ tên phải có ít nhất 3 kí tự'
                                            },
                                            validate: {
                                              forbiddenWords: (value) => 
                                                !containsForbiddenWords(value) || 'Họ tên chứa từ cấm'
                                            }
                                          })}
                                    />
                                    {errors.username && (
                                        <small className='text-danger'>
                                            {errors.username.message}
                                        </small>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        {...register("email", {
                                            required: {
                                                value: true,
                                                message: "Email không được để trống",
                                            },
                                            pattern: {
                                                value: /^\S+@\S+$/i,
                                                message: "Email không hợp lệ",
                                            },
                                        })}
                                    />
                                    {errors.email && (
                                        <small className='text-danger'>
                                            {errors.email.message}
                                        </small>
                                    )}
                                </div>
                                {false && (
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Mật khẩu</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            {...register("password", {
                                                minLength: {
                                                    value: 6,
                                                    message: "Mật khẩu phải có ít nhất 6 kí tự",
                                                },
                                            })}
                                        />
                                        {errors.password && (
                                            <small className='text-danger'>
                                                {errors.password.message}
                                            </small>
                                        )}
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label htmlFor="role" className="form-label">Chức vụ</label>
                                    <select
                                        className="form-select"
                                        id="role"
                                        {...register("role", {
                                            required: {
                                                value: true,
                                                message: "Chức vụ không được để trống",
                                            },
                                        })}
                                        defaultValue={user.role}
                                    >
                                        <option value="">Chọn chức vụ</option>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {errors.role && (
                                        <small className='text-danger'>
                                            {errors.role.message}
                                        </small>
                                    )}
                                </div>
                                <button type="submit" className="btn btn-primary">Cập nhật</button>
                            </form>
                        ) : (
                            <p>Loading user details...</p>
                        )}
                        {submitSuccess && <div className="alert alert-success mt-3">{submitSuccess}</div>}
                        {submitError && <div className="alert alert-danger mt-3">{submitError}</div>}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default UpdateUser;
