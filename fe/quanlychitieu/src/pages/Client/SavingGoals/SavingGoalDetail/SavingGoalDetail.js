import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCategories, getSavingsGoalById } from '../../../../service/SavingGoal';
import { FaHistory } from 'react-icons/fa';
import EditGoalModal from "../EditGoalModal/EditGoalModal";

const SavingGoalDetail = () => {
  const { id } = useParams();
  const [userId] = useState(localStorage.getItem('userId'));
  const [categories, setCategories] = useState([]);
  const [savingGoal, setSavingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategoriesAndSavingGoal = async () => {
      try {
        if (!userId) {
          console.error('User ID is not found in local storage');
          return;
        }

        setLoading(true);

        const categoriesResponse = await getCategories(userId);
        setCategories(categoriesResponse);

        const savingGoalResponse = await getSavingsGoalById(id);
        setSavingGoal(savingGoalResponse);
      } catch (error) {
        console.error('Error fetching categories or saving goal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndSavingGoal();
  }, [id, userId]);

  const handleSaveTransaction = (newAmount) => {
    const parsedAmount = parseFloat(newAmount);

    if (isNaN(parsedAmount)) {
      console.error("Invalid amount");
      return;
    }

    setSavingGoal((prevGoal) => {
      const updatedAmount = (parseFloat(prevGoal.currentAmount) || 0) + parsedAmount;

      return {
        ...prevGoal,
        currentAmount: updatedAmount,
        transactionHistory: [
          ...prevGoal.transactionHistory,
          { amount: parsedAmount, date: new Date().toISOString() },
        ],
      };
    });
  };


  const openModal = (goal) => {
    setSelectedGoal(goal);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedGoal(null);
    setModalOpen(false);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <i className="fa fa-spinner fa-spin fa-2x primary"></i>
        <p className="mt-2 primary">Loading...</p>
      </div>
    );
  }

  if (!savingGoal) {
    return <p className="text-center">Không tìm thấy thông tin mục tiêu tiết kiệm.</p>;
  }

  const formatCurrency = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    return Number(value).toLocaleString('vi-VN');
  };

  const progressPercentage = (savingGoal.currentAmount / savingGoal.targetAmount) * 100;

  return (
    <div className="saving-goal-detail-container">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a className="text-secondary" href="/saving-goal/list">Mục tiêu</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Chi tiết mục tiêu</li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-md-7 mb-3">
          <div className="card saving-goal-card shadow-sm">
            <div className="card-body">
              <div className="form-group mb-3">
                <label className="form-label text-muted">
                  <i className="bi bi-ticket-detailed-fill" style={{ padding: '0.4rem', backgroundColor: 'lightBlue', color: 'white', borderRadius: '0.2rem' }}></i> Tên mục tiêu
                </label>
                <p className="text-secondary fw-bold ms-5">
                  {savingGoal.name}
                </p>
                <label className="form-label text-muted">
                  <i className="bi bi-coin" style={{ padding: '0.4rem', backgroundColor: 'lightBlue', color: 'white', borderRadius: '0.2rem' }}></i> Số tiền
                </label>
                <p className="text-secondary fw-bold ms-5">
                  {formatCurrency(savingGoal.currentAmount)} đ / {formatCurrency(savingGoal.targetAmount)} đ
                </p>
              </div>
              <div className="form-group mb-3">
                <label className="form-label text-muted">
                  <i className="bi bi-alarm-fill" style={{ padding: '0.4rem', backgroundColor: 'lightBlue', color: 'white', borderRadius: '0.2rem' }}></i> Thời gian
                </label>
                <p className="text-secondary ms-5">
                  {new Date(savingGoal.startDate).toLocaleDateString('vi-VN')} - {new Date(savingGoal.endDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="form-group mb-3">
                <label className="form-label text-muted">
                  <i className="bi bi-tags-fill" style={{ padding: '0.4rem', backgroundColor: 'lightBlue', color: 'white', borderRadius: '2.5rem' }}></i> Danh mục
                </label>
                {categories.length > 0 && categories.map((category) => (
                  category._id === savingGoal.categoryId ? (
                    <div key={category._id} className="category-item d-flex align-items-center ms-5">
                      <img src={category.image || 'placeholder.jpg'} alt={category.name} style={{ width: '50px', height: '50px' }} />
                      <p className="mb-0 text-secondary fw-bold">{category.name}</p>
                    </div>
                  ) : null
                ))}
              </div>
              <div className="progress-wrapper d-flex align-items-center mt-2">
                <span className="text-muted small me-2">{Math.round(progressPercentage)}%</span>
                <div className="progress flex-grow-1">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${Math.min(progressPercentage, 100)}%`,
                      backgroundColor: `hsl(${Math.min(progressPercentage, 100) * 1.2}, 100%, 50%)`,
                    }}
                  >
                  </div>
                </div>
              </div>
              {progressPercentage < 100 && (
                <button
                  className="btn btn-primary"
                  onClick={() => openModal(savingGoal)}
                >
                  Nạp tiền
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-5 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 text-secondary">
              <FaHistory /> Lịch sử nạp tiền
            </h6>
          </div>
          <div className="card transaction-history-card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-items-center">
                  <tbody>
                    {savingGoal.transactionHistory.length > 0 ? (
                      savingGoal.transactionHistory.map((transaction, index) => (
                        <tr key={index}>
                          <td>
                            <h6 className="text-success mb-0">+ {formatCurrency(transaction.amount)} đ</h6>
                          </td>
                          <td className="text-end">
                            <h6 className="text-secondary mb-0">{new Date(transaction.date).toLocaleDateString('vi-VN')}</h6>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center">Không có giao dịch nào được ghi lại.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {isModalOpen && selectedGoal && (
            <EditGoalModal
              goal={selectedGoal}
              onClose={closeModal}
              onUpdate={handleSaveTransaction}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default SavingGoalDetail;
