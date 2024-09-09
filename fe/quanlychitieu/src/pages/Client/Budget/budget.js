import React, { useState, useEffect } from 'react';
import { getAllBudgets, deleteBudget } from '../../../service/Budget'; // Import service functions
import ConfirmationModal from '../SavingGoals/ConfirmationModal/ConfirmationModal'; 
import './budget.css'; // Import the CSS file
import { useNotifications } from '../../../components/Client/Header/NotificationContext'; // Import Context hook

const Budget = () => {
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState(null);
    const [itemsPerPage] = useState(4); // Number of budgets per page
    const { setNotifications } = useNotifications(); // Use notification context

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const userId = localStorage.getItem('userId'); // Get userId from localStorage
                if (!userId) {
                    throw new Error('User not authenticated');
                }
                const response = await getAllBudgets(userId);
                console.log('API Response:', response); // Log response

                if (Array.isArray(response)) {
                    setBudgets(response); // Update with valid response

                    // Check for budgets exceeding the limit
                    const notifications = response
                        .filter(budget => budget.remainingBudget < 0)
                        .map(budget => ({
                            id: budget._id,
                            title: `Ngân sách ${budget.categoryId ? budget.categoryId.name : 'Danh mục không xác định'} đã vượt quá giới hạn`,
                            date: new Intl.DateTimeFormat('vi-VN').format(new Date()),
                        }));

                    if (notifications.length > 0) {
                        setNotifications(notifications); // Set notifications
                    } else {
                        setNotifications([]); // Clear notifications
                    }
                } else {
                    throw new Error('Invalid response structure: Expected an array');
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching all budgets:', err); // Log error
            } finally {
                setIsLoading(false);
            }
        };

        fetchBudgets();
    }, [setNotifications]);

    const handleDelete = async (budgetId) => {
        try {
            await deleteBudget(budgetId);
            setConfirmationModalOpen(false);
            // Reload the page to reflect changes
            window.location.reload();
        } catch (err) {
            setError('Error deleting budget');
            console.error('Error deleting budget:', err); // Log error
        }
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

    // Pagination logic
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
                    <li className="breadcrumb-item">
                        <a href="/" className='text-dark'>Trang chủ</a>
                    </li>
                    <li className="breadcrumb-item">
                        <a href="/add-budget" className='text-dark'>Thêm ngân sách</a>
                    </li>
                </ol>
            </nav>

            <div className="text-center mt-4">
                <a href="/add-budget" className="btn btn-primary">
                    Thêm ngân sách
                </a>
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
                                    <div className="category-info">
                                        {budget.categoryId ? (
                                            <>
                                                <img
                                                    src={budget.categoryId.image}
                                                    alt={budget.categoryId.name || 'Category'}
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
                                            {`${new Intl.DateTimeFormat('vi-VN').format(new Date(budget.startDate))} - ${new Intl.DateTimeFormat('vi-VN').format(new Date(budget.endDate))}`}
                                        </div>
                                    </div>
                                    <div className="amount">
                                        <span className="text-secondary d-block text-end font-weight-bold">
                                            Ngân sách: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(budget.amount)}
                                        </span>
                                        <span className={`d-block text-end ${budget.remainingBudget >= 0 ? 'text-success' : 'text-danger'}`}>
                                            Còn lại: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(budget.remainingBudget)}
                                        </span>
                                    </div>
                                    {budget.remainingBudget >= 0 ? (
                                        <div className="progress">
                                            <div
                                                className="progress-bar bg-success"
                                                role="progressbar"
                                                style={{ width: `${calculatePercentageRemaining(budget)}%` }}
                                                aria-valuenow={calculatePercentageRemaining(budget)}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >
                                                {calculatePercentageRemaining(budget)}%
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="progress">
                                            <div
                                                className="progress-bar bg-danger"
                                                role="progressbar"
                                                style={{ width: '100%' }}
                                                aria-valuenow="100"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >
                                            </div>
                                        </div>
                                    )}
                                    <p className={`text-success font-weight-bold ${budget.remainingBudget <= 0 ? 'd-none' : ''}`}>
                                        Ngân sách còn {calculatePercentageRemaining(budget)}%
                                    </p>
                                    <p className={`text-danger font-weight-bold ${budget.remainingBudget !== 0 ? 'd-none' : ''}`}>
                                        Ngân sách đã hết
                                    </p>
                                    <p className={`text-danger font-weight-bold ${budget.remainingBudget < 0 ? '' : 'd-none'}`}>
                                        Chi tiêu vượt ngân sách
                                    </p>
                                </div>
                                <div className="card-footer d-flex justify-content-between align-items-center">
                                    <a href={`/budget-detail/${budget._id}`} className="text-secondary font-weight-bold">
                                        Xem chi tiết
                                    </a>
                                    <i
                                        className="fa fa-trash text-danger ms-auto"
                                        onClick={() => openConfirmationModal(budget._id)}
                                        style={{ cursor: 'pointer' }}
                                    />
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

export default Budget;
