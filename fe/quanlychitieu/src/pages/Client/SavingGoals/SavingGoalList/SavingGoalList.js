import React, { useEffect, useState } from "react";
import { getAllSavingsGoals, deleteSavingsGoal } from "../../../../service/SavingGoal";
import "./SavingGoalList.css";
import { Link } from "react-router-dom";
import EditGoalModal from "../EditGoalModal/EditGoalModal";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { useNotifications } from "../../../../components/Client/Header/NotificationContext"; // Import hook thông báo

// const ITEMS_PER_PAGE = 4;

const SavingGoalList = () => {
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    const fetchSavingsGoals = async () => {
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

        // Kiểm tra các mục tiêu còn 1 ngày
        checkSavingGoals(userId);

      } catch (error) {
        setError("Lỗi khi lấy danh sách mục tiêu tiết kiệm: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSavingsGoals();
  }, [checkSavingGoals]);

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
      const userId = localStorage.getItem("userId");
      let data = await getAllSavingsGoals(userId);

      // Lọc ra các mục tiêu chưa hết hạn
      const currentDate = new Date();
      data = data
        .filter((goal) => new Date(goal.endDate) >= currentDate)
        .map((goal) => ({
          ...goal,
          currentAmount: goal.currentAmount || 0,
          targetAmount: goal.targetAmount || 0,
        }));

      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSavingsGoals(data);
    } catch (error) {
      setError("Lỗi khi lấy danh sách mục tiêu tiết kiệm: " + error.message);
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi tháng
  };

  const filterGoalsByMonth = (goals) => {
    if (selectedMonth === "all") {
      return goals;
    }
    const month = parseInt(selectedMonth);
    return goals.filter((goal) => {
      const startDate = new Date(goal.startDate);
      const endDate = new Date(goal.endDate);
      return (
        startDate.getMonth() + 1 === month || endDate.getMonth() + 1 === month
      );
    });
  };

  const filteredGoals = filterGoalsByMonth(savingsGoals);
  const totalPages = Math.ceil(filteredGoals.length / ITEMS_PER_PAGE);
  const paginatedGoals = filteredGoals.slice(
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
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            <option value="all">Hiển thị tất cả</option>
            <option value="1">Tháng 1</option>
            <option value="2">Tháng 2</option>
            <option value="3">Tháng 3</option>
            <option value="4">Tháng 4</option>
            <option value="5">Tháng 5</option>
            <option value="6">Tháng 6</option>
            <option value="7">Tháng 7</option>
            <option value="8">Tháng 8</option>
            <option value="9">Tháng 9</option>
            <option value="10">Tháng 10</option>
            <option value="11">Tháng 11</option>
            <option value="12">Tháng 12</option>
          </select>
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
      {!loading && !error && savingsGoals.length > itemsPerPage && (
        <div className="pagination mt-4">
          <ul className="pagination justify-content-center">
            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index + 1}
                className={`page-item ${
                  currentPage === index + 1 ? "active" : ""
                }`}
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
