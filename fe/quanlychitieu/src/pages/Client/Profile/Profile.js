import React, { useState, useEffect } from "react";
import { getUserProfile, updateUser } from "../../../service/Auth";
import { Form, Button, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { storage } from "../../../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ChangePasswordModal from "./ChangePasswordModal";
import ChangeEmailModal from "./ChangeEmailModal";
import "./Profile.css";

const ProfileForm = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [success, setSuccess] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userName, setUserName] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(userId);
        setProfile(data);
        setUserName(data.name);
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
      name: userName,
      email: profile.email,
      avatar: avatarURL,
      role: profile.role,
    };

    try {
      await updateUser(userId, updateData);

      setEditMode(false);
      window.location.reload();
    } catch (error) {
      setError("Có lỗi khi cập nhật thông tin");
      console.error("Profile update error:", error);
    }
  };

  const handleShowPasswordModal = () => setShowPasswordModal(true);
  const handleClosePasswordModal = () => setShowPasswordModal(false);
  const handleShowEmailModal = () => setShowEmailModal(true);
  const handleCloseEmailModal = () => setShowEmailModal(false);
  const handleUserNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleUserNameKeyPress = (e) => {
    if (e.key === "Enter") {
      setEditMode(false);
      handleProfileUpdate(e);
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
        <div className="d-flex justify-content-between">
          <h4>Hồ Sơ Của Tôi</h4>
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
            <div className="card-body">
              <h5>Cập nhật Thông tin Cá nhân</h5>
              <Form onSubmit={handleProfileUpdate}>
                <div className="row">
                  <div className="col-md-4 d-flex flex-column align-items-center">
                    <img
                      src={profile.avatar || "/default-avatar.png"}
                      alt="Avatar"
                      className="rounded-circle mb-3"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="d-flex align-items-center">
                      {editMode ? (
                        <input
                          type="text"
                          value={userName}
                          onChange={handleUserNameChange}
                          onKeyPress={handleUserNameKeyPress}
                          className="form-control"
                          style={{ width: "auto", marginRight: "5px" }}
                        />
                      ) : (
                        <h5>{userName}</h5>
                      )}
                      <Button
                        variant="link"
                        className="edit"
                        onClick={() => setEditMode(!editMode)}
                      >
                        <i className="text-piramary fa fa-edit"></i>
                      </Button>
                    </div>
                    <a
                      href="#"
                      onClick={handleShowPasswordModal}
                      className="btn btn-link float-end"
                      style={{ textDecoration: "none" }}
                    >
                      Thay đổi mật khẩu
                    </a>
                    <a
                      href="#"
                      onClick={handleShowEmailModal} 
                      className="btn btn-link float-end"
                      style={{ textDecoration: "none" }}
                    >
                      Thay đổi email
                    </a>
                  </div>

                  <div className="col-md-8 d-flex flex-column justify-content-center">
                    <div className="row">
                      <Form.Group className="mb-3 col-md-12">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          defaultValue={profile.email}
                          disabled
                        />
                      </Form.Group>

                      <Form.Group className="mb-3 col-md-12">
                        <Form.Label>Chọn hình ảnh</Form.Label>
                        <Form.Control
                          type="file"
                          onChange={(e) => setAvatar(e.target.files[0])}
                        />
                        {avatarError && (
                          <p className="text-danger">{avatarError}</p>
                        )}
                      </Form.Group>
                    </div>

                    <Button type="submit" className="btn btn-primary mb-3">
                      Cập nhật
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          </>
        )}
      </div>

      <ChangePasswordModal
        show={showPasswordModal}
        handleClose={handleClosePasswordModal}
        userId={userId}
        profile={profile}
      />
       <ChangeEmailModal
        show={showEmailModal}
        handleClose={handleCloseEmailModal}  
        userId={userId}
        profile={profile}
      />
    </div>
  );
};

export default ProfileForm;
