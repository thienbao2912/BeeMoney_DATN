import React, { useState, useEffect } from 'react';
import './ExpenseAdd.css';
import { getAllTransactions, addTransaction, getCategories } from '../../../../../service/Transaction';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const forbiddenWords = ['Chết', 'Ma Túy', 'Khùng', 'Buôn lậu']; 

const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const normalizeText = (text) => {
  return removeAccents(text).toLowerCase().replace(/\s+/g, ''); 
};

const containsForbiddenWords = (value) => {
  const normalizedValue = normalizeText(value);
  return forbiddenWords.some(word => normalizedValue.includes(normalizeText(word)));
};

const ExpenseAdd = () => {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem('userId');
  const today = new Date().toISOString().split('T')[0]; 

  const { register, handleSubmit, setValue, watch, formState: { errors }, clearErrors } = useForm({
    defaultValues: {
      date: today,
      amount: '',
      description: '',
      categoryId: ''
    }
  });

  const categoryId = watch('categoryId');
  const amount = watch('amount');

  useEffect(() => {
    const fetchCategoriesAndExpenses = async () => {
      setLoading(true);
      try {
        const categoriesResponse = await getCategories('expense', userId);
        console.log('Categories Response:', categoriesResponse);

        if (Array.isArray(categoriesResponse)) {
          const filteredCategories = categoriesResponse.filter(category => category.type === 'expense');
          console.log('Filtered Categories:', filteredCategories);
          setCategories(filteredCategories);
        } else {
          console.error('Expected an array but got:', categoriesResponse);
        }

        const expensesResponse = await getAllTransactions('expense', userId);
        console.log('Expenses Response:', expensesResponse);
        setExpenses(expensesResponse || []);
      } catch (err) {
        console.error('Error fetching data:', err.response ? err.response.data : err.message);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndExpenses();
  }, [userId]);

  useEffect(() => {
    if (amount && amount.trim() !== '') {
      clearErrors('amount');
    }
  }, [amount, clearErrors]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        amount: unformatCurrency(data.amount),
        type: 'expense'
      };
      console.log('Submitting payload:', payload);

      if (!payload.date || !payload.amount || !payload.categoryId) {
        throw new Error('Missing required fields');
      }

      const response = await addTransaction(payload);
      console.log('Response:', response);
      setValue('date', today); 
      setValue('amount', '');
      setValue('description', '');
      setValue('categoryId', '');

      const expensesResponse = await getAllTransactions('expense', userId);
      setExpenses(expensesResponse || []);
    } catch (err) {
      console.error('Error adding expense:', err.response ? err.response.data : err.message);
      setError('Failed to add expense. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return Number(value).toLocaleString('vi-VN');
  };

  const unformatCurrency = (value) => {
    return value.replace(/[^\d]/g, '');
  };

  const handleAmountChange = (e) => {
   
    const value = e.target.value.replace(/[^\d]/g, '');
    setValue('amount', formatCurrency(value), { shouldValidate: true });
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <i className="fa fa-spinner fa-spin fa-2x primary"></i>
        <p className="mt-2 primary">Loading...</p>
      </div>
    );
  }

  // Sort expenses by date (most recent first) and limit to top 5
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="categories-overview">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">Thêm chi tiêu</li>
          <li className="breadcrumb-item">
            <Link className='text-secondary' to="/expense/list">Danh sách chi tiêu</Link>
          </li>
        </ol>
      </nav>

      <div className="row mt-3">
        <div className="col-md-6 mb-3">
          <div className="expense-overview card">
            <div className="card-body">
              <div className="col-md-auto col-12 d-flex justify-content-center d-flex gap-2">
                <Link className="btn btn-primary" to='/expense/add'>Chi tiêu</Link>
                <Link className="btn btn-outline-primary" to='/income/add'>Thu nhập</Link>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-row">
                  <div className="form-group col">
                    <label htmlFor="date">Ngày</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="form-control"
                      {...register('date', { required: 'Ngày là bắt buộc' })}
                    />
                    {errors.date && <p className="text-danger">{errors.date.message}</p>}
                  </div>
                  <div className="form-group col">
                    <label htmlFor="amount">Số tiền</label>
                    <input
                      type="text"
                      id="amount"
                      name="amount"
                      className="form-control"
                      {...register('amount', { required: 'Số tiền là bắt buộc' })}
                      onInput={handleAmountChange}
                    />
                    {errors.amount && <p className="text-danger">{errors.amount.message}</p>}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="description">Ghi chú</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    className="form-control"
                    {...register('description', {
                      required: 'Ghi chú là bắt buộc',
                      validate: value =>
                        !containsForbiddenWords(value) || 'Ghi chú chứa từ cấm',
                    })}
                  />
                  {errors.description && <p className="text-danger">{errors.description.message}</p>}
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
                    <button
                      className="category-btn category-button"
                      type="button"
                    >
                      <Link
                        className="text-dark d-flex align-items-center justify-content-center"
                        to="/add-category"
                        style={{ textDecoration: 'none' }}
                      >
                        <img src='../images/add.png' alt="Add" style={{ marginRight: '5px' }} />
                        Thêm
                      </Link>
                    </button>
                  </div>

                </div>

                <div className="col-md-auto col-12 d-flex justify-content-center">
                  <button className="btn btn-primary w-100 text-center" type="submit">Thêm chi tiêu</button>
                </div>
              </form>
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="expense-overview card">
            <div className="card-body">
              <Link className="text-secondary" to="/expense/list">Xem tất cả chi tiêu</Link>
              {sortedExpenses.length > 0 ? (
                sortedExpenses.map(expense => (
                  <div className="history-details d-flex px-2 py-1 align-items-center justify-content-between mt-4" key={expense._id}>
                    <div className="mr-3 d-flex align-items-center">
                      {expense.categoryId && expense.categoryId.image ? (
                        <img
                          src={expense.categoryId.image}
                          alt={expense.categoryId.name}
                          className=""
                          width="50"
                          height="50"
                        />
                      ) : (
                        <div className="placeholder-image" style={{ width: '50px', height: '50px' }} />
                      )}
                    </div>
                    <div className="text-center flex-grow-1">
                      <h6 className="mb-0">{expense.description}</h6>
                      <p className="text-danger mb-0">- {Number(expense.amount).toLocaleString()}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-secondary mb-0">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center primary mt-4">
                  <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                  <p>Chưa có chi tiêu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseAdd;
