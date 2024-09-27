import React, { useState, useEffect } from 'react';
import './IncomeAdd.css';
import { getAllTransactions, addTransaction, getCategories } from '../../../../../service/Transaction';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const forbiddenWords = ['Chết', 'Ma Túy', 'Khùng'];

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


const IncomeAdd = () => {
  const [categories, setCategories] = useState([]);
  const [incomes, setIncomes] = useState([]);
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
    const fetchCategoriesAndIncomes = async () => {
      setLoading(true);
      try {
        const categoriesResponse = await getCategories('income', userId);
        console.log('Categories Response:', categoriesResponse);

        if (Array.isArray(categoriesResponse)) {
          const filteredCategories = categoriesResponse.filter(category => category.type === 'income');
          console.log('Filtered Categories:', filteredCategories);
          setCategories(filteredCategories);
        } else {
          console.error('Expected an array but got:', categoriesResponse);
        }

        const incomesResponse = await getAllTransactions('income', userId);
        console.log('Incomes Response:', incomesResponse);
        setIncomes(incomesResponse || []);
      } catch (err) {
        console.error('Error fetching data:', err.response ? err.response.data : err.message);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndIncomes();
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
            date: new Date(data.date).toISOString(),
            type: 'income'
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

        const incomesResponse = await getAllTransactions('income', userId);
        setIncomes(incomesResponse || []);
    } catch (err) {
        console.error('Error adding income:', err.response ? err.response.data : err.message);
        setError('Failed to add income. Please try again later.');
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

  const handleAmountInput = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    const formattedValue = formatCurrency(rawValue);
    setValue('amount', formattedValue, { shouldValidate: true });
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <i className="fa fa-spinner fa-spin fa-2x primary"></i>
        <p className="mt-2 primary">Loading...</p>
      </div>
    );
  }

  // Sort incomes by date (most recent first) and limit to top 5
  const sortedIncomes = [...incomes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="categories-overview">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">Thêm thu nhập</li>
          <li className="breadcrumb-item">
            <Link className='text-secondary' to="/income/list">Danh sách thu nhập</Link>
          </li>
        </ol>
      </nav>

      <div className="row mt-3">
        <div className="col-md-6 mb-3">
          <div className="income-overview card">
            <div className="card-body">
              <div className="col-md-auto col-12 d-flex justify-content-center d-flex gap-2">
                <Link className="btn btn-outline-primary" to='/expense/add'>Chi tiêu</Link>
                <Link className="btn btn-primary" to='/income/add'>Thu nhập</Link>
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
                      onInput={handleAmountInput}
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
                      className="btn btn-secondary"
                      type="button"
                    >
                      <Link
                        className="text-dark d-flex align-items-center"
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
                  <button className="btn btn-primary w-100 text-center" type="submit">Thêm thu nhập</button>
                </div>
              </form>
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="income-overview card">
            <div className="card-body">
              <Link className="text-secondary" to="/income/list">Xem tất cả thu nhập</Link>
              {sortedIncomes.length > 0 ? (
                sortedIncomes.map(income => (
                  <div className="history-details d-flex px-2 py-1 align-items-center justify-content-between mt-4" key={income._id}>
                    <div className="mr-3 d-flex align-items-center">
                      {income.categoryId && income.categoryId.image ? (
                        <img
                          src={income.categoryId.image}
                          alt={income.categoryId.name}
                          className="category-image"
                          width="50"
                          height="50"
                        />
                      ) : (
                        <div className="placeholder-image" style={{ width: '50px', height: '50px' }} />
                      )}
                    </div>
                    <div className="text-center flex-grow-1">
                      <h6 className="mb-0">{income.description}</h6>
                      <p className="text-success mb-0">+ {Number(income.amount).toLocaleString()}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-secondary mb-0">{new Date(income.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center primary mt-4">
                  <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                  <p>Chưa có thu nhập</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeAdd;
