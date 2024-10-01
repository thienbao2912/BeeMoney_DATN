import React, { useState, useEffect } from 'react';
import { addSavingsFund, getCategories } from '../../../../service/SavingFund';
import { getUserProfile } from '../../../../service/Auth'; // Giả sử bạn có hàm này để lấy thông tin người dùng
import './CreteSavingsFund.css'
const CreateSavingsFund = ({ onFundCreated }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [email, setEmail] = useState('');
  const [contribution, setContribution] = useState('');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Could not fetch categories. Please try again.");
      }
    };

    fetchCategories();
  }, []);
  
  const userId = localStorage.getItem('userId');
  console.log('User ID:', userId);

  // Fetch current user email
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserProfile(userId);
        console.log('User Profile:', user); 
        setEmail(user.email);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Could not fetch user information. Please try again.");
      }
    };

    fetchUser();
  }, []);

  // Validate inputs
  const validateForm = () => {
    if (!name) {
      setError("Fund name is required.");
      return false;
    }
    if (parseFloat(targetAmount) <= 0) {
      setError("Target amount must be greater than 0.");
      return false;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be greater than or equal to start date.");
      return false;
    }
    if (!categoryId) {
      setError("You must select a category.");
      return false;
    }
    if (!email) {
      setError("Email is required.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    try {
      const newFund = {
        name,
        targetAmount: parseFloat(targetAmount),
        startDate,
        endDate,
        categoryId,
        participants: [
          { 
            contribution,
            email
          }
        ]
      };
  
      console.log("Sending fund data:", newFund);
  
      const response = await addSavingsFund(newFund);
  
      console.log('Response from addSavingsFund:', response);
  
      if (response && response.data) {
        setSuccess("Fund created successfully!");
        setName('');
        setTargetAmount('');
        setStartDate('');
        setEndDate('');
        setCategoryId('');
        onFundCreated();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      setError("Error creating fund. Please try again.");
      console.error("Error creating fund:", error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="form-container">
  {error && <p className="text-danger">{error}</p>}
  {success && <p className="text-success">{success}</p>}
  
  <div className="form-group">
    <input
      type="text"
      className="custom-input"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Tên quỹ"
      required
    />
  </div>

  <div className="form-group">
    <input
      type="number"
      className="custom-input"
      value={targetAmount}
      onChange={(e) => setTargetAmount(e.target.value)}
      placeholder="Số tiền mục tiêu"
      required
    />
  </div>

  <div className="form-group">
    <input
      type="date"
      className="custom-input"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      placeholder="Start Date"
      required
    />
  </div>

  <div className="form-group">
    <input
      type="date"
      className="custom-input"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      placeholder="End Date"
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
              className={`btn btn-secondary ${category._id === categoryId ? 'active' : ''}`}
              type="button"
              key={category._id}
              onClick={() => setCategoryId(category._id)}
            >
              <img src={category.image} alt={category.name} />
              <p>{category.name}</p>
            </button>
          ) : (
            <p key={category._id}>Dữ liệu bị thiếu</p>
          )
        ))
      ) : (
        <p>Danh mục không có sẵn</p>
      )}
    </div>
  </div>

  <button type="submit" className="btn btn-primary">Tạo quỹ</button>
</form>

  );
};

export default CreateSavingsFund;
