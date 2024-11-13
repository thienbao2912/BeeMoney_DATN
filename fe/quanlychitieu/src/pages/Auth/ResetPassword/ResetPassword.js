import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../../../service/Auth"; // Dùng hàm resetPassword
import styles from "./ResetPassword.module.css";

function ResetPassword() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token"); // Lấy token từ query string

  console.log("Token từ query string:", token); // Kiểm tra token

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      console.log("Submitting reset password request with:", {
        password: data.password,
        token,
      }); // Debugging
      await resetPassword({ password: data.password, token }); // Gửi request đặt lại mật khẩu
      setSuccessMessage("Mật khẩu của bạn đã được đặt lại thành công.");
      setErrorMessage("");
      setTimeout(() => navigate("/login"), 2000); // Điều hướng về trang đăng nhập sau khi thành công
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || "Đã xảy ra lỗi khi đặt lại mật khẩu."
      );
    }
  };

  return (
    <div className={styles.resetPasswordContainer}>
      <div className={styles.welcomeSection}>
        <h1>Chào Mừng Bạn Đến Với BEEMONEY</h1>
        <p>
          Website quản lý tài chính cá nhân dành cho mọi người. Cảm ơn bạn đã
          tin tưởng và sử dụng!
        </p>
      </div>
      <div className={styles.resetSection}>        
        <form className="form-reset" onSubmit={handleSubmit(onSubmit)}>
        <div className="text-center mb-4">
          <img
            src="/images/piggy-bank.png"
            alt="Logo"
            style={{ width: "5rem", marginBottom: "1rem" }}
          />
          <h3 className={styles.appTitle}>BEEMONEY</h3>
        </div>
        <h4 style={{ marginBottom: "1rem" }}>Đặt Lại Mật Khẩu</h4>
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              {...register("password", {
                required: "Mật khẩu không được để trống.",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải dài ít nhất 6 ký tự.",
                },
              })}
            />
            {errors.password && (
              <p className={styles.error}>{errors.password.message}</p>
            )}
          </div>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}

          <button type="submit" className={styles.resetButton}>
            Đặt Lại Mật Khẩu
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
