import React, { useState, useEffect } from "react";
import { getAllBudgets, deleteBudget } from "../../../service/Budget"; // Import service functions
import ConfirmationModal from "../SavingGoals/ConfirmationModal/ConfirmationModal";
import EditBudgetModal from "../Budget/edit-budget/edit-budget"; // Import modal chỉnh sửa ngân sách
import "./budget.css"; // Import the CSS file

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [itemsPerPage] = useState(4);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal chỉnh sửa
  const [budgetToEdit, setBudgetToEdit] = useState(null); // Ngân sách được chọn để chỉnh sửa

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("Người dùng chưa xác thực");
        }
        let response = await getAllBudgets(userId);

        const currentDate = new Date();
        response = response
          .filter((budget) => new Date(budget.endDate) >= currentDate)
          .map((budget) => ({
            ...budget,
            amount: budget.amount || 0,
            remainingBudget: budget.remainingBudget || 0,
          }));

        response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (selectedMonth !== "all") {
          const selectedMonthNumber = parseInt(selectedMonth, 10);
          response = response.filter((budget) => {
            const startDate = new Date(budget.startDate);
            const endDate = new Date(budget.endDate);
            const startMonth = startDate.getMonth() + 1;
            const endMonth = endDate.getMonth() + 1;

            return (
              startMonth === selectedMonthNumber ||
              endMonth === selectedMonthNumber
            );
          });
        }
        setBudgets(response);
      } catch (err) {
        setError(err.message);
        console.error("Lỗi khi lấy tất cả ngân sách:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgets();
  }, [selectedMonth]);

  const handleDelete = async (budgetId) => {
    try {
      await deleteBudget(budgetId);
      setConfirmationModalOpen(false);
      setBudgets((prev) => prev.filter((budget) => budget._id !== budgetId)); // Cập nhật danh sách sau khi xóa
    } catch (err) {
      setError("Error deleting budget");
      console.error("Error deleting budget:", err); // Log error
    }
  };

  const openEditModal = (budget) => {
    setBudgetToEdit(budget);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setBudgetToEdit(null);
    setIsEditModalOpen(false);
  };

  const openConfirmationModal = (goalId) => {
    setGoalToDelete(goalId);
    setConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setGoalToDelete(null);
    setConfirmationModalOpen(false);
  };

  const calculatePercentageRemaining = (budget) => {
    const totalAmount = budget.amount || 1; // Ensure not to divide by 0
    const remaining = budget.remainingBudget >= 0 ? budget.remainingBudget : 0;
    return ((remaining / totalAmount) * 100).toFixed(0);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi tháng
  };
  const indexOfLastBudget = currentPage * itemsPerPage;
  const indexOfFirstBudget = indexOfLastBudget - itemsPerPage;
  const currentBudgets = budgets.slice(indexOfFirstBudget, indexOfLastBudget);

  const totalPages = Math.ceil(budgets.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="categories-overview">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Ngân sách
          </li>
          <li className="breadcrumb-item">
            <a href="/add-budget" className="text-dark">
              Thêm ngân sách
            </a>
          </li>
        </ol>
      </nav>
      <div className="row">
        <div className="text-center mt-4">
          <a href="/add-budget" className="btn btn-primary">
            Thêm ngân sách
          </a>
        </div>
        <div className="text-center mt-4">
          <a href="/past-budget" className="btn btn-primary">
            Ngân sách đã qua
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
      {isLoading && (
        <div className="text-center mt-5">
          <i className="fa fa-spinner fa-spin fa-2x primary"></i>
          <p className="mt-2 primary">Loading...</p>
        </div>
      )}

      {!isLoading && !error && currentBudgets.length > 0 && (
        <div className="row mt-3">
          {currentBudgets.map((budget) => (
            <div key={budget._id} className="col-md-6 mb-3">
              <div className="income-overview card">
                <div className="card-body">
                  <div className="category-info">
                    {budget.categoryId ? (
                      <>
                        <img
                          src={budget.categoryId.image}
                          alt={budget.categoryId.name || "Category"}
                          className="category-image me-2"
                        />
                        <h5 className="mb-0">{budget.categoryId.name}</h5>
                      </>
                    ) : (
                      <div className="category-info-placeholder me-2">
                        <span>Danh mục đã biến mất!</span>
                      </div>
                    )}
                  </div>
                  <div className="date">
                    <div className="text-secondary mb-0">
                      <i className="fas fa-calendar-alt"></i>
                      {`${new Intl.DateTimeFormat("vi-VN").format(
                        new Date(budget.startDate)
                      )} - ${new Intl.DateTimeFormat("vi-VN").format(
                        new Date(budget.endDate)
                      )}`}
                    </div>
                  </div>
                  <div className="amount">
                    <span className="text-secondary d-block text-end font-weight-bold">
                      Ngân sách:{" "}
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(budget.amount)}
                    </span>
                    <span
                      className={`d-block text-end ${
                        budget.remainingBudget >= 0
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {budget.remainingBudget >= 0 ? (
                        <>
                          Còn lại:{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(budget.remainingBudget)}
                        </>
                      ) : (
                        <>
                          Đã vượt quá ngân sách:{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Math.abs(budget.remainingBudget))}
                        </>
                      )}
                    </span>
                  </div>

                  <div className="progress-wrapper">
                    <div className="progress">
                      <div
                        className={`progress-bar ${
                          budget.remainingBudget <= 0
                            ? "bg-danger" // Full red if remaining budget is 0 or less
                            : calculatePercentageRemaining(budget) < 50
                            ? "bg-warning" // Yellow if below 50%
                            : "bg-success" // Green if above 50%
                        }`}
                        style={{
                          width:
                            budget.remainingBudget <= 0
                              ? "100%"
                              : `${calculatePercentageRemaining(budget)}%`, // Full width if 0%
                        }}
                        role="progressbar"
                        aria-valuenow={calculatePercentageRemaining(budget)}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span className="progress-percentage">
                      {calculatePercentageRemaining(budget)}%
                    </span>
                  </div>

                  <div style={{float:"right"}} className="bg-action ms-auto">
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => openEditModal(budget)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openConfirmationModal(budget._id)}
                    >
                      <i className="fas fa-trash ms-auto"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && !error && currentBudgets.length === 0 && (
        <div className="text-center mt-3">Không có ngân sách nào.</div>
      )}

      {error && (
        <div className="text-center mt-3">
          <p className="text-danger">Error loading data: {error}</p>
        </div>
      )}

      {budgets.length > itemsPerPage && (
        <div className="pagination-wrapper mt-4">
          <ul className="pagination justify-content-center">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <li
                  key={page}
                  className={`page-item ${
                    page === currentPage ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              )
            )}
          </ul>
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={() => handleDelete(goalToDelete)}
        title="Xóa ngân sách"
        message="Bạn có chắc chắn muốn xóa ngân sách này không?"
      />

      {isEditModalOpen && budgetToEdit && (
        <EditBudgetModal
          budget={budgetToEdit}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          setBudgets={setBudgets}
        />
      )}
    </div>
  );
};

export default Budget;
