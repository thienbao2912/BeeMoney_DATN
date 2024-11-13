import React, { useState } from "react";
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

  const onSubmit = async (data, e) => {
    e.preventDefault(); 
    try {
      await forgotPassword(data.email);
      setSuccessMessage(
        "Email khôi phục mật khẩu đã được gửi, vui lòng kiểm tra hộp thư của bạn."
      );
      setErrorMessage("");
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
              style={{ width: "20rem" }}
            />
            {errors.email && (
              <p className={styles.error}>{errors.email.message}</p>
            )}
          </div>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          <div>
          {successMessage && <p className={styles.success}>{successMessage}</p>}
          </div>
         

          <button type="submit" className={styles.forgetButton}>
            Gửi Email Khôi Phục
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgetPassword;
