import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../../service/Auth';
import styles from './Register.module.css';

function Register() {
    const { register, handleSubmit, formState: { errors }, setError } = useForm();
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const onSubmit = async (data) => {
        const { username, email, password, confirmPassword } = data;

        if (password !== confirmPassword) {
            setError('confirmPassword', {
                type: 'manual',
                message: 'Mật khẩu và xác nhận mật khẩu không khớp.'
            });
            return;
        }

        try {
            const response = await registerUser({ email, password, name: username });
            console.log('API response:', response);

            if (response.success) {
                setSuccessMessage(response.message || 'Đăng ký thành công!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            console.error('Registration error:', error);

            if (error.response && error.response.status === 400) {
                const errorMessage = error.response.data.error;

                if (errorMessage === 'Email đã tồn tại') {
                    setError('email', {
                        type: 'manual',
                        message: 'Email này đã tồn tại!'
                    });
                }
            }
        }
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.welcomeSection}>
                <h1>Chào Mừng Bạn Đến Với BEEMONEY</h1>
                <p>Website quản lý tài chính cá nhân dành cho mọi người. Cảm ơn bạn đã tin tưởng và sử dụng!</p>
            </div>
            <div className={styles.registerSection}>
                <form className={styles.formRegister} onSubmit={handleSubmit(onSubmit)}>
                    <div className='text-center mb-4'>
                        <img src='/images/piggy-bank.png' alt='Logo' style={{ width: "5rem", marginBottom: "1rem" }} />
                        <h3 className={styles.appTitle}>BEEMONEY</h3>
                    </div>
                    <h4 style={{ marginBottom: "1rem" }}>Đăng Ký</h4>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="Tên đăng nhập..."
                            {...register('username', { required: 'Tên đăng nhập là bắt buộc.' })}
                            style={{ width: "20rem" }}
                        />
                        {errors.username && <p className={styles.error}>{errors.username.message}</p>}
                    </div>
                    <div className={styles.inputGroup}>
                        <input
                            type="email"
                            placeholder="Email..."
                            {...register('email', { required: 'Email là bắt buộc.' })}
                        />
                        {errors.email && <p className={styles.error}>{errors.email.message}</p>}
                    </div>
                    <div className={styles.inputGroup} style={{ position: 'relative' }}>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu..."
                            {...register('password', { required: 'Mật khẩu là bắt buộc.' })}
                            style={{ paddingRight: '2.5rem' }}
                        />
                        <span
                            id="togglePassword"
                            className="toggle-password"
                            onClick={togglePasswordVisibility}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer'
                            }}
                        >
                            {showPassword ? '🙉' : '🙈'}
                        </span>
                        {errors.password && <p className={styles.error}>{errors.password.message}</p>}
                    </div>
                    <div className={styles.inputGroup} style={{ position: 'relative' }}>
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Xác nhận mật khẩu..."
                            {...register('confirmPassword', { required: 'Xác nhận mật khẩu là bắt buộc.' })}
                            style={{ paddingRight: '2.5rem' }}
                        />
                        <span
                            id="toggleConfirmPassword"
                            className="toggle-password"
                            onClick={toggleConfirmPasswordVisibility}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer'
                            }}
                        >
                            {showConfirmPassword ? '🙉' : '🙈'}
                        </span>
                        {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword.message}</p>}
                    </div>
                    {successMessage && (
                        <div className={`${styles.successMessage} alert alert-success mt-4`} role="alert">
                            {successMessage}
                        </div>
                    )}
                    <div className={styles.actions}>
                        <a href="/login">Bạn đã có tài khoản?</a>
                    </div>
                    <button type="submit" className={styles.registerButton}>Đăng ký</button>
                </form>
            </div>
        </div>
    );
}

export default Register;
