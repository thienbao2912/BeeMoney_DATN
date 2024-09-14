import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import './SavingGoalAdd.css';
import { getCategories, addSavingsGoal, getAllSavingsGoals } from '../../../../service/SavingGoal';
import { Link, useNavigate } from 'react-router-dom';
const forbiddenWords = ['Chết', 'Ma Túy', 'Khùng', 'Buôn lậu']; // Add forbidden words here

const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const normalizeText = (text) => {
  return removeAccents(text).toLowerCase().replace(/\s+/g, ''); // Remove spaces
};

const containsForbiddenWords = (value) => {
  const normalizedValue = normalizeText(value);
  return forbiddenWords.some(word => normalizedValue.includes(normalizeText(word)));
};

const SavingGoalAdd = () => {
  const { register, handleSubmit, setValue, watch, setError, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      targetAmount: '', // Default as empty string
      currentAmount: 0, // Default as 0
      startDate: '',
      endDate: '',
      categoryId: ''
    }
  });
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setErrorMessage] = useState(null);

  const userId = localStorage.getItem('userId');
  const categoryId = watch('categoryId');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    const fetchCategoriesAndSavingsGoals = async () => {
      setLoading(true);
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);

        const savingsGoalsData = await getAllSavingsGoals(userId);
        setSavingsGoals(savingsGoalsData || []);
      } catch (error) {
        setErrorMessage('Failed to fetch categories or savings goals.');
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndSavingsGoals();
  }, [userId]);

  useEffect(() => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('endDate', {
        type: 'manual',
        message: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
    }
  }, [startDate, endDate, setError]);

  const formatCurrency = (value) => {
    return Number(value).toLocaleString('vi-VN');
  };

  const unformatCurrency = (value) => {
    if (typeof value === 'string') {
      return value.replace(/[^\d]/g, '');
    }
    return ''; // Return empty string if value is not a string
  };

  const handleAmountChange = (e) => {
    let value = e.target.value;
    // Ensure value is a string before processing
    if (typeof value === 'string') {
      value = unformatCurrency(value);
      if (Number(value) < 0) {
        e.target.value = formatCurrency(0); // Set to 0 if negative
      } else {
        e.target.value = formatCurrency(value);
      }
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
        // Ensure currentAmount is set to 0 if not provided
        const payload = {
            ...formData,
            targetAmount: unformatCurrency(formData.targetAmount),
            currentAmount: unformatCurrency(formData.currentAmount) || '0' // Set to '0' if empty
        };
        await addSavingsGoal(payload);
        navigate('/saving-goal/list');
        const updatedSavingsGoals = await getAllSavingsGoals(userId);
        setSavingsGoals(updatedSavingsGoals || []);
        setValue('name', '');
        setValue('targetAmount', '');
        setValue('currentAmount', '');
        setValue('startDate', '');
        setValue('endDate', '');
        setValue('categoryId', '');
    } catch (error) {
        setErrorMessage('Error adding savings goal. Please try again.');
        console.error('Error adding savings goal:', error.response ? error.response.data : error.message);
    } finally {
        setLoading(false);
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
    <div className="categories-overview">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a className="text-secondary" href="/saving-goal/list">Mục tiêu</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Thêm mục tiêu</li>
        </ol>
      </nav>
      <div className="row mt-3">
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-row">
                  <div className="form-group col">
                    <label htmlFor="startDate">Ngày bắt đầu</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      className="form-control"
                      {...register('startDate', { required: 'Ngày bắt đầu là bắt buộc' })}
                    />
                    {errors.startDate && <p className="text-danger">{errors.startDate.message}</p>}
                  </div>
                  <div className="form-group col">
                    <label htmlFor="endDate">Ngày kết thúc</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      className="form-control"
                      {...register('endDate', { required: 'Ngày kết thúc là bắt buộc' })}
                    />
                    {errors.endDate && <p className="text-danger">{errors.endDate.message}</p>}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="name">Tên mục tiêu</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    {...register('name', {
                      required: 'Tên mục tiêu là bắt buộc',
                      validate: value =>
                        !containsForbiddenWords(value) || 'Tên mục tiêu chứa từ cấm',
                    })}
                  />
                  {errors.name && <p className="text-danger">{errors.name.message}</p>}
                </div>
                <div className="form-row">
                  <div className="form-group col">
                    <label htmlFor="targetAmount">Số tiền mục tiêu</label>
                    <input
                      type="text"
                      id="targetAmount"
                      name="targetAmount"
                      className="form-control"
                      {...register('targetAmount', { required: 'Số tiền mục tiêu là bắt buộc' })}
                      onChange={handleAmountChange}
                    />
                    {errors.targetAmount && <p className="text-danger">{errors.targetAmount.message}</p>}
                  </div>
                  <div className="form-group col">
                    <label htmlFor="currentAmount">Số tiền tiết kiệm</label>
                    <input
                      type="text"
                      id="currentAmount"
                      name="currentAmount"
                      className="form-control"
                      {...register('currentAmount', { required: 'Số tiền nạp là bắt buộc' })}
                      onChange={handleAmountChange}
                    />
                    {errors.currentAmount && <p className="text-danger">{errors.currentAmount.message}</p>}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="category">Danh mục</label>
                  <div className="category-buttons">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        category && category.image ? (
                          <button
                            className={`btn btn-secondary ${category._id === categoryId ? 'active' : ''}`}
                            type="button"
                            key={category._id}
                            onClick={() => setValue('categoryId', category._id)}
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
                <div className="col-md-auto col-12 d-flex justify-content-center">
                  <button className="btn btn-primary w-100 text-center" type="submit" disabled={loading}>
                    Thêm mục tiêu
                  </button>
                </div>
              </form>

              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body">
              <Link to="/saving-goal/list" className="text-secondary">Xem tất cả mục tiêu</Link>
              {savingsGoals.length > 0 ? (
          savingsGoals
          .filter(goal => new Date(goal.endDate) >= new Date()) // Lọc bỏ các mục tiêu đã hết hạn
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sắp xếp theo ngày kết thúc giảm dần
          .slice(0, 2)
          .map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            let progressBarClass;

            if (percentage < 25) {
              progressBarClass = 'bg-danger';
            } else if (percentage >= 25 && percentage <= 50) {
              progressBarClass = 'bg-warning';
            } else {
              progressBarClass = 'bg-success';
            }

                    return (
                      <div className="card mt-4" key={goal._id}>
                        <div className="card-body">
                          <div className="category-target d-flex align-items-center mb-3">
                            <img
                              src={goal.categoryId?.image || '/images/no.png'}
                              alt={goal.categoryId?.name || 'No Image'}
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
                            {goal.currentAmount != null ? goal.currentAmount.toLocaleString() : '0'}đ -    {goal.targetAmount != null ? goal.targetAmount.toLocaleString() : '0'}đ
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
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center primary mt-4">
                  <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                  <p>Chưa có mục tiêu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingGoalAdd;
