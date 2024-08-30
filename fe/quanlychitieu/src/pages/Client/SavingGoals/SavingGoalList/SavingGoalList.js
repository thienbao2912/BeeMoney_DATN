import React, { useEffect, useState } from 'react';
import { getAllSavingsGoals, deleteSavingsGoal } from '../../../../service/SavingGoal';
import './SavingGoalList.css';
import { Link } from 'react-router-dom';
import EditGoalModal from '../EditGoalModal/EditGoalModal';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

const ITEMS_PER_PAGE = 4;

const SavingGoalList = () => {
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchSavingsGoals = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    throw new Error('User ID not found in localStorage');
                }
                let data = await getAllSavingsGoals(userId);

                // Xử lý giá trị null
                data = data.map(goal => ({
                    ...goal,
                    currentAmount: goal.currentAmount || 0,
                    targetAmount: goal.targetAmount || 0
                }));

                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setSavingsGoals(data);
            } catch (error) {
                setError('Error fetching savings goals: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSavingsGoals();
    }, []);

    const handleDelete = async (goalId) => {
        try {
            await deleteSavingsGoal(goalId);
            setSavingsGoals(prevGoals => prevGoals.filter(goal => goal._id !== goalId));
            setConfirmationModalOpen(false);
        } catch (error) {
            setError('Error deleting saving goals: ' + error.message);
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
            const userId = localStorage.getItem('userId');
            const data = await getAllSavingsGoals(userId);
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setSavingsGoals(data);
        } catch (error) {
            setError('Error fetching savings goals: ' + error.message);
        }
    };

    const totalPages = Math.ceil(savingsGoals.length / ITEMS_PER_PAGE);
    const paginatedGoals = savingsGoals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
        <div className="container mt-4 categories-overview">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active" aria-current="page">Mục tiêu</li>
                    <li className="breadcrumb-item">
                        <Link to="/saving-goal/add" className='text-secondary'>Thêm mục tiêu</Link>
                    </li>
                </ol>
            </nav>
            <h3>Quản lý mục tiêu</h3>
            <div className="text-center mt-4">
                <a href="/saving-goal/add" className="btn btn-primary">
                     Thêm mục tiêu
                </a>
            </div>
            <div className="row mt-4">
                {paginatedGoals.map(goal => {
                    const percentage = (goal.currentAmount != null && goal.targetAmount != null) ?
                        (goal.currentAmount / goal.targetAmount) * 100 : 0;
                    let progressBarClass;

                    if (percentage < 25) {
                        progressBarClass = 'bg-danger';
                    } else if (percentage >= 25 && percentage <= 50) {
                        progressBarClass = 'bg-warning';
                    } else {
                        progressBarClass = 'bg-success';
                    }

                    return (
                        <div className="col-md-6 mb-3" key={goal._id}>
                            <div className="income-overview card">
                                <div className="card-body">
                                    <div className="category-target d-flex align-items-center mb-3">
                                        <img
                                            src={goal.categoryId?.image || '/images/no.png'}
                                            alt={goal.categoryId?.name || 'Không tồn tại'}
                                            width="50px"
                                        />
                                        <h5>{goal.name}</h5>
                                    </div>

                                    <div className="date-saving text-secondary mb-3">
                                        <i className="fas fa-calendar-alt me-2"></i>
                                        {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                                    </div>
                                    <div className="money text-secondary mb-3">
                                        <i className="fa-solid fa-sack-dollar me-2"></i>
                                        {goal.currentAmount != null ? goal.currentAmount.toLocaleString() : '0'}đ -  {goal.targetAmount != null ? goal.targetAmount.toLocaleString() : '0'}đ
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
                                        <button className="btn btn-primary" onClick={() => openModal(goal)}>Nạp tiền</button>

                                        <div className="bg-action ms-auto">
                                        <Link to={`/saving-goal/edit/${goal._id}`} className="me-2" aria-label="Edit">
                                                        <i className="fa fa-edit text-success" />
                                                    </Link>
                                        <i className="fa fa-trash text-danger ms-auto" onClick={() => openConfirmationModal(goal)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {totalPages > 1 && (
    <div className="pagination">
        <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
            disabled={currentPage === 1}
        >
            Trước
        </button>
        <span className="mx-2">{currentPage} / {totalPages}</span>
        <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))}
            disabled={currentPage === totalPages}
        >
          Sau
        </button>
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
