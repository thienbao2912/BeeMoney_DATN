import React, { useState, useEffect } from 'react';
import './IncomeEdit.css';
import { getCategories, updateTransaction, getTransactionById } from '../../../../../service/Transaction';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // Import useForm

const IncomeEdit = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm(); // Destructure form hooks
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoriesAndTransaction = async () => {
      try {
        if (!userId) {
          console.error('User ID is not found in local storage');
          return;
        }

        setLoading(true);

        const categoriesResponse = await getCategories('income', userId);
        setCategories(categoriesResponse.filter((category) => category.type === 'income'));

        const transactionResponse = await getTransactionById(id);
        if (transactionResponse) {
          const formattedDate = new Date(transactionResponse.date).toISOString().split('T')[0];
          setValue('date', formattedDate);
          const amountValue = transactionResponse.amount.toString().replace(/[^\d]/g, '');
          setValue('amount', formatCurrency(amountValue), { shouldValidate: true });
          setValue('description', transactionResponse.description);
          setValue('categoryId', transactionResponse.categoryId);
        }
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndTransaction();
  }, [id, userId, setValue]);

  const formatCurrency = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString('vi-VN', { minimumFractionDigits: 0 }).replace(/\./g, ',');
  };

  const unformatCurrency = (value) => value.replace(/[^\d]/g, '');

  const handleAmountInput = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    if (!rawValue) {
      setValue('amount', '', { shouldValidate: true });
      return;
    }

    const formattedValue = formatCurrency(rawValue);
    setValue('amount', formattedValue, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        amount: unformatCurrency(data.amount),
        type: 'income',
      };
      if (!payload.date || !payload.amount || !payload.categoryId) {
        throw new Error('Missing required fields');
      }

      await updateTransaction(id, payload);
      navigate('/income/list');
    } catch (err) {
      setError('Failed to update transaction. Please try again later.');
    }
  };

  const handleCategorySelect = (categoryId) => {
    setValue('categoryId', categoryId);
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
          <li className="breadcrumb-item active" aria-current="page">
            Sửa thu nhập
          </li>
          <li className="breadcrumb-item">
            <Link className="text-secondary" to="/income/list">
              Danh sách thu nhập
            </Link>
          </li>
        </ol>
      </nav>

      <div className="income-overview card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-row">
              <div className="form-group col">
                <label htmlFor="date">Ngày</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="form-control"
                  {...register('date', { required: 'Bắt buộc nhập ngày' })}
                />
                {errors.date && <span className="text-danger">{errors.date.message}</span>}
              </div>
              <div className="form-group col">
                <label htmlFor="amount">Số tiền</label>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  className="form-control"
                  value={getValues('amount')}
                  {...register('amount', { required: 'Số tiền là bắt buộc' })}
                  onChange={handleAmountInput}
                />
                {errors.amount && <span className="text-danger">{errors.amount.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">Ghi chú</label>
              <input
                type="text"
                id="description"
                name="description"
                className="form-control"
                {...register('description', { required: 'Ghi chú là bắt buộc' })}
              />
              {errors.description && <span className="text-danger">{errors.description.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Danh mục</label>
              <div className="category-buttons">
                {categories.length > 0 ? (
                  categories.map((category) =>
                    category && category.image ? (
                      <button
                        key={category._id}
                        className={`btn btn-secondary ${
                          category._id === getValues('categoryId') ? 'active' : ''
                        }`}
                        type="button"
                        onClick={() => handleCategorySelect(category._id)}
                      >
                        <img src={category.image} alt={category.name} />
                        <p>{category.name}</p>
                      </button>
                    ) : (
                      <p key={category._id}>Dữ liệu bị thiếu</p>
                    )
                  )
                ) : (
                  <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                )}
              </div>
              {errors.categoryId && <span className="text-danger">Hãy chọn một danh mục</span>}
            </div>

            <div className="col-12 text-center">
              <button className="btn btn-primary" type="submit">
                Cập nhật
              </button>
            </div>
          </form>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default IncomeEdit;
