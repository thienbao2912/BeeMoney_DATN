import React, { useState, useEffect } from "react";
import { updateBudget } from "../../../../service/Budget"; 
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const EditBudgetModal = ({ budget, isOpen, onClose, setBudgets }) => {
  const [amount, setAmount] = useState(budget.amount || 0);
  const [remainingBudget, setRemainingBudget] = useState(budget.remainingBudget || 0);
  const [startDate, setStartDate] = useState(budget.startDate);
  const [endDate, setEndDate] = useState(budget.endDate);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setRemainingBudget(budget.remainingBudget + (amount - budget.amount));
  }, [amount, budget.remainingBudget, budget.amount]);

  const handleUpdate = async () => {
    setIsLoading(true);
    setError(null);

    try {
        const updatedBudget = {
          ...budget,
          amount,
          remainingBudget,
          startDate,
          endDate,
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
    
        onClose();
      } catch (err) {
        setError("Error updating budget");
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
    </Modal>
  );
};

export default EditBudgetModal;
