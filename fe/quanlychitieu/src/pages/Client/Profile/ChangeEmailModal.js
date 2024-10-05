import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import { updateUser } from "../../../service/Auth";

const ChangeEmailModal = ({ show, handleClose, userId, profile }) => {
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailMismatchError, setEmailMismatchError] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setEmailMismatchError("");

    if (newEmail === "" || confirmEmail === "") {
      setEmailMismatchError("Email và xác nhận email không được để trống!");
      return;
    }

    if (newEmail !== confirmEmail) {
      setEmailMismatchError("Xác nhận email không trùng khớp!");
      return;
    }

    const updateData = {
      ...profile,
      email: newEmail,
    };

    try {
      await updateUser(userId, updateData);
      setSuccess("Cập nhật email thành công");
      localStorage.removeItem("userId");
      localStorage.removeItem("token"); 
      navigate("/login");
    } catch (error) {
      setError("Cập nhật email thất bại");
      console.error("Email update error:", error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Thay đổi email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleEmailUpdate}>
          <Form.Group className="mb-3">
            <Form.Label>Email mới</Form.Label>
            <Form.Control
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Xác nhận Email</Form.Label>
            <Form.Control
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
            {emailMismatchError && <p className="text-danger">{emailMismatchError}</p>}
          </Form.Group>

          <Button type="submit" className="btn btn-primary mb-3">
            Cập nhật 
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChangeEmailModal;
