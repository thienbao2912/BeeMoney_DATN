import React, { useState, useEffect } from "react";
import { getUserProfile, updateUser, verifyOldPassword } from "../../../service/Auth";
import { Form, Button, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { storage } from "../../../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./Profile.css";

const ProfileForm = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [oldPassword, setOldPassword] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordMismatchError, setPasswordMismatchError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState(""); 

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(userId);
        setProfile(data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch profile");
        setLoading(false);
        console.error("Profile fetch error:", error);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPasswordMismatchError("");
    setAvatarError("");
    setOldPasswordError("");

    if (password === "" || confirmPassword === "") {
      setPasswordMismatchError(
        "Mật khẩu và xác nhận mật khẩu không được để trống!"
      );
      return;
    }

    if (password && password !== confirmPassword) {
      setPasswordMismatchError("Xác nhận mật khẩu không trùng khớp!");
      return;
    }

    try {
      const isOldPasswordValid = await verifyOldPassword(userId, oldPassword); 
      if (!isOldPasswordValid) {
        setOldPasswordError("Mật khẩu cũ không đúng!");
        return;
      }
    } catch (error) {
      setOldPasswordError("Lỗi khi kiểm tra mật khẩu cũ");
      return;
    }

    let avatarURL = profile.avatar;

    if (avatar) {
      const validFormats = ["image/jpeg", "image/png", "image/gif"];
      if (!validFormats.includes(avatar.type)) {
        setAvatarError("Vui lòng chọn file hình ảnh hợp lệ (JPEG, PNG, GIF)");
        return;
      }

      const avatarRef = ref(storage, `avatars/${userId}`);
      await uploadBytes(avatarRef, avatar);
      const timestamp = new Date().getTime(); // Thêm timestamp để tránh cache
      avatarURL = await getDownloadURL(avatarRef);
      avatarURL = `${avatarURL}?t=${timestamp}`; // Thêm chuỗi truy vấn ngẫu nhiên
    }

    const updateData = {
      name: profile.name,
      email: profile.email,
      avatar: avatarURL,
      role: profile.role,
    };

    if (password) {
      updateData.password = password;
    }

    try {
      await updateUser(userId, updateData);
      setSuccess("Profile updated successfully");
      window.location.reload();
    } catch (error) {
      setError("Failed to update profile");
      console.error("Profile update error:", error);
    }
  };

  return (
    <div className="border border-black p-2 border-opacity-10 rounded shadow-none p-4 mb-5 bg-light">
      <div className="page-header">
        <ul className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/" className="text-dark">
              Trang chủ
            </a>
          </li>
          <li className="breadcrumb-item active">Thông tin tài khoản</li>
        </ul>
        <div className="row">
          <div className="col-sm-12">
            <h4>Hồ Sơ Của Tôi</h4>
          </div>
        </div>

        {loading && (
          <div className="text-center mt-5">
            <i className="fa fa-spinner fa-spin fa-2x primary"></i>
            <p className="mt-2 primary">Loading...</p>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {profile && (
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-2">
                <img
                  src={profile.avatar || "/images/default-avatar.jpg"}
                  className="rounded-avatar"
                  alt="Avatar"
                  width="150"
                  height="150"
                />
              </div>

              <div className="col-md-10">
                <Form onSubmit={handleUpdate}>
                  <div className="row">
                    <Form.Group className="mb-3 col-md-6">
                      <Form.Label>Tên đăng nhập</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên đăng nhập..."
                        defaultValue={profile.name}
                        disabled
                      />
                    </Form.Group>

                    <Form.Group className="mb-3 col-md-6">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Nhập email..."
                        defaultValue={profile.email}
                        disabled
                      />
                    </Form.Group>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Hình ảnh</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => setAvatar(e.target.files[0])} // Cập nhật avatar khi chọn ảnh
                    />
                    {avatarError && (
                      <p className="text-danger">{avatarError}</p>
                    )}
                  </Form.Group>

                  <div className="row">
                    <Form.Group className="mb-3 col-md-6">
                      <Form.Label>Mật khẩu cũ</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Nhập mật khẩu cũ..."
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                      {oldPasswordError && (
                        <p className="text-danger">{oldPasswordError}</p>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3 col-md-6">
                      <Form.Label>Mật khẩu mới</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Nhập mật khẩu mới..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3 col-md-6">
                      <Form.Label>Xác nhận Mật khẩu</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Xác nhận mật khẩu mới..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      {passwordMismatchError && (
                        <p className="text-danger">{passwordMismatchError}</p>
                      )}
                    </Form.Group>
                  </div>

                  <Button
                    type="submit"
                    className="btn btn-primary mb-3 form-submit"
                    style={{ marginRight: "0.4rem", float: "right" }}
                  >
                    Cập nhật
                  </Button>
                </Form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
