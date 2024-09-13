import React, { useEffect, useState } from "react";
import {
  getAllSavingsGoals,
  deleteSavingsGoal,
} from "../../../../service/SavingGoal";
import "./PassSaving.css";
import { Link } from "react-router-dom";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

const ITEMS_PER_PAGE = 4;

const PassSaving = () => {
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  useEffect(() => {
    const fetchSavingsGoals = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("User ID not found in localStorage");
        }
        let data = await getAllSavingsGoals(userId);
  
        // Xử lý giá trị null và lọc mục tiêu đã quá hạn ít nhất 1 ngày
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 1); // Lùi lại 1 ngày
        data = data
          .map((goal) => ({
            ...goal,
            currentAmount: goal.currentAmount || 0,
            targetAmount: goal.targetAmount || 0,
          }))
          .filter((goal) => new Date(goal.endDate) < currentDate);
  
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSavingsGoals(data);
      } catch (error) {
        setError("Lỗi khi lấy mục tiêu tiết kiệm: " + error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSavingsGoals();
  }, []);

  const handleDelete = async (goalId) => {
    try {
      await deleteSavingsGoal(goalId);
      setSavingsGoals((prevGoals) =>
        prevGoals.filter((goal) => goal._id !== goalId)
      );
      setConfirmationModalOpen(false);
    } catch (error) {
      setError("Error deleting saving goals: " + error.message);
    }
  };

  const openConfirmationModal = (item) => {
    setGoalToDelete(item);
    setConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setGoalToDelete(null);
    setConfirmationModalOpen(false);
  };

  const totalPages = Math.ceil(savingsGoals.length / ITEMS_PER_PAGE);
  const paginatedGoals = savingsGoals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
            <Link to="/saving-goal/past" className="text-secondary">
              Mục tiêu đã qua
            </Link>
          </li>
        </ol>
      </nav>
      <div className="row">
        <div className="text-center mt-4">
          <a href="/saving-goal/list" className="btn btn-primary">
            Danh sách mục tiêu
          </a>
        </div>
      </div>
      <div className="row mt-3">
        {paginatedGoals.map((goal) => {
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
                    <div className="bg-action ms-auto">
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
      {!loading && !error && savingsGoals.length > itemsPerPage && (
                <div className="pagination mt-4">
                    <ul className="pagination justify-content-center">
                        {[...Array(totalPages)].map((_, index) => (
                            <li
                                key={index + 1}
                                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                            >
                                <a
                                    className="page-link"
                                    href="#!"
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
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

export default PassSaving;
