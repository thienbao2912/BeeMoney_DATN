import React, { useState, useEffect } from 'react';
import {  getAllBudgets, deleteBudget } from '../../../../service/Budget'; // Import service functions
import ConfirmationModal from '../../SavingGoals/ConfirmationModal/ConfirmationModal'; 
import './past-budget.css'; 

const PastBudget = () => {
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState(null);
    const [itemsPerPage] = useState(8); 
    const [selectedMonth, setSelectedMonth] = useState('all');

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    throw new Error('User not authenticated');
                }
                const response = await getAllBudgets(userId);
                console.log('API Response:', response);
                if (response) {
                    const currentDate = new Date();
                    let filteredBudgets = response.filter(budget => {
                        const endDate = new Date(budget.endDate);
                        const oneDayAfterEnd = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
                        return currentDate > oneDayAfterEnd;
                    });
    
                    if (selectedMonth !== 'all') {
                        filteredBudgets = filteredBudgets.filter(budget => {
                            const startDate = new Date(budget.startDate);
                            const endDate = new Date(budget.endDate);
                            const month = parseInt(selectedMonth);
                            return (startDate.getMonth() + 1 === month || endDate.getMonth() + 1 === month);
                        });
                    }
    
                    setBudgets(filteredBudgets);
                } else {
                    throw new Error('Invalid response structure');
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching all budgets:', err);
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
            window.location.reload();
        } catch (err) {
            setError('Error deleting budget');
            console.error('Error deleting budget:', err); 
        }
    };
    const openConfirmationModal = (goalId) => {
        setGoalToDelete(goalId);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setGoalToDelete(null);
        setConfirmationModalOpen(false);
    }
    const calculatePercentageRemaining = (budget) => {
        const totalAmount = budget.amount || 1; 
        const remaining = budget.remainingBudget >= 0 ? budget.remainingBudget : 0;
        return ((remaining / totalAmount) * 100).toFixed(0);
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
        setCurrentPage(1);
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
                    <li className="breadcrumb-item active" aria-current="page">Ngân sách</li>
                    <li className="breadcrumb-item">
                        <a href="/add-budget" className='text-dark'>Thêm ngân sách</a>
                    </li>
                </ol>
            </nav>
            <div className="row">
            <div className="text-center mt-4">
                <a href="/budget" className="btn btn-primary">
                    Danh sách ngân sách
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
                    {currentBudgets.map(budget => (
                        <div key={budget._id} className="col-md-6 mb-3">
                        <div className="income-overview card">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="category-info d-flex align-items-center">
                                {budget.categoryId ? (
                                  <>
                                    <img
                                      src={budget.categoryId.image}
                                      alt={budget.categoryId.name || "Category"}
                                      className="category-image me-2"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <h5 className="mb-0">{budget.categoryId.name}</h5>
                                  </>
                                ) : (
                                  <div className="category-info-placeholder me-2">
                                    <span>Danh mục đã biến mất!</span>
                                  </div>
                                )}
                              </div>
                      
                              <div className="amount text-end">
                                <span className="text-secondary d-block font-weight-bold">
                                  Ngân sách:{" "}
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(budget.amount)}
                                </span>
                                <span
                                  className={`d-block ${
                                    budget.remainingBudget >= 0 ? "text-success" : "text-danger"
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
                            </div>
                      
                            <div className="date text-secondary mb-3">
                              <i className="fas fa-calendar-alt"></i>{" "}
                              {`${new Intl.DateTimeFormat("vi-VN").format(
                                new Date(budget.startDate)
                              )} - ${new Intl.DateTimeFormat("vi-VN").format(
                                new Date(budget.endDate)
                              )}`}
                            </div>
                      
                            <div className="progress-wrapper mb-3">
                              <div className="progress">
                                <div
                                  className={`progress-bar ${
                                    budget.remainingBudget <= 0
                                      ? "bg-danger"
                                      : calculatePercentageRemaining(budget) < 50
                                      ? "bg-warning"
                                      : "bg-success"
                                  }`}
                                  style={{
                                    width:
                                      budget.remainingBudget <= 0
                                        ? "100%"
                                        : `${calculatePercentageRemaining(budget)}%`,
                                  }}
                                  role="progressbar"
                                  aria-valuenow={calculatePercentageRemaining(budget)}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                >
                                  {calculatePercentageRemaining(budget)}%
                                </div>
                              </div>
                            </div>
                      
                            <div className="d-flex justify-content-between align-items-center mt-3">
                              <a
                                href={`/budget-detail/${budget._id}`}
                                className="chitiet text-primary font-weight-bold"
                              >
                                Xem chi tiết
                              </a>
                              <div style={{ cursor: "pointer" }} className="d-flex">
                                <i
                                  onClick={() => openConfirmationModal(budget._id)}
                                  className="fas text-danger fa-trash ms-auto"
                                ></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      
                    ))}
                </div>
            )}

            {error && (
                <div className="text-danger text-center">
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && !error && budgets.length > itemsPerPage && (
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
                        if (goalToDelete) handleDelete(goalToDelete);
                    }}
                    message="Bạn có chắc chắn muốn xóa mục tiêu này?"
                />
            )}
        </div>
    );
};

export default PastBudget;
