import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategories, getSavingsGoalById, updateSavingsGoal } from '../../../../service/SavingGoal';

const SavingGoalEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userId] = useState(localStorage.getItem('userId'));
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    startDate: '',
    endDate: '',
    categoryId: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesAndSavingGoal = async () => {
      try {
        if (!userId) {
          console.error('User ID is not found in local storage');
          setLoading(false);
          return;
        }

        setLoading(true);

        const categoriesResponse = await getCategories(userId);
        setCategories(categoriesResponse);

        const savingGoalResponse = await getSavingsGoalById(id);

        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        };

        setFormData({
          name: savingGoalResponse.name,
          targetAmount: formatCurrency(savingGoalResponse.targetAmount),
          currentAmount: formatCurrency(savingGoalResponse.currentAmount !== null ? savingGoalResponse.currentAmount : 0),
          startDate: formatDate(savingGoalResponse.startDate),
          endDate: formatDate(savingGoalResponse.endDate),
          categoryId: savingGoalResponse.categoryId,
        });

      } catch (error) {
        console.error('Error fetching categories or saving goal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndSavingGoal();
  }, [id, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategorySelect = (categoryId) => {
    setFormData({ ...formData, categoryId });
  };

  const handleAmountInput = (e) => {
    const { name, value } = e.target;
    const rawValue = value.replace(/[^\d]/g, '');
    const formattedValue = formatCurrency(rawValue);
    setFormData({ ...formData, [name]: formattedValue });
  };

  const formatCurrency = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    return Number(value).toLocaleString('vi-VN');
  };

  const unformatCurrency = (value) => {
    return value.replace(/[^\d]/g, '');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Tên mục tiêu không được để trống';
    }

    if (!formData.targetAmount || unformatCurrency(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Số tiền mục tiêu phải lớn hơn 0';
    }

    if (unformatCurrency(formData.currentAmount) < 0) {
      newErrors.currentAmount = 'Số tiền hiện tại không được nhỏ hơn 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.dateRange = 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        ...formData,
        currentAmount: unformatCurrency(formData.currentAmount),
        targetAmount: unformatCurrency(formData.targetAmount),
        type: 'expense'
      };

      if (!id) {
        throw new Error('Goal ID is undefined');
      }

      const updatedGoal = await updateSavingsGoal(id, payload);
      console.log('Updated savings goal:', updatedGoal);

      navigate('/saving-goal/list');
    } catch (error) {
      console.error('Error updating savings goal:', error);
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
  return (
    <div className="container">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a className='text-secondary' href="/saving-goal/list">Mục tiêu</a></li>
          <li className="breadcrumb-item active" aria-current="page">Sửa mục tiêu</li>
        </ol>
      </nav>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Tên mục tiêu</label>
              <input
                type="text"
                id="name"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              {errors.name && <p className="text-danger">{errors.name}</p>}
            </div>
            <div className="form-row">
              <div className="form-group col">
                <label htmlFor="targetAmount" className="form-label">Số tiền mục tiêu</label>
                <input
                  type="text"
                  id="targetAmount"
                  className="form-control"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleAmountInput}
                />
                {errors.targetAmount && <p className="text-danger">{errors.targetAmount}</p>}
              </div>
              <div className="form-group col">
                <label htmlFor="currentAmount" className="form-label">Số tiền tiết kiệm</label>
                <input
                  type="text"
                  id="currentAmount"
                  className="form-control"
                  name="currentAmount"
                  value={formData.currentAmount}
                  onChange={handleAmountInput}
                />
                {errors.currentAmount && <p className="text-danger">{errors.currentAmount}</p>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col">
                <label htmlFor="startDate" className="form-label">Ngày bắt đầu</label>
                <input
                  type="date"
                  id="startDate"
                  className="form-control"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
                {errors.startDate && <p className="text-danger">{errors.startDate}</p>}
              </div>
              <div className="form-group col">
                <label htmlFor="endDate" className="form-label">Ngày kết thúc</label>
                <input
                  type="date"
                  id="endDate"
                  className="form-control"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
                {errors.endDate && <p className="text-danger">{errors.endDate}</p>}
              </div>
            </div>
            {errors.dateRange && <p className="text-danger">{errors.dateRange}</p>}

            <div className="form-group">
              <label htmlFor="category">Danh mục</label>
              <div className="category-buttons">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    category && category.image ? (
                      <button
                        key={category._id}
                        className={`btn btn-secondary ${category._id === formData.categoryId ? 'active' : ''}`}
                        type="button"
                        onClick={() => handleCategorySelect(category._id)}
                      >
                        <img src={category.image} alt={category.name} />
                        <p>{category.name}</p>
                      </button>
                    ) : (
                      <p key={category._id}>Dữ liệu bị thiếu</p>
                    )
                  ))
                ) : (
                  <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                )}
              </div>
            </div>

            <div className="col-12 text-center">
              <button className="btn btn-primary" type="submit">Cập nhật</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SavingGoalEdit;
