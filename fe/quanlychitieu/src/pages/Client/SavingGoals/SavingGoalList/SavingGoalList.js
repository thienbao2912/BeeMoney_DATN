import React, { useEffect, useState, useCallback } from "react";
import { getAllSavingsGoals, deleteSavingsGoal } from "../../../../service/SavingGoal";
import "./SavingGoalList.css";
import { Link } from "react-router-dom";
import EditGoalModal from "../EditGoalModal/EditGoalModal";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { useNotifications } from "../../../../components/Client/Header/NotificationContext"; // Import hook thông báo

const SavingGoalList = () => {
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const { checkSavingGoals, handleGoalDeletion } = useNotifications(); // Sử dụng hàm kiểm tra và xóa

  // Hàm fetch dữ liệu và kiểm tra mục tiêu tiết kiệm
  const fetchSavingsGoals = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found in localStorage");
      }
      let data = await getAllSavingsGoals(userId);

      // Xử lý giá trị null và lọc ra các mục tiêu chưa hết hạn
      const currentDate = new Date();
      data = data
        .map((goal) => ({
          ...goal,
          currentAmount: goal.currentAmount || 0,
          targetAmount: goal.targetAmount || 0,
        }))
        .filter((goal) => new Date(goal.endDate) >= currentDate);

      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSavingsGoals(data);

      // Chỉ kiểm tra các mục tiêu còn 1 ngày nếu cần thiết
      await checkSavingGoals(userId);
    } catch (error) {
      setError("Lỗi khi lấy danh sách mục tiêu tiết kiệm: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []); // Thêm checkSavingGoals vào dependency

  // Sử dụng useEffect để fetch dữ liệu chỉ một lần khi component mount
  useEffect(() => {
    fetchSavingsGoals();
  }, [fetchSavingsGoals]); // fetchSavingsGoals không thay đổi giữa các lần render

  // Hàm xóa mục tiêu tiết kiệm
  const handleDelete = async (goalId) => {
    try {
      await deleteSavingsGoal(goalId);
      setSavingsGoals((prevGoals) =>
        prevGoals.filter((goal) => goal._id !== goalId)
      );
      handleGoalDeletion(goalId); // Xóa thông báo liên quan
      setConfirmationModalOpen(false);
    } catch (error) {
      setError("Error deleting saving goals: " + error.message);
    }
  };

  const openModal = (goal) => {
    setSelectedGoal(goal);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedGoal(null);
    setModalOpen(false);
  };

  const openConfirmationModal = (item) => {
    setGoalToDelete(item);
    setConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setGoalToDelete(null);
    setConfirmationModalOpen(false);
  };

  const handleUpdate = async () => {
    try {
      await fetchSavingsGoals(); // Cập nhật lại danh sách mục tiêu sau khi chỉnh sửa
    } catch (error) {
      setError("Lỗi khi cập nhật danh sách mục tiêu tiết kiệm: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <i className="fa fa-spinner fa-spin fa-2x primary"></i>
        <p className="mt-2 primary">Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  return (
    <div className="categories-overview mb-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Mục tiêu
          </li>
          <li className="breadcrumb-item">
            <Link to="/saving-goal/add" className="text-secondary">
              Thêm mục tiêu
            </Link>
          </li>
        </ol>
      </nav>
      <div className="row">
        <div className="text-center mt-4">
          <a href="/saving-goal/add" className="btn btn-primary">
            Thêm mục tiêu
          </a>
        </div>
        <div className="text-center mt-4">
          <a href="/saving-goal/past" className="btn btn-primary">
            Mục tiêu đã qua
          </a>
        </div>
      </div>
      <div className="row mt-3">
        {savingsGoals.map((goal) => {
          const percentage =
            goal.currentAmount != null && goal.targetAmount != null
              ? (goal.currentAmount / goal.targetAmount) * 100
              : 0;
          let progressBarClass;

          if (percentage < 25) {
            progressBarClass = "bg-danger";
          } else if (percentage >= 25 && percentage <= 50) {
            progressBarClass = "bg-warning";
          } else {
            progressBarClass = "bg-success";
          }

          return (
            <div className="col-md-6 mb-3" key={goal._id}>
              <div className="income-overview card">
                <div className="card-body">
                  <div className="category-target d-flex align-items-center mb-3">
                    <img
                      src={goal.categoryId?.image || "/images/no.png"}
                      alt={goal.categoryId?.name || "Không tồn tại"}
                      width="50px"
                    />
                    <h5>{goal.name}</h5>
                  </div>

                  <div className="date-saving text-secondary mb-3">
                    <i className="fas fa-calendar-alt me-2"></i>
                    {new Date(goal.startDate).toLocaleDateString()} -{" "}
                    {new Date(goal.endDate).toLocaleDateString()}
                  </div>
                  <div className="money text-secondary mb-3">
                    <i className="fa-solid fa-sack-dollar me-2"></i>
                    {goal.currentAmount != null
                      ? goal.currentAmount.toLocaleString()
                      : "0"}
                    đ -{" "}
                    {goal.targetAmount != null
                      ? goal.targetAmount.toLocaleString()
                      : "0"}
                    đ
                  </div>
                  <div className="progress-container mb-3">
                    <div
                      className={`progress-bar ${progressBarClass}`}
                      role="progressbar"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                      <span className="progress-percentage">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>

                  {percentage >= 100 ? (
                    <div className="completion-message text-success d-flex align-items-center mb-2">
                      <i className="fa fa-check-circle me-2"></i>
                      Hoàn thành
                    </div>
                  ) : (
                    <div className="remaining-percentage-message text-warning d-flex align-items-center mb-2">
                      <i className="fa fa-exclamation-circle me-2"></i>
                      Còn lại: {Math.floor(100 - percentage)}%
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center">
                    {percentage < 100 && (
                      <button
                        className="btn btn-primary"
                        onClick={() => openModal(goal)}
                      >
                        Nạp tiền
                      </button>
                    )}

                    <div className="bg-action ms-auto">
                      <Link
                        to={`/saving-goal/edit/${goal._id}`}
                        className="me-2"
                        aria-label="Edit"
                      >
                        <i className="fa fa-edit text-success" />
                      </Link>
                      <i
                        className="fa fa-trash text-danger ms-auto"
                        onClick={() => openConfirmationModal(goal)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {isModalOpen && selectedGoal && (
        <EditGoalModal
          goal={selectedGoal}
          onClose={closeModal}
          onUpdate={handleUpdate}
        />
      )}

      {isConfirmationModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={closeConfirmationModal}
          onConfirm={() => {
            if (goalToDelete) handleDelete(goalToDelete._id);
          }}
          message={`Bạn có chắc chắn muốn xóa mục tiêu <span class="primary">${goalToDelete?.name}</span> ?`}
        />
      )}
    </div>
  );
};

export default SavingGoalList;
