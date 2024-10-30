import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCategories, getSavingsGoalById } from '../../../../service/SavingGoal';
import { FaMoneyBillWave, FaCalendarAlt, FaFolderOpen, FaHistory } from 'react-icons/fa';

const SavingGoalDetail = () => {
  const { id } = useParams();
  const [userId] = useState(localStorage.getItem('userId'));
  const [categories, setCategories] = useState([]);
  const [savingGoal, setSavingGoal] = useState(null);
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

  const progressPercentage = (savingGoal.currentAmount / savingGoal.targetAmount) * 100 ;

  return (
    <div className="categories-overview">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a className='text-secondary' href="/saving-goal/list">Mục tiêu</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Chi tiết mục tiêu</li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-md-7 mb-3">
          <div className="card">
           
              <h5 className="card-header">{savingGoal.name}</h5>
              <div className="card-body">
              <div className="form-group">
                <label className="form-label"><FaMoneyBillWave /> Số tiền</label>
                <p>{formatCurrency(savingGoal.targetAmount)} đ - {formatCurrency(savingGoal.currentAmount)} đ</p>
              </div>
              <div className="form-group">
                <label className="form-label"><FaCalendarAlt /> Thời gian:</label>
                <p>{new Date(savingGoal.startDate).toLocaleDateString('vi-VN')} - {new Date(savingGoal.endDate).toLocaleDateString('vi-VN')}</p> 
              </div>
              <div className="form-group">
                <label className="form-label"><FaFolderOpen /> Danh mục:</label>
                {categories.length > 0 && categories.map((category) => (
                  category._id === savingGoal.categoryId ? (
                    <div key={category._id} className="category-item">
                      <img src={category.image || 'placeholder.jpg'} alt={category.name} width="50" height="50" />
                      <p>{category.name}</p>
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
                              style={{ width: `${progressPercentage}%` }}
                              aria-valuenow={progressPercentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </div>
            </div>
          </div>
        </div>

        <div className="col-md-5 mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-secondary"> <FaHistory />  Lịch sử nạp tiền</h6>
            </div>
          <div className="card">
            <div className="card-body">
            <div className="table-responsive">
                        <table className="table table-hover align-items-center">
                            <tbody>
              {savingGoal.transactionHistory.length > 0 ? (
              
                  savingGoal.transactionHistory.map((transaction, index) => (
                    <tr key={index}>
                
                        <td>
                      <h6 className="mb-0">{formatCurrency(transaction.amount)} đ</h6>
                    </td>
                        <td className='text-end'>
                      <h6 className="text-secondary mb-0">{new Date(transaction.date).toLocaleDateString('vi-VN')}</h6>
                    </td>
                      </tr>
                  ))
               
              ) : (
                <p className="text-center">Không có giao dịch nào được ghi lại.</p>
                
              )}
            
               </tbody>
                        </table>
                    </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingGoalDetail;
