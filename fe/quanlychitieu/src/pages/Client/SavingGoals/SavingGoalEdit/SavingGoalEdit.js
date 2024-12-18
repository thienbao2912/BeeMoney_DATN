import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

        const categoriesResponse = await getCategories("expense", userId);
        setCategories(
          categoriesResponse.filter((category) => category.type === "expense")
        );

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = [];
    if (!formData.name.trim()) {
      errors.push('Tên quỹ không được bỏ trống!');
    }
    if (!formData.targetAmount) {
      errors.push('Số tiền mục tiêu không được bỏ trống!');
    }
    if (!formData.startDate) {
      errors.push('Ngày bắt đầu không được bỏ trống!');
    }
    if (!formData.endDate) {
      errors.push('Ngày kết thúc không được bỏ trống!');
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.push('Ngày bắt đầu không được lớn hơn ngày kết thúc!');
    }
      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
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
      navigate('/saving-goal/list');
      toast.success('Cập nhật thành công!');
    } catch (error) {
       toast.error('Cập nhật thất bại, vui lòng thử lại!');
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
                  disabled
                />
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
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="category">Danh mục</label>
              <div className="custom-category-grid-edit">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <button
                      key={category._id}
                      className={`custom-category-btn ${category._id === formData.categoryId ? 'active' : ''}`}
                      type="button"
                      onClick={() => handleCategorySelect(category._id)}
                    >
                      <img src={category.image} alt={category.name} />
                      <p>
                        {category.name.length > 17
                          ? `${category.name.substring(0, 17)}...`
                          : category.name}
                      </p>
                    </button>
                  ))
                ) : (
                  <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                )}
              </div>
            </div>

            <div className="text-end">
              <button className="btn btn-primary me-2" type="submit">Cập nhật</button>
               <Link className="btn btn-secondary" to={`/saving-goal/list`}>Quay lại</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SavingGoalEdit;
