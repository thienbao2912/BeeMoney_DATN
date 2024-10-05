import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { forgotPassword } from "../../../service/Auth";
import styles from "./ForgetPassword.module.css";

function ForgetPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();
  
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCooldown, setIsCooldown] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const storedCooldown = localStorage.getItem("cooldownTime");
    if (storedCooldown) {
      const remainingTime = Math.floor(
        (new Date().getTime() - storedCooldown) / 1000
      );
      if (remainingTime < 60) {
        setIsCooldown(true);
        setTimer(60 - remainingTime);
      } else {
        localStorage.removeItem("cooldownTime");
      }
    }
  }, []);

  useEffect(() => {
    let countdown;
    if (isCooldown && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsCooldown(false);
      setTimer(60);
      localStorage.removeItem("cooldownTime");
    }

    return () => clearInterval(countdown);
  }, [isCooldown, timer]);

  const onSubmit = async (data, e) => {
    e.preventDefault();
    try {
      await forgotPassword(data.email);
      setSuccessMessage(
        "Email khôi phục mật khẩu đã được gửi, vui lòng kiểm tra hộp thư của bạn."
      );
      setErrorMessage("");
      setIsCooldown(true);
      localStorage.setItem("cooldownTime", new Date().getTime()); 
    } catch (err) {
      console.error("Forgot Password Error:", err);
      setErrorMessage(
        err?.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại sau."
      );
    }
  };

  return (
    <div className={styles.forgetContainer}>
      <div className={styles.welcomeSection}>
        <h1>Chào Mừng Bạn Đến Với BEEMONEY</h1>
        <p>
          Website quản lý tài chính cá nhân dành cho mọi người. Cảm ơn bạn đã
          tin tưởng và sử dụng!
        </p>
      </div>
      <div className={styles.forgetSection}>
        <form className="form-forget" onSubmit={handleSubmit(onSubmit)}>
          <div className="text-center mb-4">
            <img
              src="/images/piggy-bank.png"
              alt="Logo"
              style={{ width: "5rem", marginBottom: "1rem" }}
            />
            <h3 className={styles.appTitle}>BEEMONEY</h3>
          </div>
          <h4 style={{ marginBottom: "1rem" }}>Quên Mật Khẩu</h4>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Nhập email của bạn"
              {...register("email", {
                required: "Email không được để trống.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email không hợp lệ.",
                },
              })}
              style={{ width: "30rem" }}
              disabled={isCooldown}
            />
            {errors.email && (
              <p className={styles.error}>{errors.email.message}</p>
            )}
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
            {successMessage && <p className={styles.success}>{successMessage}</p>}
          </div>
          <div className="d-flex justify-content-between align-items-center mt-2 mb-3">
            
            <a
              href="/login"
              style={{ color: "#8e2de2" }}
              className="text-decoration-none"
            >
             Quay lại trang đăng nhập
            </a>
          </div>
          
          {isCooldown && (
            <p className={styles.cooldownMessage}>
              Bạn chưa nhận được mã?
            </p>
          )}
          <button
            type="submit"
            className={styles.forgetButton}
            disabled={isCooldown}
          >
            {isCooldown ? `Chờ ${timer}s để gửi lại` : "Gửi Email Khôi Phục"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgetPassword;
