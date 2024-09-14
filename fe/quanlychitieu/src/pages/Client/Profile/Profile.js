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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAvatarError("");

    let avatarURL = profile.avatar;

    if (avatar) {
      const validFormats = ["image/jpeg", "image/png", "image/gif"];
      if (!validFormats.includes(avatar.type)) {
        setAvatarError("Vui lòng chọn file hình ảnh hợp lệ (JPEG, PNG, GIF)");
        return;
      }

      const avatarRef = ref(storage, `avatars/${userId}`);
      await uploadBytes(avatarRef, avatar);
      const timestamp = new Date().getTime(); 
      avatarURL = await getDownloadURL(avatarRef);
      avatarURL = `${avatarURL}?t=${timestamp}`; 
    }

    const updateData = {
      name: profile.name,
      email: profile.email,
      avatar: avatarURL,
      role: profile.role,
    };

    try {
      await updateUser(userId, updateData);
      setSuccess("Thông tin cập nhật thành công");
      window.location.reload();
    } catch (error) {
      setError("Có lỗi khi cập nhật thông tin");
      console.error("Profile update error:", error);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPasswordMismatchError("");
    setOldPasswordError("");
  
    // Kiểm tra mật khẩu cũ và mật khẩu mới có hợp lệ không
    if (password === "" || confirmPassword === "") {
      setPasswordMismatchError("Mật khẩu và xác nhận mật khẩu không được để trống!");
      return;
    }
  
    if (password !== confirmPassword) {
      setPasswordMismatchError("Xác nhận mật khẩu không trùng khớp!");
      return;
    }
  
    try {
      // Xác thực mật khẩu cũ
      const isOldPasswordValid = await verifyOldPassword(userId, oldPassword); 
      if (!isOldPasswordValid) {
        setOldPasswordError("Mật khẩu cũ không đúng!");
        return;
      }
    } catch (error) {
      setOldPasswordError("Lỗi khi kiểm tra mật khẩu cũ");
      return;
    }
  
    // Chỉ cập nhật mật khẩu mà không thay đổi các thông tin khác
    const updateData = {
      name: profile.name,        // Giữ lại tên hiện có
      email: profile.email,      // Giữ lại email hiện có
      avatar: profile.avatar,    // Giữ lại avatar hiện có
      role: profile.role,        // Giữ lại role hiện có
      password: password         
    };
  
    try {
      await updateUser(userId, updateData); 
      setSuccess("Cập nhật mật khẩu thành công");
      window.location.reload();
    } catch (error) {
      setError("Cập nhật mật khẩu thất bại");
      console.error("Password update error:", error);
    }
  };
  
  return (
    <div className="border border-black p-2 border-opacity-10 rounded shadow-none p-4 mb-5 bg-light">
      <div className="page-header">
        <ul className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/" className="text-dark">Trang chủ</a>
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
          <>
            {/* Profile Update Form */}
            <div className="card-body">
              <h5>Cập nhật Thông tin Cá nhân</h5>
              <Form onSubmit={handleProfileUpdate}>
                <div className="row">
                  <Form.Group className="mb-3 col-md-6">
                    <Form.Label>Tên đăng nhập</Form.Label>
                    <Form.Control type="text" defaultValue={profile.name} disabled />
                  </Form.Group>
                  <Form.Group className="mb-3 col-md-6">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" defaultValue={profile.email} disabled />
                  </Form.Group>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Hình ảnh</Form.Label>
                  <Form.Control type="file" onChange={(e) => setAvatar(e.target.files[0])} />
                  {avatarError && <p className="text-danger">{avatarError}</p>}
                </Form.Group>

                <Button type="submit" className="btn btn-primary mb-3 form-submit">
                  Cập nhật
                </Button>
              </Form>
            </div>

            {/* Password Update Form */}
            <div className="card-body">
              <h5>Cập nhật Mật khẩu</h5>
              <Form onSubmit={handlePasswordUpdate}>
                <div className="row">
                  <Form.Group className="mb-3 col-md-6">
                    <Form.Label>Mật khẩu cũ</Form.Label>
                    <Form.Control type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                    {oldPasswordError && <p className="text-danger">{oldPasswordError}</p>}
                  </Form.Group>

                  <Form.Group className="mb-3 col-md-6">
                    <Form.Label>Mật khẩu mới</Form.Label>
                    <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </Form.Group>

                  <Form.Group className="mb-3 col-md-6">
                    <Form.Label>Xác nhận Mật khẩu</Form.Label>
                    <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    {passwordMismatchError && <p className="text-danger">{passwordMismatchError}</p>}
                  </Form.Group>
                </div>

                <Button type="submit" className="btn btn-primary mb-3 form-submit">
                  Cập nhật Mật khẩu
                </Button>
              </Form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
