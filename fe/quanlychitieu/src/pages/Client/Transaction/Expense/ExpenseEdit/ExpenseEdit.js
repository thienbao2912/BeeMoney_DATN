import React, { useState, useEffect } from 'react';
import './ExpenseEdit.css';
import { getCategories, updateTransaction, getTransactionById } from '../../../../../service/Transaction';
import { Link, useParams, useNavigate } from 'react-router-dom';

const ExpenseEdit = () => {
  const { id } = useParams(); // Get the transaction ID from the URL params
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [categories, setCategories] = useState([]);
  const [transaction, setTransaction] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    description: '',
    categoryId: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchCategoriesAndTransaction = async () => {
      try {
        if (!userId) {
          console.error('User ID is not found in local storage');
          return;
        }

        setLoading(true); // Start loading

        const categoriesResponse = await getCategories('expense', userId);
        console.log('Categories Response:', categoriesResponse);

        if (Array.isArray(categoriesResponse)) {
          const filteredCategories = categoriesResponse.filter(category => category.type === 'expense');
          console.log('Filtered Categories:', filteredCategories);
          setCategories(filteredCategories);
        } else {
          console.error('Expected an array but got:', categoriesResponse);
        }

        const transactionResponse = await getTransactionById(id);
        console.log('Transaction Response:', transactionResponse);

        if (transactionResponse) {
          // Ensure transactionResponse.date is formatted as yyyy-mm-dd
          const formattedDate = new Date(transactionResponse.date).toISOString().split('T')[0];
          setTransaction(transactionResponse);
          setFormData({
            date: formattedDate,
            amount: formatCurrency(transactionResponse.amount),
            description: transactionResponse.description,
            categoryId: transactionResponse.categoryId
          });
        } else {
          console.error('Transaction data is missing');
        }
      } catch (err) {
        console.error('Error fetching data:', err.response ? err.response.data : err.message);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchCategoriesAndTransaction();
  }, [id, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategorySelect = (categoryId) => {
    setFormData({ ...formData, categoryId });
  };

  const handleAmountInput = (e) => {
    // Allow only numbers and format the value as currency
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    const formattedValue = formatCurrency(rawValue);
    setFormData({ ...formData, amount: formattedValue });
  };
  const formatCurrency = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString('vi-VN');
  };

  const unformatCurrency = (value) => {
    return value.replace(/[^\d]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: unformatCurrency(formData.amount), type: 'expense' };
      console.log('Submitting payload:', payload);

      if (!payload.date || !payload.amount || !payload.categoryId) {
        throw new Error('Missing required fields');
      }

      await updateTransaction(id, payload);
      console.log('Transaction updated successfully');
      navigate('/expense/list'); // Redirect to the list page after update
    } catch (err) {
      console.error('Error updating transaction:', err.response ? err.response.data : err.message);
      setError('Failed to update transaction. Please try again later.');
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
          <li className="breadcrumb-item active" aria-current="page">Sửa chi tiêu</li>
          <li className="breadcrumb-item">
            <Link className='text-secondary' to="/expense/list">Danh sách chi tiêu</Link>
          </li>
        </ol>
      </nav>

      <div className="income-overview card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group col">
                <label htmlFor="date">Ngày</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group col">
                <label htmlFor="amount">Số tiền</label>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  className="form-control"
                  value={formData.amount}
                  onChange={handleAmountInput}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">Ghi chú</label>
              <input
                type="text"
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

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
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default ExpenseEdit;
