import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/AdminLayout';
import { useForm } from 'react-hook-form';
import { registerUser } from '../../../service/Auth'; 

const forbiddenWords = ['Chết', 'Ma Túy', 'Khùng']; 

const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const normalizeText = (text) => {
  return removeAccents(text).toLowerCase().replace(/\s+/g, ''); 
};

const containsForbiddenWords = (value) => {
  const normalizedValue = normalizeText(value);
  return forbiddenWords.some(word => normalizedValue.includes(normalizeText(word)));
};

const AddUser = () => {
    const {
        register,
        formState: { errors },
        reset,
        handleSubmit,
    } = useForm();

    const navigate = useNavigate();
    const [submitError, setSubmitError] = React.useState(null);
    const [submitSuccess, setSubmitSuccess] = React.useState(null);

    const userSubmit = async (data) => {
        try {
            const response = await registerUser({
                email: data.email,
                password: data.password,
                name: data.username
            });

            if (response.success) {
                setSubmitSuccess(response.message);
                reset(); 
                navigate('/admin/users'); 
            } else {
                setSubmitError(response.message);
            }
        } catch (error) {
            setSubmitError('Email đã tồn tại!!!');
            console.error('User registration error:', error);
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
                        <h5 className="card-title">Thêm mới</h5>
                        <button onClick={handleBack} className="btn btn-secondary">Quay lại</button>
                    </div>
                    <div className="card-body">
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
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Mật khẩu</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    {...register("password", {
                                        required: {
                                            value: true,
                                            message: "Mật khẩu không được để trống",
                                        },
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
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {errors.role && (
                                    <small className='text-danger'>
                                        {errors.role.message}
                                    </small>
                                )}
                            </div>
                            <button type="submit" className="btn btn-primary">Thêm mới</button>
                        </form>
                        {submitSuccess && (
                            <div className="alert alert-success mt-3">
                                {submitSuccess}
                            </div>
                        )}
                        {submitError && (
                            <div className="alert alert-danger mt-3">
                                {submitError}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AddUser;
