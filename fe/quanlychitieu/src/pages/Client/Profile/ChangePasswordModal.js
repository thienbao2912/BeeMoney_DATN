import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { verifyOldPassword, updateUser } from "../../../service/Auth";

const ChangePasswordModal = ({ show, handleClose, userId, profile }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatchError, setPasswordMismatchError] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPasswordMismatchError("");
    setOldPasswordError("");

    if (password === "" || confirmPassword === "") {
      setPasswordMismatchError("Mật khẩu và xác nhận mật khẩu không được để trống!");
      return;
    }

    if (password !== confirmPassword) {
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

    const updateData = {
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      role: profile.role,
      password: password,
    };

    try {
      await updateUser(userId, updateData);
      setSuccess("Cập nhật mật khẩu thành công");
      handleClose();
      window.location.reload();
    } catch (error) {
      setError("Cập nhật mật khẩu thất bại");
      console.error("Password update error:", error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Thay đổi mật khẩu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handlePasswordUpdate}>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu cũ</Form.Label>
            <Form.Control
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            {oldPasswordError && <p className="text-danger">{oldPasswordError}</p>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Xác nhận Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordMismatchError && <p className="text-danger">{passwordMismatchError}</p>}
          </Form.Group>

          <Button type="submit" className="btn btn-primary mb-3">
            Cập nhật 
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChangePasswordModal;
