import React, { useState, useEffect } from "react";
import { updateBudget } from "../../../../service/Budget";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditBudgetModal = ({ budget, isOpen, onClose, setBudgets }) => {
  const [name, setName] = useState(budget.name);
  const [amount, setAmount] = useState(budget.amount || 0);
  const [remainingBudget, setRemainingBudget] = useState(budget.remainingBudget || 0);
  const [repeat, setRepeat] = useState(budget.repeat || false); // Đảm bảo rằng repeat lấy giá trị từ budget
  const [startDate, setStartDate] = useState(budget.startDate);
  const [endDate, setEndDate] = useState(budget.endDate);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Khi budget thay đổi, cập nhật lại các giá trị state
  useEffect(() => {
    setName(budget.name);
    setAmount(budget.amount || 0);
    setRemainingBudget(budget.remainingBudget || 0);
    setRepeat(budget.repeat || false);
    setStartDate(budget.startDate);
    setEndDate(budget.endDate);
  }, [budget]); // Dependency array giúp cập nhật khi budget thay đổi

  useEffect(() => {
    setRemainingBudget(budget.remainingBudget + (amount - budget.amount));
  }, [amount, budget.remainingBudget, budget.amount]);

  const handleUpdate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedBudget = {
        ...budget,
        name,
        amount,
        remainingBudget,
        startDate,
        endDate,
        repeat
      };

      await updateBudget(budget._id, updatedBudget);

      setBudgets((prevBudgets) => {
        const existingBudgetIndex = prevBudgets.findIndex(
          (b) => b._id === updatedBudget._id
        );

        if (existingBudgetIndex !== -1) {
          return [
            ...prevBudgets.slice(0, existingBudgetIndex),
            updatedBudget,
            ...prevBudgets.slice(existingBudgetIndex + 1),
          ];
        }

        return [...prevBudgets, updatedBudget];
      });

      // Thêm thông báo thành công
      toast.success("Cập nhật ngân sách thành công!");

      onClose();
    } catch (err) {
      setError("Lỗi khi cập nhật ngân sách");
      console.error("Error updating budget:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa ngân sách</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger">{error}</p>}
        <form>
          <div className="form-group">
            <label htmlFor="name">Tên ngân sách</label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Số tiền ngân sách</label>
            <input
              type="number"
              className="form-control"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Ngày bắt đầu</label>
            <input
              type="date"
              className="form-control"
              id="startDate"
              value={startDate.slice(0, 10)}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">Ngày kết thúc</label>
            <input
              type="date"
              className="form-control"
              id="endDate"
              value={endDate.slice(0, 10)}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <div>
              {/* <label htmlFor="repeat">Lặp lại</label> */}
              <input
                type="checkbox"
                id="repeat"
                checked={repeat}
                onChange={(e) => setRepeat(e.target.checked)}
                className="form-check-input"
              />
              <span className="form-check-label"> Lặp lại ngân sách</span>
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </Modal.Footer>
      <ToastContainer />
    </Modal>
  );
};

export default EditBudgetModal;
