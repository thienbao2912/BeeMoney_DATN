import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import './SavingGoalAdd.css';
import { getCategories, addSavingsGoal, getAllSavingsGoals } from '../../../../service/SavingGoal';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const forbiddenWords = ['Chết', 'Ma Túy', 'Khùng', 'Buôn lậu'];

const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
const truncateText = (text, maxLength) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
const normalizeText = (text) => {
  return removeAccents(text).toLowerCase().replace(/\s+/g, '');
};

const containsForbiddenWords = (value) => {
  const normalizedValue = normalizeText(value);
  return forbiddenWords.some(word => normalizedValue.includes(normalizeText(word)));
};

const SavingGoalAdd = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

  const { register, handleSubmit, setValue, watch, setError, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      startDate: today.toISOString().split('T')[0], 
      endDate: tomorrow.toISOString().split('T')[0],
      categoryId: ''
    }
  });

  const [categories, setCategories] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSavingsGoals, setLoadingSavingsGoals] = useState(false);
  const [error, setErrorMessage] = useState(null);
  const [globalError, setGlobalError] = useState(null);


  const userId = localStorage.getItem('userId');
  const categoryId = watch('categoryId');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    const fetchCategoriesAndSavingsGoals = async () => {
      setLoadingSavingsGoals(true)
      try {
        const categoriesData = await getCategories('expense', userId);
        const filteredCategories = categoriesData.filter(category => category.type === 'expense');
        setCategories(filteredCategories);

        const savingsGoalsData = await getAllSavingsGoals(userId);
        setSavingsGoals(savingsGoalsData || []);
      } catch (error) {
        setErrorMessage('Lỗi hiển thị danh mục');
        console.error('Lỗi hiển thị danh mục', error);
      } finally {
        setLoadingSavingsGoals(false)
      }
    };

    fetchCategoriesAndSavingsGoals();
  }, [userId]);

  const validateEndDate = (value) => {
    return new Date(startDate) <= new Date(value) || 'Ngày kết thúc phải sau ngày bắt đầu';
  };

  <input
    type="date"
    id="endDate"
    {...register('endDate', { required: 'Ngày kết thúc là bắt buộc', validate: validateEndDate })}
  />


  const formatCurrency = (value) => {
    return Number(value).toLocaleString('vi-VN');
  };

  const unformatCurrency = (value) => {
    if (typeof value === 'string') {
      return value.replace(/[^\d]/g, '');
    }
    return '';
  };

  const handleAmountChange = (e) => {
    let value = e.target.value;
    if (typeof value === 'string') {
      value = unformatCurrency(value);
      if (Number(value) < 0) {
        e.target.value = formatCurrency(0);
      } else {
        e.target.value = formatCurrency(value);
      }
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const targetAmount = unformatCurrency(formData.targetAmount);
    // Kiểm tra số tiền mục tiêu phải ít nhất 10,000đ
    if (targetAmount < 10000) {
      toast.warning('Số tiền mục tiêu phải ít nhất 10,000đ');
      setLoading(false);
      return;
    }
    const name = formData.name.trim();
    const nameRegex = /[a-zA-Z]/; // Biểu thức chính quy kiểm tra chữ cái
    if (!name || name.length < 3 || !nameRegex.test(name)) {
      toast.warning('Tên mục tiêu phải có ít nhất 3 ký tự và chứa ít nhất một chữ cái');
      setLoading(false);
      return;
    }
      const selectedCategoryId = formData.categoryId;
      if (!selectedCategoryId) {
        toast.warning('Chưa chọn danh mục');
        setLoading(false);
        return;
      }
      const currentAmount = unformatCurrency(formData.currentAmount) || '0';
      const payload = {
        ...formData,
        targetAmount: unformatCurrency(formData.targetAmount),
        currentAmount: currentAmount.toString(),
      };

      await addSavingsGoal(payload);
      toast.success('Thêm mục tiêu tiết kiệm thành công');
      reset();

      const updatedSavingsGoals = await getAllSavingsGoals(userId);
      setSavingsGoals(updatedSavingsGoals || []);
    } catch (error) {
      setGlobalError('Lỗi thêm mục tiêu tiết kiệm');
      console.error('Lỗi thêm mục tiêu tiết kiệm:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loadingSavingsGoals) {
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
                      className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                      {...register('startDate', { required: 'Ngày bắt đầu là bắt buộc' })}
                      min={today.toISOString().split('T')[0]}
                    />
                    {errors.startDate && <div className="invalid-feedback">{errors.startDate.message}</div>}
                  </div>
                  <div className="form-group col">
                    <label htmlFor="endDate">Ngày kết thúc</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                      {...register('endDate', { required: 'Ngày kết thúc là bắt buộc' })}
                      min={today.toISOString().split('T')[0]}
                    />
                    {errors.endDate && <div className="invalid-feedback">{errors.endDate.message}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="name">Tên mục tiêu</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    {...register('name', {
                      required: 'Tên mục tiêu là bắt buộc',
                      validate: value =>
                        !containsForbiddenWords(value) || 'Tên mục tiêu chứa từ cấm',
                    })}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                </div>
                <div className="form-row">
                  <div className="form-group col">
                    <label htmlFor="targetAmount">Số tiền mục tiêu</label>
                    <input
                      type="text"
                      id="targetAmount"
                      name="targetAmount"
                      className={`form-control ${errors.targetAmount ? 'is-invalid' : ''}`}
                      {...register('targetAmount', {
                        required: 'Số tiền mục tiêu là bắt buộc'
                      })}
                      onInput={handleAmountChange}
                    />
                    {errors.targetAmount && <div className="invalid-feedback">{errors.targetAmount.message}</div>}
                  </div>
                  <div className="form-group col">
                    <label htmlFor="currentAmount">Số tiền tiết kiệm</label>
                    <input
                      type="text"
                      id="currentAmount"
                      name="currentAmount"
                      className={`form-control ${errors.currentAmount ? 'is-invalid' : ''}`}
                      {...register('currentAmount', { required: 'Số tiền nạp là bắt buộc' })}
                      onChange={handleAmountChange}
                    />
                    {errors.currentAmount && <div className="invalid-feedback">{errors.currentAmount.message}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="category">Danh mục</label>
                  <div className="custom-category-grid">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        category && category.image ? (
                          <button
                            className={`custom-category-btn ${category._id === categoryId ? 'active' : ''}`}
                            type="button"
                            key={category._id}
                            onClick={() => setValue('categoryId', category._id)}
                          >
                            <img src={category.image} alt={category.name} />
                            <p>
                              {category.name.length > 17
                                ? `${category.name.substring(0, 17)}...`
                                : category.name}
                            </p>
                          </button>
                        ) : (
                          <p key={category._id}>Không thể tải danh mục</p>
                        )
                      ))
                    ) : (
                      <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                    )}
                    <Link className="custom-category-btn text-dark" type="button" to="/add-category" style={{ textDecoration: 'none' }}>

                      <img src="../images/add.png" alt="Add" />
                      <p>Thêm</p>

                    </Link>
                  </div>
                </div>
                <div className="col-md-auto col-12 d-flex justify-content-center">
                  <button className="btn btn-primary w-100 text-center" type="submit" disabled={loading}>
                    {loading ? 'Đang thêm...' : 'Thêm mục tiêu'}
                  </button>

                </div>
              </form>

              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
    <div className="income-overview card">
        <div className="card-body">
            <h5 className="mb-4">Danh sách mục tiêu tiết kiệm</h5>
            {loadingSavingsGoals ? (
                <div className="text-center mt-5">
                    <i className="fa fa-spinner fa-spin fa-2x primary"></i>
                    <p className="mt-2 primary">Loading...</p>
                </div>
            ) : savingsGoals.length > 0 ? (
                <div className="row mt-3">
                    {savingsGoals
                        .filter(goal => new Date(goal.endDate) >= new Date()) // lọc mục tiêu chưa hết hạn
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // sắp xếp theo ngày tạo
                        .slice(0, 4) // hiển thị 3 mục tiêu mới nhất
                        .map(goal => (
                            <div key={goal._id} className="col-md-12 mb-3">
                                <div className="budget-card card">
                                    <div className="card-body d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            {goal.categoryId && goal.categoryId.image ? (
                                                <img
                                                    src={goal.categoryId.image}
                                                    alt={goal.categoryId.name}
                                                    className="category-image"
                                                />
                                            ) : (
                                                <div className="placeholder-image" />
                                            )}
                                            <div className="ml-3">
                                                <h6 className="mb-0">{truncateText(goal.name || 'Danh mục mục tiêu', 20)}</h6>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-success mb-0">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(goal.targetAmount)}
                                            </p>
                                            <p className="text-secondary mb-0">
                                                {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    <div className="text-right mt-3">
                        <Link to="/saving-goal/list" className="btn btn-link">Xem tất cả mục tiêu</Link>
                    </div>
                </div>
            ) : (
                <div className="text-center primary mt-4">
                    <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                    <p>Chưa có mục tiêu tiết kiệm</p>
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
