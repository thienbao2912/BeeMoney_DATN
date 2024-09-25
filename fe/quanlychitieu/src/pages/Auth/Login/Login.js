import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../../service/Auth";
import styles from "./Login.module.css";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await loginUser(data);
      console.log("Logged in with", response);

      if (response?.accessToken) {
        console.log("Access Token:", response.accessToken);
        navigate("/");
      } else {
        setError("api", {
          type: "manual",
          message: "Login failed, no access token received.",
        });
      }
    } catch (err) {
      setError("api", {
        type: "manual",
        message: err?.response?.data?.message || "Thông tin đăng nhập sai!!!",
      });
      console.error("Login error:", err);
    }
  };

  const handleInputChange = (e, field) => {
    if (field === 'email') {
      setEmail(e.target.value);
      setValue('email', e.target.value);
    } else if (field === 'password') {
      setPassword(e.target.value);
      setValue('password', e.target.value);
    }
    clearErrors("email");
    clearErrors("password");
    clearErrors("api");
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.welcomeSection}>
        <h1>Chào Mừng Bạn Đến Với BEEMONEY</h1>
        <p>
          Website quản lý tài chính cá nhân dành cho mọi người. Cảm ơn bạn đã
          tin tưởng và sử dụng!
        </p>
      </div>
      <div className={styles.loginSection}>
        <form
          className="form-login"
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={handleKeyDown}
        >
          <div className="text-center mb-4">
            <img
              src="/images/piggy-bank.png"
              alt="Logo"
              style={{ width: "5rem", marginBottom: "1rem" }}
            />
            <h3 className={styles.appTitle}>BEEMONEY</h3>
          </div>
          <h4 style={{ marginBottom: "1rem" }}>Đăng Nhập</h4>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Email..."
              {...register("email", {
                required: "Email không được để trống.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email không hợp lệ.",
                },
              })}
              value={email}
              onChange={(e) => handleInputChange(e, "email")}
              onKeyDown={handleKeyDown}
              style={{ width: "20rem" }}
            />
            {errors.email && (
              <p className={styles.error}>{errors.email.message}</p>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu..."
                {...register("password", {
                  required: "Mật khẩu không được để trống.",
                })}
                value={password}
                onChange={(e) => handleInputChange(e, "password")}
                onKeyDown={handleKeyDown}
              />
              <span
                className="toggle-password"
                onClick={togglePasswordVisibility}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? "🙉" : "🙈"}
              </span>
            </div>
            {errors.password && (
              <p className={styles.error}>{errors.password.message}</p>
            )}
          </div>
          {errors.api && <p className={styles.error}>{errors.api.message}</p>}
          <div className="d-flex justify-content-between align-items-center mt-2 mb-3">
            <a
              href="/forget-password"
              style={{ color: "#8e2de2" }}
              className="text-decoration-none"
            >
              Quên mật khẩu?
            </a>
            <a
              href="/register"
              style={{ color: "#8e2de2" }}
              className="text-decoration-none"
            >
              Bạn chưa có tài khoản?
            </a>
          </div>
          <button type="submit" className={styles.loginButton}>
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
