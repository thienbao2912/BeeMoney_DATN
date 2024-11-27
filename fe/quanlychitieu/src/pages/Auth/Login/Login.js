import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { loginUser, updateLastLogin } from "../../../service/Auth";
import cookies from 'js-cookie';
import styles from "./Login.module.css";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [capVal, setCapVal] = useState(null);
  const [recaptchaError, setRecaptchaError] = useState(""); 
  const [lockedError, setLockedError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    if (!capVal) {
      setRecaptchaError("Vui lòng xác nhận ReCAPTCHA.");
      return;
    }

    try {
      const response = await loginUser(data);
      if (response?.status === "locked") {
        setError("api", {
          type: "manual",
          message: "Tài khoản của bạn đã bị khóa.",
        });
      } else if (response?.accessToken) {
        if (response?.isFirstLogin) {
          navigate("/hobbyCategory");
        } else {
          navigate("/");
        }
        const userId = response?.userId;
        if (userId) {
          await updateLastLogin(userId);
        }
      } else {
        setError("api", {
          type: "manual",
          message: "Đăng nhập thất bại, không nhận được token truy cập.",
        });
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setError("api", {
          type: "manual",
          message: "Tài khoản của bạn đã bị khóa.",
        });
      } else {
        setError("api", {
          type: "manual",
          message: err?.response?.data?.message || "Thông tin đăng nhập sai!!!",
        });
      }
    }
  };

  const handleInputChange = (e, field) => {
    if (field === "email") {
      setEmail(e.target.value);
    } else if (field === "password") {
      setPassword(e.target.value);
    }
    clearErrors("email");
    clearErrors("password");
    clearErrors("api");
    clearErrors("recaptcha");
    setRecaptchaError("");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const userName = params.get("userName");
    const role = params.get("role");
    const error = params.get("error");
  
    if (error === "account_locked") {
      setLockedError("Tài khoản của bạn đã bị khóa.");
    }
  
    if (token && userId) {
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", userName);
      localStorage.setItem("userRole", role);
  
      cookies.set("token", token, {
        path: "/",
        secure: true,
        httpOnly: false,
        sameSite: "Lax",
      });
  
      // Gửi yêu cầu API kiểm tra xem người dùng có phải lần đăng nhập đầu tiên không
      const checkFirstLogin = async () => {
        try {
          const response = await fetch("http://localhost:4000/api/check-first-login", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          const data = await response.json();
  
          // Nếu là lần đăng nhập đầu tiên, chuyển hướng đến hobbyCategory
          if (data.isFirstLogin) {
            navigate("/hobbyCategory");
          } else {
            navigate("/");
          }
        } catch (err) {
          console.error("Lỗi khi kiểm tra lần đăng nhập đầu tiên:", err);
          navigate("/"); // Nếu có lỗi, chuyển hướng về trang chủ
        }
      };
  
      checkFirstLogin(); // Kiểm tra nếu đây là lần đăng nhập đầu tiên
    } 
  }, [navigate]);
  

  const loginwithgoogle = ()=>{
    window.open("http://localhost:4000/auth/google/callback","_self")
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
        <form className="form-login" onSubmit={handleSubmit(onSubmit)}>
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
            />
            {errors.email && (
              <p className={styles.error}>{errors.email.message}</p>
            )}
          </div>
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
            {errors.password && (
              <p className={styles.error}>{errors.password.message}</p>
            )}
          </div>
          {errors.api && <p className={styles.error}>{errors.api.message}</p>}
          {lockedError && <p className={styles.error}>{lockedError}</p>}
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
          <ReCAPTCHA
            sitekey="6LcZwlAqAAAAAMWeZ1Bkzt-Kjnux1WLDYAJ776Jl"
            onChange={(val) => {
              setCapVal(val);
              setRecaptchaError("");
            }}
          />
          {recaptchaError && (
            <p className={styles.error}>{recaptchaError}</p>
          )}
          <button type="submit" className={styles.loginButton}>
            Đăng nhập
          </button>
        </form>
        <button className={styles.logingoogle} onClick={loginwithgoogle}>
                    Đăng nhập với Google
        </button>
      </div>
    </div>
  );
}

export default Login;
