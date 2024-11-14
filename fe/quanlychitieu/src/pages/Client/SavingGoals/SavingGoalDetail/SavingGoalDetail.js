import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCategories, getSavingsGoalById } from '../../../../service/SavingGoal';
import EditGoalModal from "../EditGoalModal/EditGoalModal";

const SavingGoalDetail = () => {
  const { id } = useParams();
  const [userId] = useState(localStorage.getItem('userId'));
  const [categories, setCategories] = useState([]);
  const [savingGoal, setSavingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleSaveTransaction = (newAmount, note) => {
    setSavingGoal((prevGoal) => ({
        ...prevGoal,
        currentAmount: (parseFloat(prevGoal.currentAmount) || 0) + newAmount,
        transactionHistory: [
            ...prevGoal.transactionHistory,
            { 
                amount: newAmount, 
                date: new Date().toISOString(),
                note: note 
            },
        ],
    }));
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
        <ol className="breadcrumb bg-transparent p-0">
          <li className="breadcrumb-item">
            <a className="text-secondary" href="/saving-goal/list">Mục tiêu</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Chi tiết mục tiêu</li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-md-7 mb-3">
          <div className="fw-bold text-secondary mb-2">
            <i class="bi bi-info-circle"></i> Thông tin mục tiêu
          </div>
          <div className="card">
            <div className="card-body">
              <div className="form-group mb-4">
                <label className="form-label text-muted">
                  <i className="bi bi-tags-fill icon-style"></i> Danh mục
                </label>
                {categories.length > 0 && categories.map((category) => (
                  category._id === savingGoal.categoryId && (
                    <div key={category._id} className="category-item d-flex align-items-center ms-4 mt-2">
                      <img src={category.image || 'rabbit.png'} alt={category.name} style={{ width: '50px', height: '50px' }} />
                      <p className="text-secondary fw-bold mb-0 ms-3">{category.name}</p>
                    </div>
                  )
                ))}
              </div>
              <div className="form-group mb-4">
                <label className="form-label text-muted">
                  <i className="bi bi-ticket-detailed-fill icon-style"></i> Tên mục tiêu
                </label>
                <div className="text-secondary ms-4">{savingGoal.name}</div>
              </div>

              <div className="form-group mb-2">
                <label className="form-label text-muted">
                  <i className="bi bi-coin icon-style"></i> Số tiền
                </label>
                <div className="text-secondary ms-4">
              <h6 className="text-primary">Đã tiết kiệm được: {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(savingGoal.currentAmount)}</h6>  
                 <h6 className="text-success">Mục tiêu: {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(savingGoal.targetAmount)}</h6>   
                </div>
              </div>
              <div className="progress-wrapper d-flex align-items-center mb-4">
                <span className="text-muted small me-2">{Math.round(progressPercentage)}%</span>
                <div className="progress flex-grow-1 rounded-pill">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${Math.min(progressPercentage, 100)}%`,
                      backgroundColor: `hsl(${Math.min(progressPercentage, 100) * 1.5}, 100%, ${Math.max(50 - progressPercentage * 0.1, 20)}%)`,
                    }}
                  ></div>
                </div>
              </div>


              <div className="form-group mb-2">
                <label className="form-label text-muted">
                  <i className="bi bi-alarm-fill icon-style"></i> Thời gian
                </label>
                <div className="text-secondary ms-4">
                  {new Date(savingGoal.startDate).toLocaleDateString('vi-VN')} - {new Date(savingGoal.endDate).toLocaleDateString('vi-VN')}
                </div>
              </div>
              {progressPercentage < 100 && (
                <button className="btn btn-primary mt-3" onClick={() => openModal(savingGoal)}>
                  Nạp tiền
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-5 mb-3">
          <div className="fw-bold text-secondary mb-2">
            <i class="bi bi-clock-history"></i> Lịch sử nạp tiền
          </div>

          <div className="card shadow-sm rounded" style={{ border: '1px solid #e0e0e0' }}>
  <div className="card-body" style={{ backgroundColor: '#fafbff', borderRadius: '0.5rem' }}>
    <div className="table-responsive" style={{ maxHeight: '22rem', overflowY: 'auto' }}>
      <table className="table table-hover">
        <tbody>
          {savingGoal.transactionHistory.length > 0 ? (
            savingGoal.transactionHistory.map((transaction, index) => (
              <tr key={index} className="align-middle">
                <td>
                  <h6 className="text-success mb-0">+{new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(transaction.amount)}</h6>
                  <div className="text-secondary mb-0">
                    {transaction.note}
                  </div>
                </td>
                <td className="text-end">
                  <div className="text-secondary mb-0">
                    {new Date(transaction.date).toLocaleDateString('vi-VN')}
                  </div>
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
