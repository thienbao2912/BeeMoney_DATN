import React, { useState } from 'react';
import styles from './Login.module.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === '' || password === '') {
            setError('Username and password are required.');
        } else {
            setError('');
            // Handle login logic here
            console.log('Logged in with', { username, password });
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.welcomeSection}>
                <h1>Welcome to website</h1>
                <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
            </div>
            <div className={styles.loginSection}>
                <form className='form-login' onSubmit={handleLogin}>
                    <h2>User Login</h2>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.actions}>
                        <label>
                            <input type="checkbox" /> Remember
                        </label>
                        <a href="#forgot-password">Forgot password?</a>
                    </div>
                    <button type="submit" className={styles.loginButton}>Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;